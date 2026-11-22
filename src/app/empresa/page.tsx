import { myPartner } from "./partner";
import { Status } from "@/components/Cards";
import { dateTimeBR } from "@/lib/format";

export default async function EmpresaResumo({ searchParams }: { searchParams: Promise<{ enviado?: string }> }) {
  await searchParams;
  const { supabase, partner } = await myPartner();
  if (!partner) return null;
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const [{ data: coupons }, { count: monthCount }, { data: reqs }] = await Promise.all([
    supabase.from("coupons").select("code,discount_pct,created_at,validated_at,user_id").eq("partner_id", partner.id).order("created_at", { ascending: false }).limit(200),
    supabase.from("coupons").select("id", { count: "exact", head: true }).eq("partner_id", partner.id).gte("created_at", monthStart.toISOString()),
    supabase.from("banner_requests").select("status").eq("partner_id", partner.id),
  ]);
  const list = coupons ?? [];
  const byUser = new Map<string, number>();
  list.forEach((c) => byUser.set(c.user_id, (byUser.get(c.user_id) ?? 0) + 1));
  const returning = byUser.size ? Math.round(([...byUser.values()].filter((n) => n > 1).length / byUser.size) * 100) : 0;

  return (
    <>
      <div className="kpis">
        <div className="kpi"><span>Cupons no mês</span><b>{monthCount ?? 0}</b><small>resgatados para você</small></div>
        <div className="kpi"><span>Validados</span><b>{list.filter((c) => c.validated_at).length}</b><small>usados no caixa</small></div>
        <div className="kpi"><span>Clientes que voltaram</span><b>{returning}%</b><small>resgataram 2 vezes ou mais</small></div>
        <div className="kpi"><span>Pedidos de banner</span><b>{reqs?.length ?? 0}</b><small>{reqs?.filter((r) => r.status === "approved").length ?? 0} aprovados</small></div>
      </div>
      <div className="box">
        <h2>Últimos cupons</h2>
        {list.length ? list.slice(0, 20).map((c) => (
          <div key={c.code} className="bitem"><i style={{ background: c.validated_at ? "var(--ok)" : "var(--gold)" }} />
            <div><b style={{ fontFamily: "var(--font-code)" }}>{c.code}</b> · {c.discount_pct}%<br /><small>{dateTimeBR(c.created_at)}</small></div>
            <div className="acts"><Status s={c.validated_at ? "approved" : "pending"} /></div></div>
        )) : <p className="empty">Nenhum cupom resgatado ainda. Quando um assinante resgatar, ele aparece aqui.</p>}
      </div>
    </>
  );
}
