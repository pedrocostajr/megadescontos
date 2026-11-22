import type { Metadata } from "next";
import { AuthForms } from "./AuthForms";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <section className="band"><div className="wrap">
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="eyebrow">Sua conta</div>
        <h1 className="page-title">Entre ou crie sua conta</h1>
        <p className="note" style={{ fontSize: 15, marginTop: 8 }}>Clientes, empresas parceiras e donos usam a mesma entrada. O painel certo abre depois do login.</p>
      </div>
      <AuthForms next={next && next.startsWith("/") ? next : ""} />
    </div></section>
  );
}
