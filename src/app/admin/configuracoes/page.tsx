import { requireAdmin, getSettings } from "@/lib/data";
import { addAdminEmail } from "../actions";
import { SettingsForm } from "./SettingsForm";

export default async function Configuracoes() {
  const { supabase } = await requireAdmin();
  const [settings, { data: admins }] = await Promise.all([getSettings(), supabase.from("admin_emails").select("email").order("email")]);
  return (
    <div className="two">
      <SettingsForm s={settings} />
      <div className="box">
        <h2>Equipe com acesso total</h2>
        {(admins ?? []).map((a) => <div key={a.email} className="bitem"><i style={{ background: "var(--red)" }} /><div><b>{a.email}</b><br /><small>Dono · acesso total</small></div></div>)}
        <form action={addAdminEmail} style={{ display: "grid", gap: 8 }}>
          <div className="field"><label htmlFor="new-admin">Adicionar e-mail de administrador</label><input id="new-admin" name="email" type="email" required placeholder="pessoa@empresa.com.br" /></div>
          <button className="btn btn-pine sm" style={{ justifySelf: "start" }}>Adicionar</button>
          <span className="hint">Quem tiver esse e-mail vira administrador ao criar a conta (ou na hora, se já tiver conta).</span>
        </form>
      </div>
    </div>
  );
}
