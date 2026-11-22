import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveBanner, type Post } from "@/lib/data";
import { PromoBanner } from "@/components/Cards";
import { Prose } from "@/components/Prose";
import { brl, dateBR, SITE_URL } from "@/lib/format";

async function load(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  return data as Post | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return {};
  const image = p.cover_url || "/img/canela.jpg";
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.excerpt, publishedTime: p.published_at ?? undefined, images: [image] },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) notFound();
  const supabase = await createClient();
  const [{ data: others }, banner] = await Promise.all([
    supabase.from("posts").select("slug,title").eq("published", true).neq("slug", slug).order("published_at", { ascending: false }).limit(3),
    getActiveBanner("blog"),
  ]);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: p.excerpt,
    datePublished: p.published_at, dateModified: p.updated_at, image: p.cover_url || `${SITE_URL}/img/canela.jpg`,
    mainEntityOfPage: `${SITE_URL}/blog/${p.slug}`, publisher: { "@type": "Organization", name: "Mega Descontos Serra", logo: `${SITE_URL}/img/logo-mega.png` },
  };

  return (
    <section className="band"><div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Link href="/blog" className="back">← Blog</Link>
      <div className="article-grid">
        <article className="article">
          <div className="eyebrow">{p.category} · {dateBR(p.published_at)}</div>
          <h1>{p.title}</h1>
          <p className="article-lead">{p.excerpt}</p>
          <div className="post-hero" style={{ backgroundImage: `url(${p.cover_url || "/img/canela.jpg"})` }} role="img" aria-label={p.title} />
          <Prose text={p.body} />
          {p.ticket_label && p.ticket_price != null && (
            <div className="ticket-buy">
              <div><div className="eyebrow">Ingresso</div><b>{p.ticket_label}</b><span>{brl(Number(p.ticket_price))}</span></div>
              <span className="btn btn-line" aria-disabled="true">Venda de ingressos em breve</span>
            </div>
          )}
          <div className="cta-box"><b>Economize em toda visita.</b> Com o passaporte você tem de 10% a 30% de desconto nos parceiros. <Link href="/passaporte">Quero meu passaporte</Link></div>
        </article>
        <aside className="article-side">
          <PromoBanner b={banner} compact />
          {(others ?? []).length > 0 && (
            <div className="side-card"><div className="eyebrow">Leia também</div>
              {others!.map((o) => <Link key={o.slug} className="also" href={`/blog/${o.slug}`}>{o.title}</Link>)}</div>
          )}
        </aside>
      </div>
    </div></section>
  );
}
