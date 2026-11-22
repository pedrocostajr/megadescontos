import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_COLORS, getSession, type Partner } from "@/lib/data";
import { RedeemForm } from "./RedeemForm";

async function load(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("partners").select("*").eq("slug", slug).eq("status", "approved").maybeSingle();
  return data as Partner | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name}: ${p.discount_pct}% de desconto em ${p.city}`,
    description: `${p.discount_pct}% de desconto no ${p.name} (${p.category}, ${p.city}) para quem tem o passaporte Mega Descontos Serra. ${p.rules ?? ""}`.slice(0, 160),
    alternates: { canonical: `/parceiros/${p.slug}` },
  };
}

export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) notFound();
  const { supabase, user } = await getSession();
  let active = false;
  let visits = 0;
  if (user) {
    const [{ data: sub }, { count }] = await Promise.all([
      supabase.rpc("has_active_subscription"),
      supabase.from("coupons").select("id", { count: "exact", head: true }).eq("partner_id", p.id).eq("user_id", user.id),
    ]);
    active = Boolean(sub);
    visits = count ?? 0;
  }
  const [c1, c2] = CATEGORY_COLORS[p.category] ?? ["#16394F", "#0E2231"];

  return (
    <section className="band"><div className="wrap">
      <Link href="/parceiros" className="back">← Parceiros</Link>
      <div className="two" style={{ gridTemplateColumns: "1.2fr .8fr" }}>
        <div className="box" style={{ padding: 0, overflow: "hidden" }}>
          <div className="cover" style={{ height: 220, ...(p.cover_url ? { backgroundImage: `url(${p.cover_url})` } : { background: `linear-gradient(135deg,${c1},${c2})` }) }}>
            <span className="badge" style={{ fontSize: 30 }}>{p.discount_pct}%<small> OFF</small></span>
            <span className="cat">{p.category}</span>
          </div>
          <div style={{ padding: 24, display: "grid", gap: 10 }}>
            <h1 style={{ fontSize: "clamp(30px,4vw,44px)" }}>{p.name}</h1>
            <div className="note" style={{ fontSize: 15 }}>{p.city}</div>
            {p.description && <p>{p.description}</p>}
            <div className="cta-box"><b>Regras do desconto:</b> {p.rules || "Consulte no local."}</div>
          </div>
        </div>
        <div className="box">
          <div className="eyebrow">Resgatar cupom</div>
          <h2>{p.discount_pct}% de desconto em cada visita</h2>
          {!user && <>
            <p className="note" style={{ fontSize: 15 }}>Entre na sua conta para resgatar o cupom.</p>
            <Link className="btn btn-sun" href={`/entrar?next=/parceiros/${p.slug}`}>Entrar</Link>
          </>}
          {user && !active && <>
            <p className="note" style={{ fontSize: 15 }}>Você precisa de um passaporte ativo para resgatar.</p>
            <Link className="btn btn-sun" href="/passaporte">Quero meu passaporte</Link>
          </>}
          {user && active && <>
            <p className="note" style={{ fontSize: 15 }}>Resgate quando estiver no local. O cupom fica ativo por alguns minutos.{visits > 0 && ` Você já resgatou aqui ${visits}×.`}</p>
            <RedeemForm partnerId={p.id} />
          </>}
        </div>
      </div>
    </div></section>
  );
}
