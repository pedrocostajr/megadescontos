import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export * from "@/lib/constants";

export type Role = "admin" | "partner" | "customer";

export type Profile = { id: string; email: string; full_name: string | null; role: Role };

export type Partner = {
  id: string; owner_id: string | null; slug: string; name: string; category: string; city: string;
  description: string | null; discount_pct: number; rules: string | null; cover_url: string | null;
  cnpj: string | null; whatsapp: string | null; status: "pending" | "approved" | "rejected"; created_at: string;
};

export type Banner = {
  id: string; title: string; sponsor_name: string; partner_id: string | null; position: "home" | "categoria" | "blog";
  color: string; link_url: string | null; image_url: string | null; starts_on: string; ends_on: string;
  status: "ativo" | "pausado"; price_month: number; partner?: { slug: string } | null;
};

export type Post = {
  id: string; slug: string; title: string; category: string; excerpt: string; body: string; cover_url: string | null;
  ticket_label: string | null; ticket_price: number | null; published: boolean; published_at: string | null; updated_at: string;
};

export type Coupon = {
  id: string; code: string; user_id: string; partner_id: string; discount_pct: number; bill_amount: number | null;
  created_at: string; expires_at: string; validated_at: string | null;
};

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null as Profile | null };
  const { data: profile } = await supabase.from("profiles").select("id,email,full_name,role").eq("id", user.id).single();
  return { supabase, user, profile: profile as Profile | null };
}

export async function requireUser(next: string) {
  const s = await getSession();
  if (!s.user || !s.profile) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return s as { supabase: typeof s.supabase; user: NonNullable<typeof s.user>; profile: Profile };
}

export async function requireAdmin() {
  const s = await requireUser("/admin");
  if (s.profile.role !== "admin") redirect("/conta");
  return s;
}

export async function getSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key,value");
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return {
    passportPrice: Number(map.passport_price ?? 199.9),
    couponMinutes: Number(map.coupon_minutes ?? 15),
    paymentsMode: map.payments_mode ?? "simulado",
    prices: { home: Number(map.price_home ?? 490), categoria: Number(map.price_categoria ?? 290), blog: Number(map.price_blog ?? 190) },
  };
}

export async function getActiveBanner(position: Banner["position"]) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase.from("banners").select("*, partner:partners(slug)")
    .eq("position", position).eq("status", "ativo").lte("starts_on", today).gte("ends_on", today)
    .order("created_at", { ascending: false }).limit(1);
  return (data?.[0] as Banner | undefined) ?? null;
}
