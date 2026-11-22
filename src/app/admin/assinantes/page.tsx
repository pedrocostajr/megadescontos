import { requireAdmin } from "@/lib/data";
import { Status } from "@/components/Cards";
import { dateBR } from "@/lib/format";

type Row = { id: string; email: string; full_name: string | null; role: string; created_at: string;
  subscriptions: { status: string; ends_at: string | null }[]; coupons: { count: number }[] };

export default async function Assinantes() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("profiles")
    .select("id,email,full_name,role,created_at,subscriptions(status,ends_at),coupons!coupons_user_id_fkey(count)")
    .order("created_at", { ascending: false }).limit(500);
  const rows = (data ?? []) as unknown as Row[];
  const now = new Date().toISOString();
  const roleLabel: Record<string, string> = { admin: "Dono", partner: "Empresa", customer: "Cliente" };
  return (
    <div className="box">
      <h2>Pessoas cadastradas ({rows.length})</h2>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Nome</th><th>Perfil</th><th>Desde</th><th>Passaporte</th><th>Vence</th><th className="num">Cupons</th></tr></thead><tbody>
        {rows.map((r) => {
          const active = r.subscriptions.find((s) => s.status === "active" && (s.ends_at ?? "") > now);
          return (
            <tr key={r.id}>
              <td><b>{r.full_name || "—"}</b><br /><small>{r.email}</small></td>
              <td>{roleLabel[r.role] ?? r.role}</td>
              <td>{dateBR(r.created_at)}</td>
              <td><Status s={active ? "active" : "expired"} /></td>
              <td>{active ? dateBR(active.ends_at) : "—"}</td>
              <td className="num">{r.coupons[0]?.count ?? 0}</td>
            </tr>
          );
        })}
      </tbody></table></div>
    </div>
  );
}
