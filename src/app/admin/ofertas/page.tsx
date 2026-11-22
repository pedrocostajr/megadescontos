import { requireAdmin, CATEGORIES, type Partner } from "@/lib/data";
import { updateOffer } from "../actions";

export default async function AdminOfertas() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("partners").select("*").eq("status", "approved").order("name");
  const list = (data ?? []) as Partner[];
  return (
    <div className="box">
      <h2>Ofertas dos parceiros</h2>
      <p className="note">Altere o desconto, o setor ou as regras e salve a linha. A mudança aparece no site na hora.</p>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Empresa</th><th>Setor</th><th>Desconto</th><th>Regras de uso</th><th></th></tr></thead><tbody>
        {list.map((p) => (
          <tr key={p.id}>
            <td><b>{p.name}</b><br /><small>{p.city}</small></td>
            <td><select form={`f-${p.id}`} name="category" defaultValue={p.category} aria-label={`Setor de ${p.name}`}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></td>
            <td><select form={`f-${p.id}`} name="discount_pct" defaultValue={p.discount_pct} aria-label={`Desconto de ${p.name}`}>{[10, 15, 20, 25, 30].map((v) => <option key={v} value={v}>{v}%</option>)}</select></td>
            <td><input form={`f-${p.id}`} name="rules" defaultValue={p.rules ?? ""} aria-label={`Regras de ${p.name}`} /></td>
            <td><form id={`f-${p.id}`} action={updateOffer}><input type="hidden" name="id" value={p.id} /><button className="btn btn-pine sm">Salvar</button></form></td>
          </tr>
        ))}
      </tbody></table></div>
    </div>
  );
}
