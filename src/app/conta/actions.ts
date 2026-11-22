"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function redeemCoupon(_: { error: string }, form: FormData): Promise<{ error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const bill = parseFloat(String(form.get("bill") ?? "").replace(",", "."));
  const { data, error } = await supabase.rpc("redeem_coupon", {
    p_partner: String(form.get("partner_id")),
    p_bill: Number.isFinite(bill) && bill > 0 ? bill : null,
  });
  if (error || !data) return { error: error?.message ?? "Não foi possível gerar o cupom." };
  revalidatePath("/conta");
  redirect(`/conta/cupom/${(data as { code: string }).code}`);
}

// Passaporte simulado até a integração de pagamento ser escolhida.
export async function startSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/entrar?next=/passaporte");
  const { error } = await supabase.rpc("start_simulated_subscription");
  if (error) redirect(`/passaporte?erro=${encodeURIComponent(error.message)}`);
  revalidatePath("/conta");
  redirect("/conta?novo=1");
}
