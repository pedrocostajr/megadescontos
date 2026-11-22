import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, getActiveBanner, type Partner } from "@/lib/data";
import { PartnerCard, PromoBanner } from "@/components/Cards";

export const metadata: Metadata = {
  title: "Parceiros com desconto na Serra Gaúcha",
  description: "Restaurantes, cafés, pousadas, vinícolas e passeios em Gramado, Canela e região com 10% a 30% de desconto para quem tem o passaporte.",
  alternates: { canonical: "/parceiros" },
};

export default async function Parceiros({ searchParams }: { searchParams: Promise<{ cat?: string; q?: string }> }) {
  const { cat, q } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("partners").select("*").eq("status", "approved").order("name");
  if (cat && (CATEGORIES as readonly string[]).includes(cat)) query = query.eq("category", cat);
  if (q) query = query.or(`name.ilike.%${q.replace(/[%,()]/g, "")}%,city.ilike.%${q.replace(/[%,()]/g, "")}%`);
  const [{ data }, banner] = await Promise.all([query, getActiveBanner("categoria")]);
  const list = (data ?? []) as Partner[];

  return (
    <section className="band"><div className="wrap">
      <div className="sec-head"><div><div className="eyebrow">Guia de parceiros</div><h1 className="page-title">Todos os descontos</h1></div>
        <p>Veja onde usar o passaporte. Toque no parceiro para resgatar o cupom.</p></div>
      {banner && <div style={{ marginBottom: 24 }}><PromoBanner b={banner} /></div>}
      <form className="cats" role="search" action="/parceiros">
        <Link className={`chip ${!cat ? "on" : ""}`} href="/parceiros">Todos</Link>
        {CATEGORIES.map((c) => (
          <Link key={c} className={`chip ${cat === c ? "on" : ""}`} href={`/parceiros?cat=${encodeURIComponent(c)}`}>{c}</Link>
        ))}
        {cat && <input type="hidden" name="cat" value={cat} />}
        <input className="input" style={{ flex: 1, minWidth: 200, borderRadius: 999 }} type="search" name="q" defaultValue={q} placeholder="Buscar por nome ou cidade" aria-label="Buscar parceiro" />
      </form>
      {list.length ? <div className="grid">{list.map((p) => <PartnerCard key={p.id} p={p} />)}</div>
        : <p className="empty">Nenhum parceiro encontrado com esse filtro.</p>}
    </div></section>
  );
}
