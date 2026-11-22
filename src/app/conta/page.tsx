import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/data";
import { brl, dateBR, dateTimeBR } from "@/lib/format";
import { signOut } from "@/app/entrar/actions";

export const metadata: Metadata = { title: "Meus cupons", robots: { index: false } };

type Row = { code: string; discount_pct: number; bill_amount: number | null; created_at: string; expires_at: string; validated_at: string | null; partner: { name: string; slug: string } | null };

export default async function Conta({ searchParams }: { searchParams: Promise<{ novo?: string }> }) {
  const { novo } = await searchParams;
  const { supabase, user, profile } = await requireUser("/conta");
  const [{ data: subs }, { data: coupons }] = await Promise.all([
    supabase.from("subscriptions").select("status,starts_at,ends_at").eq("user_id", user.id).eq("status", "active").order("ends_at", { ascending: false }).limit(1),
    supabase.from("coupons").select("code,discount_pct,bill_amount,created_at,expires_at,validated_at,partner:partners(name,slug)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
  ]);
  const sub = subs?.[0];
  const rows = (coupons ?? []) as unknown as Row[];
  const saved = rows.reduce((a, r) => a + (r.bill_amount ? r.bill_amount * r.discount_pct / 100 : 0), 0);
  const now = Date.now();
  const name = profile.full_name || profile.email.split("@")[0];

  return (
    <section className="band dash-band"><div className="wrap">
      <div className="dash-head"><div><div className="eyebrow">Área do assinante</div><h1>Olá, {name.split(" ")[0]}</h1></div>
        <div className="acts">
          {profile.role === "admin" && <Link className="btn btn-line" href="/admin">Painel dos donos</Link>}
          {profile.role === "partner" && <Link className="btn btn-line" href="/empresa">Painel da empresa</Link>}
          <Link className="btn btn-sun" href="/parceiros">Resgatar cupom</Link>
        </div></div>
      {novo && <div className="alert ok" style={{ marginBottom: 20 }}>Passaporte ativado. Escolha um parceiro e resgate seu primeiro cupom.</div>}
      <div className="account">
        <div style={{ display: "grid", gap: 16 }}>
          <div className="member">
            <div className="lbl">Passaporte Mega Descontos Serra</div>
            <div className="nm">{name}</div>
            <div className="row"><span>Situação</span><b>{sub ? "Ativo" : "Sem passaporte"}</b></div>
            {sub && <div className="row"><span>Válido até</span><b>{dateBR(sub.ends_at)}</b></div>}
            <div className="row"><span>Cupons resgatados</span><b>{rows.length}</b></div>
          </div>
          {!sub && <Link className="btn btn-sun" href="/passaporte">Ativar passaporte</Link>}
          <div className="box"><span className="note">Economia registrada</span>
            <b style={{ fontFamily: "var(--font-display)", fontSize: 34, color: "var(--ok)" }}>{brl(saved)}</b>
            <span className="hint">Soma do valor informado em cada resgate.</span></div>
          <form action={signOut}><button className="linkbtn">Sair da conta</button></form>
        </div>
        <div className="box">
          <h2>Histórico de cupons</h2>
          {rows.length ? (
            <ul className="history">
              {rows.map((r) => {
                const active = !r.validated_at && new Date(r.expires_at).getTime() > now;
                return (
                  <li key={r.code}>
                    <div><b>{r.partner?.name}</b> {active && <span style={{ color: "var(--ok)", fontSize: 12, fontWeight: 700 }}><span className="live" />ATIVO</span>}
                      {r.validated_at && <span className="note"> · usado</span>}</div>
                    <span className="h-pct">-{r.discount_pct}%</span>
                    <small>{dateTimeBR(r.created_at)} · {r.code}{active && <> · <Link href={`/conta/cupom/${r.code}`}>mostrar</Link></>}</small>
                  </li>
                );
              })}
            </ul>
          ) : <p className="empty">Você ainda não resgatou nenhum cupom. Escolha um parceiro e toque em “Resgatar”.</p>}
        </div>
      </div>
    </div></section>
  );
}
