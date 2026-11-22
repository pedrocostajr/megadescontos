import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/data";
import { PartnerSignup } from "./PartnerSignup";

export const metadata: Metadata = {
  title: "Seja parceiro",
  description: "Cadastre seu restaurante, pousada, café, vinícola ou passeio na Serra Gaúcha e receba clientes que voltam.",
  alternates: { canonical: "/seja-parceiro" },
};

export default async function SejaParceiro() {
  const { supabase, user } = await getSession();
  const { data: mine } = user ? await supabase.from("partners").select("name,status").eq("owner_id", user.id) : { data: null };
  return (
    <section className="band"><div className="wrap">
      <div className="two" style={{ gridTemplateColumns: ".9fr 1.1fr", gap: 32 }}>
        <div>
          <div className="eyebrow">Seja parceiro</div>
          <h1 className="page-title" style={{ margin: "8px 0 16px" }}>Clientes que voltam, toda semana</h1>
          <p className="note" style={{ fontSize: 16, marginBottom: 18 }}>O assinante do Mega Descontos Serra pode usar o desconto várias vezes no seu estabelecimento. Isso traz frequência, não só uma visita.</p>
          <ul style={{ paddingLeft: 18, color: "var(--muted)", display: "grid", gap: 8 }}>
            <li><b style={{ color: "var(--ink)" }}>Você define o desconto</b> entre 10% e 30%.</li>
            <li><b style={{ color: "var(--ink)" }}>Você define as regras</b>: dias, horários e o que entra no desconto.</li>
            <li><b style={{ color: "var(--ink)" }}>Validação simples</b>: o cliente mostra o código no celular e você confere no painel.</li>
            <li><b style={{ color: "var(--ink)" }}>Destaque pago</b> em banners do site, se quiser aparecer mais.</li>
          </ul>
        </div>
        <div>
          {!user ? (
            <div className="form">
              <h2 style={{ fontSize: 24 }}>Crie sua conta para cadastrar a empresa</h2>
              <p className="note" style={{ fontSize: 15 }}>Com a conta você acompanha a aprovação e, depois, valida os cupons no painel da empresa.</p>
              <Link className="btn btn-sun" href="/entrar?next=/seja-parceiro">Entrar ou criar conta</Link>
            </div>
          ) : mine && mine.length > 0 ? (
            <div className="form">
              <h2 style={{ fontSize: 24 }}>Sua empresa já está cadastrada</h2>
              {mine.map((m) => <p key={m.name}><b>{m.name}</b>: {m.status === "approved" ? "aprovada" : m.status === "pending" ? "em análise pelos donos" : "recusada"}</p>)}
              <Link className="btn btn-pine" href="/empresa">Abrir painel da empresa</Link>
            </div>
          ) : <PartnerSignup />}
        </div>
      </div>
    </div></section>
  );
}
