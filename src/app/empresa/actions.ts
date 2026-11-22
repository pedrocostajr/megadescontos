"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ValidateResult = { ok: boolean; msg: string; detail: string } | null;

const REASONS: Record<string, [string, string]> = {
  nao_encontrado: ["Código não encontrado", "Confira as letras com o cliente. O código tem o formato MDS-XXXX-XX."],
  outro_parceiro: ["Cupom de outro parceiro", "Este código foi gerado para outro estabelecimento."],
  ja_usado: ["Cupom já usado", "O cliente pode resgatar um novo cupom no celular."],
  expirado: ["Cupom expirado", "Peça para o cliente resgatar um novo cupom no celular."],
};

export async function validateCoupon(_: ValidateResult, form: FormData): Promise<ValidateResult> {
  const supabase = await createClient();
  const code = String(form.get("code") ?? "").trim().toUpperCase();
  if (!code) return { ok: false, msg: "Digite o código", detail: "O código aparece na tela do cliente." };
  const { data, error } = await supabase.rpc("validate_coupon", { p_code: code });
  if (error) return { ok: false, msg: "Não foi possível validar", detail: error.message };
  const r = data as { ok: boolean; reason?: string; discount_pct?: number; customer?: string };
  revalidatePath("/empresa");
  if (r.ok) return { ok: true, msg: `Cupom ${code} válido`, detail: `Aplique ${r.discount_pct}% de desconto para ${r.customer}.` };
  const [msg, detail] = REASONS[r.reason ?? ""] ?? ["Cupom inválido", ""];
  return { ok: false, msg: `${msg}: ${code}`, detail };
}

export async function saveOffer(_: { error: string; ok?: string }, form: FormData) {
  const supabase = await createClient();
  const pct = Number(form.get("discount_pct"));
  if (!(pct >= 10 && pct <= 30)) return { error: "O desconto precisa estar entre 10% e 30%." };
  const { error } = await supabase.from("partners").update({
    discount_pct: pct,
    rules: String(form.get("rules") ?? "").trim() || null,
    description: String(form.get("description") ?? "").trim() || null,
    cover_url: String(form.get("cover_url") ?? "").trim() || null,
  }).eq("id", String(form.get("partner_id")));
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { error: "", ok: "Oferta salva. Já aparece no site." };
}

export async function requestBanner(_: { error: string; ok?: string }, form: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("banner_requests").insert({
    partner_id: String(form.get("partner_id")),
    title: String(form.get("title") ?? "").trim().slice(0, 80),
    position: String(form.get("position")),
    months: Number(form.get("months")),
  });
  if (error) return { error: error.message };
  revalidatePath("/empresa/anunciar");
  return { error: "", ok: "Pedido enviado. Os donos vão aprovar e combinar o pagamento." };
}
