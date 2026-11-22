import type { Metadata } from "next";
import Link from "next/link";
import { requireUser, type Partner } from "@/lib/data";
import { SideNav } from "@/components/SideNav";

export const metadata: Metadata = { title: "Painel da empresa", robots: { index: false } };

export default async function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile } = await requireUser("/empresa");
  const q = supabase.from("partners").select("*").order("created_at");
  const { data } = profile.role === "admin" ? await q.limit(1) : await q.eq("owner_id", user.id);
  const partner = (data?.[0] as Partner | undefined) ?? null;

  if (!partner) {
    return (
      <section className="band"><div className="wrap" style={{ maxWidth: 620, textAlign: "center" }}>
        <div className="eyebrow">Painel da empresa</div>
        <h1 className="page-title">Você ainda não cadastrou uma empresa</h1>
        <p className="note" style={{ fontSize: 15, margin: "10px 0 20px" }}>Cadastre seu estabelecimento. Depois que os donos aprovarem, este painel libera a validação de cupons.</p>
        <Link className="btn btn-sun" href="/seja-parceiro">Cadastrar empresa</Link>
      </div></section>
    );
  }
  if (partner.status !== "approved") {
    return (
      <section className="band"><div className="wrap" style={{ maxWidth: 620, textAlign: "center" }}>
        <div className="eyebrow">Painel da empresa</div>
        <h1 className="page-title">{partner.name}</h1>
        <p className="note" style={{ fontSize: 15, margin: "10px 0 20px" }}>
          {partner.status === "pending" ? "Seu cadastro foi recebido e está em análise. Você recebe acesso ao painel assim que os donos aprovarem." : "Seu cadastro não foi aprovado. Fale com a equipe do Mega Descontos Serra para saber o motivo."}
        </p>
        <Link className="btn btn-line" href="/">Voltar ao site</Link>
      </div></section>
    );
  }
  return (
    <section className="band dash-band"><div className="wrap">
      <div className="dash-head"><div><div className="eyebrow">Painel da empresa{profile.role === "admin" ? " · visão do administrador" : ""}</div><h1>{partner.name}</h1></div>
        <span className="pill-pct">{partner.discount_pct}% OFF para assinantes</span></div>
      <div className="dash">
        <SideNav items={[
          { href: "/empresa", label: "Resumo" }, { href: "/empresa/validar", label: "Validar cupom" },
          { href: "/empresa/oferta", label: "Minha oferta" }, { href: "/empresa/anunciar", label: "Anunciar" },
        ]} />
        <div className="dash-main">{children}</div>
      </div>
    </div></section>
  );
}
