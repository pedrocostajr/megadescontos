import Link from "next/link";
import { requireAdmin, type Partner } from "@/lib/data";
import { Status } from "@/components/Cards";
import { dateBR } from "@/lib/format";
import { setPartnerStatus } from "../actions";

export default async function AdminEmpresas() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("partners").select("*, owner:profiles(email,full_name)").order("created_at", { ascending: false });
  const all = (data ?? []) as (Partner & { owner: { email: string; full_name: string | null } | null })[];
  const pending = all.filter((p) => p.status === "pending");
  const others = all.filter((p) => p.status !== "pending");

  const Btn = ({ id, status, label, cls }: { id: string; status: string; label: string; cls: string }) => (
    <form action={setPartnerStatus}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} /><button className={`btn sm ${cls}`}>{label}</button></form>
  );

  return (
    <>
      <div className="box">
        <h2>Aguardando aprovação</h2>
        {pending.length ? (
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Empresa</th><th>Setor</th><th>Cidade</th><th>Desconto</th><th>Responsável</th><th>Contato</th><th></th></tr></thead><tbody>
            {pending.map((p) => (
              <tr key={p.id}>
                <td><b>{p.name}</b><br /><small>{p.rules}</small></td><td>{p.category}</td><td>{p.city}</td><td>{p.discount_pct}%</td>
                <td>{p.owner?.full_name || "—"}<br /><small>{p.owner?.email}</small></td>
                <td><small>{p.whatsapp || "—"}<br />{p.cnpj || ""}</small></td>
                <td><div className="acts"><Btn id={p.id} status="approved" label="Aprovar" cls="btn-sun" /><Btn id={p.id} status="rejected" label="Recusar" cls="btn-line" /></div></td>
              </tr>
            ))}
          </tbody></table></div>
        ) : <p className="empty">Nenhuma empresa aguardando. Novos cadastros feitos em “Sou empresa” aparecem aqui.</p>}
      </div>
      <div className="box">
        <h2>Todas as empresas ({others.length})</h2>
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Empresa</th><th>Setor</th><th>Cidade</th><th>Desconto</th><th>Desde</th><th>Status</th><th></th></tr></thead><tbody>
          {others.map((p) => (
            <tr key={p.id}>
              <td><b>{p.status === "approved" ? <Link href={`/parceiros/${p.slug}`}>{p.name}</Link> : p.name}</b></td><td>{p.category}</td><td>{p.city}</td><td>{p.discount_pct}%</td>
              <td>{dateBR(p.created_at)}</td><td><Status s={p.status} /></td>
              <td>{p.status === "approved" ? <Btn id={p.id} status="rejected" label="Suspender" cls="btn-line" /> : <Btn id={p.id} status="approved" label="Aprovar" cls="btn-sun" />}</td>
            </tr>
          ))}
        </tbody></table></div>
      </div>
    </>
  );
}
