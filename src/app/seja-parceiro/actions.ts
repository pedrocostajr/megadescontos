"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/data";
import { slugify } from "@/lib/format";

export async function createPartner(_: { error: string }, form: FormData): Promise<{ error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/seja-parceiro");
  const name = String(form.get("name") ?? "").trim();
  const city = String(form.get("city") ?? "").trim();
  const category = String(form.get("category") ?? "");
  const pct = Number(form.get("discount_pct"));
  if (!name || !city) return { error: "Preencha o nome do estabelecimento e a cidade." };
  if (!(CATEGORIES as readonly string[]).includes(category)) return { error: "Escolha um setor." };
  if (!(pct >= 10 && pct <= 30)) return { error: "O desconto precisa estar entre 10% e 30%." };
  const row = {
    name, city, category, discount_pct: pct,
    description: String(form.get("description") ?? "").trim() || null,
    rules: String(form.get("rules") ?? "").trim() || null,
    cnpj: String(form.get("cnpj") ?? "").trim() || null,
    whatsapp: String(form.get("whatsapp") ?? "").trim() || null,
  };
  const base = slugify(`${name}-${city}`);
  let { error } = await supabase.from("partners").insert({ ...row, slug: base });
  if (error?.code === "23505") {
    ({ error } = await supabase.from("partners").insert({ ...row, slug: `${base}-${Math.random().toString(36).slice(2, 6)}` }));
  }
  if (error) return { error: `Não foi possível enviar: ${error.message}` };
  revalidatePath("/seja-parceiro");
  redirect("/empresa?enviado=1");
}
