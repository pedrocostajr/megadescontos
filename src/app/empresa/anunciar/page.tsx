import { myPartner } from "../partner";
import { getSettings, POSITIONS } from "@/lib/data";
import { Status } from "@/components/Cards";
import { dateBR } from "@/lib/format";
import { BannerRequestForm } from "./BannerRequestForm";

export default async function Anunciar() {
  const [{ supabase, partner }, settings] = await Promise.all([myPartner(), getSettings()]);
  if (!partner) return null;
  const { data: reqs } = await supabase.from("banner_requests").select("*").eq("partner_id", partner.id).order("created_at", { ascending: false });
  return (
    <div className="two">
      <BannerRequestForm partnerId={partner.id} defaultTitle={`${partner.discount_pct}% OFF para assinantes no ${partner.name}`} prices={settings.prices} />
      <div className="box"><h2>Meus pedidos</h2>
        {(reqs ?? []).length ? reqs!.map((r) => (
          <div key={r.id} className="bitem"><i style={{ background: "var(--gold)" }} />
            <div><b>{r.title}</b><br /><small>{POSITIONS[r.position as keyof typeof POSITIONS]} · {r.months} {r.months > 1 ? "meses" : "mês"} · {dateBR(r.created_at)}</small></div>
            <div className="acts"><Status s={r.status} /></div></div>
        )) : <p className="empty">Nenhum pedido ainda.</p>}
      </div>
    </div>
  );
}
