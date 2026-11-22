import Link from "next/link";
import { CATEGORY_COLORS } from "@/lib/constants";
import type { Banner, Partner, Post } from "@/lib/data";
import { dateBR } from "@/lib/format";

export function PartnerCard({ p, action }: { p: Partner; action?: React.ReactNode }) {
  const [c1, c2] = CATEGORY_COLORS[p.category] ?? ["#16394F", "#0E2231"];
  const bg = p.cover_url
    ? { backgroundImage: `linear-gradient(180deg,transparent 40%,#0008),url(${p.cover_url})` }
    : { background: `linear-gradient(135deg,${c1},${c2})` };
  return (
    <article className="card">
      <div className="cover" style={bg}>
        {!p.cover_url && <span className="mono" aria-hidden="true">{p.name.charAt(0)}</span>}
        <span className="badge">{p.discount_pct}%<small> OFF</small></span>
        <span className="cat">{p.category}</span>
      </div>
      <div className="body">
        <h3><Link href={`/parceiros/${p.slug}`}>{p.name}</Link></h3>
        <div className="city">{p.city}</div>
        <div className="rule">{p.rules}</div>
        <div className="act">{action ?? <Link className="btn btn-sun" href={`/parceiros/${p.slug}`}>Ver desconto</Link>}</div>
      </div>
    </article>
  );
}

export function PromoBanner({ b, compact }: { b: Banner | null; compact?: boolean }) {
  if (!b) return null;
  const href = b.link_url || (b.partner?.slug ? `/parceiros/${b.partner.slug}` : "/parceiros");
  return (
    <Link className={`promo${compact ? " compact" : ""}`} href={href} style={{ ["--pc" as string]: b.color }}>
      <span className="promo-tag">Patrocinado · {b.sponsor_name}</span>
      <span className="promo-title">{b.title}</span>
      <span className="promo-go">Ver oferta</span>
    </Link>
  );
}

const POST_COLORS = ["#C8101A", "#FF8A00", "#2E9F18", "#00A6ED"];
export function PostCard({ p, i = 0 }: { p: Post; i?: number }) {
  const style: Record<string, string> = { ["--pc"]: POST_COLORS[i % 4] };
  if (p.cover_url) style.backgroundImage = `url(${p.cover_url})`;
  return (
    <Link className="post-card" href={`/blog/${p.slug}`}>
      <div className="post-cover" style={style}><span>{p.category}</span></div>
      <div className="post-body">
        <div className="post-date">{dateBR(p.published_at)}</div>
        <h3>{p.title}</h3>
        <p>{p.excerpt}</p>
      </div>
    </Link>
  );
}

export function Status({ s }: { s: string }) {
  const label: Record<string, string> = {
    pending: "aguardando", approved: "aprovado", rejected: "recusado", ativo: "ativo", pausado: "pausado",
    active: "ativo", canceled: "cancelado", expired: "vencido", published: "publicado", draft: "rascunho", encerrado: "encerrado",
  };
  const ok = ["approved", "ativo", "active", "published"].includes(s);
  const off = ["rejected", "pausado", "canceled", "expired", "encerrado", "draft"].includes(s);
  return <span className={`st ${ok ? "st-ok" : off ? "st-off" : "st-wait"}`}>{label[s] ?? s}</span>;
}

export function Serp({ title, slug, desc, base }: { title: string; slug: string; desc: string; base: string }) {
  return (
    <div className="serp" aria-label="Prévia no Google">
      <div className="serp-url">{base.replace(/^https?:\/\//, "")} › blog › {slug || "..."}</div>
      <div className="serp-title">{(title || "Título do post").slice(0, 60)}{title.length > 60 ? "..." : ""}</div>
      <div className="serp-desc">{(desc || "A descrição aparece aqui.").slice(0, 160)}{desc.length > 160 ? "..." : ""}</div>
    </div>
  );
}
