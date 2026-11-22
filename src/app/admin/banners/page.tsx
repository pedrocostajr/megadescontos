import { requireAdmin, getSettings, POSITIONS, type Banner } from "@/lib/data";
import { Status } from "@/components/Cards";
import { brl, dateBR } from "@/lib/format";
import { decideRequest, deleteBanner, toggleBanner } from "../actions";
import { BannerForm } from "./BannerForm";

export default async function AdminBanners() {
  const { supabase } = await requireAdmin();
  const [{ data: banners }, { data: reqs }, { data: partners }, settings] = await Promise.all([
    supabase.from("banners").select("*").order("created_at", { ascending: false }),
    supabase.from("banner_requests").select("*, partner:partners(name)").eq("status", "pending").order("created_at"),
    supabase.from("partners").select("id,name").eq("status", "approved").order("name"),
    getSettings(),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      {(reqs ?? []).length > 0 && (
        <div className="box hl-box"><h2>Pedidos de destaque das empresas</h2>
          {reqs!.map((r) => (
            <div key={r.id} className="bitem"><i style={{ background: "var(--gold)" }} />
              <div><b>{r.partner?.name}</b> quer “{r.title}”<br />
                <small>{POSITIONS[r.position as keyof typeof POSITIONS]} · {r.months} {r.months > 1 ? "meses" : "mês"} · {brl(settings.prices[r.position as keyof typeof settings.prices] * r.months)}</small></div>
              <div className="acts">
                <form action={decideRequest}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="decision" value="approve" /><button className="btn btn-sun sm">Aprovar e publicar</button></form>
                <form action={decideRequest}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="decision" value="reject" /><button className="btn btn-line sm">Recusar</button></form>
              </div></div>
          ))}
          <p className="note">Combine o pagamento com a empresa antes de aprovar. A cobrança automática entra com a integração de pagamento.</p>
        </div>
      )}
      <div className="two">
        <BannerForm partners={partners ?? []} prices={settings.prices} />
        <div className="box"><h2>Banners cadastrados</h2>
          {(banners as Banner[] ?? []).length ? (banners as Banner[]).map((b) => (
            <div key={b.id} className="bitem"><i style={{ background: b.color }} />
              <div><b>{b.title}</b><br /><small>{b.sponsor_name} · {POSITIONS[b.position]}<br />{dateBR(b.starts_on)} a {dateBR(b.ends_on)} · {brl(Number(b.price_month))}/mês</small></div>
              <div className="acts">
                <Status s={b.ends_on < today ? "encerrado" : b.status} />
                <form action={toggleBanner}><input type="hidden" name="id" value={b.id} /><input type="hidden" name="status" value={b.status} /><button className="linkbtn">{b.status === "ativo" ? "Pausar" : "Ativar"}</button></form>
                <form action={deleteBanner}><input type="hidden" name="id" value={b.id} /><button className="linkbtn danger">Excluir</button></form>
              </div></div>
          )) : <p className="empty">Nenhum banner ainda.</p>}
        </div>
      </div>
    </>
  );
}
