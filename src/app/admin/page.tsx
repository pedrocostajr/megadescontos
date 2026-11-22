import Link from "next/link";
import { requireAdmin, CATEGORY_COLORS } from "@/lib/data";
import { brl } from "@/lib/format";

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const today = now.toISOString().slice(0, 10);
  const [subs, coupons, banners, pend, reqs, posts] = await Promise.all([
    supabase.from("subscriptions").select("amount").eq("status", "active").gt("ends_at", now.toISOString()),
    supabase.from("coupons").select("partner:partners(category)").gte("created_at", monthStart),
    supabase.from("banners").select("price_month").eq("status", "ativo").lte("starts_on", today).gte("ends_on", today),
    supabase.from("partners").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("banner_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("published", true),
  ]);
  const subRows = subs.data ?? [];
  const revenue = subRows.reduce((a, r) => a + Number(r.amount), 0);
  const adRev = (banners.data ?? []).reduce((a, r) => a + Number(r.price_month), 0);
  const byCat = new Map<string, number>();
  ((coupons.data ?? []) as unknown as { partner: { category: string } | null }[]).forEach((c) => {
    const k = c.partner?.category ?? "Outros"; byCat.set(k, (byCat.get(k) ?? 0) + 1);
  });
  const bars = [...byCat.entries()].sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...bars.map((b) => b[1]));

  return (
    <>
      <div className="kpis">
        <div className="kpi"><span>Assinantes ativos</span><b>{subRows.length}</b><small>passaportes válidos</small></div>
        <div className="kpi"><span>Receita de passaportes</span><b>{brl(revenue)}</b><small>dos passaportes ativos</small></div>
        <div className="kpi"><span>Banners no ar</span><b>{banners.data?.length ?? 0}</b><small>{brl(adRev)} por mês</small></div>
        <div className="kpi"><span>Cupons no mês</span><b>{coupons.data?.length ?? 0}</b><small>resgatados</small></div>
      </div>
      <div className="two">
        <div className="box"><h2>Pendências</h2>
          <div className="bitem"><i style={{ background: "var(--gold)" }} /><div>Empresas aguardando aprovação: <b>{pend.count ?? 0}</b></div><div className="acts"><Link className="linkbtn" href="/admin/empresas">Revisar</Link></div></div>
          <div className="bitem"><i style={{ background: "var(--gold)" }} /><div>Pedidos de banner: <b>{reqs.count ?? 0}</b></div><div className="acts"><Link className="linkbtn" href="/admin/banners">Revisar</Link></div></div>
          <div className="bitem"><i style={{ background: "var(--sky)" }} /><div>Posts publicados: <b>{posts.count ?? 0}</b></div><div className="acts"><Link className="linkbtn" href="/admin/blog/novo">Escrever post</Link></div></div>
        </div>
        <div className="box"><h2>Cupons por setor no mês</h2>
          {bars.length ? <div className="bars">{bars.map(([k, v]) => (
            <div key={k} className="bar"><span>{k}</span><i style={{ width: `${(v / max) * 100}%`, background: CATEGORY_COLORS[k]?.[0] ?? "var(--muted)" }} /><b>{v}</b></div>
          ))}</div> : <p className="empty">Nenhum cupom resgatado neste mês ainda.</p>}
        </div>
      </div>
    </>
  );
}
