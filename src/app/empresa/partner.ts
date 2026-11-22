import { requireUser, type Partner } from "@/lib/data";

// Empresa do usuário logado (o admin enxerga a primeira, para suporte).
export async function myPartner() {
  const s = await requireUser("/empresa");
  const q = s.supabase.from("partners").select("*").eq("status", "approved").order("created_at");
  const { data } = s.profile.role === "admin" ? await q.limit(1) : await q.eq("owner_id", s.user.id);
  return { ...s, partner: (data?.[0] as Partner | undefined) ?? null };
}
