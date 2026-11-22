import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveBanner, type Partner, type Post } from "@/lib/data";
import { PartnerCard, PostCard, PromoBanner } from "@/components/Cards";
import { brl } from "@/lib/format";

const HIGHLIGHTS: [string, string, string][] = [
  ["Gastronomia", "Restaurantes", "#C8101A"], ["Hospedagem", "Pousadas e hotéis", "#00A6ED"],
  ["Cafés e doces", "Cafés e doces", "#FF8A00"], ["Passeios", "Passeios", "#2E9F18"],
  ["Vinícolas", "Vinícolas", "#7A1F3D"], ["Bem-estar", "Bem-estar", "#5B7C3A"],
];

export default async function Home() {
  const supabase = await createClient();
  const [{ data: partners }, { data: posts }, banner] = await Promise.all([
    supabase.from("partners").select("*").eq("status", "approved").order("created_at", { ascending: false }),
    supabase.from("posts").select("*").eq("published", true).order("published_at", { ascending: false }).limit(3),
    getActiveBanner("home"),
  ]);
  const list = (partners ?? []) as Partner[];
  const featured = list[0];

  return (
    <>
      <section className="hero">
        <div className="hero-photo" role="img" aria-label="Catedral de Pedra, em Canela, com céu azul" />
        <div className="wrap">
          <div>
            <span className="place">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
              Gramado · Canela · Serra Gaúcha
            </span>
            <h1>Volte quantas vezes quiser. <span className="under">Economize</span> em todas: <span className="pct">até 30%</span>.</h1>
            <p className="lead">Um passaporte anual dá acesso a descontos de 10% a 30% em restaurantes, pousadas, cafés, vinícolas e passeios. O cupom aparece no seu celular na hora.</p>
            <div className="ctas">
              <Link className="btn btn-sun" href="/passaporte">Quero meu passaporte</Link>
              <Link className="btn btn-ghost" href="/parceiros">Ver parceiros</Link>
            </div>
            <div className="facts">
              <div><b>{list.length}</b>parceiros</div>
              <div><b>10–30%</b>de desconto</div>
              <div><b>Ilimitado</b>uso no ano</div>
            </div>
          </div>
          {featured && (
            <div className="ticket" aria-label="Exemplo de cupom">
              <span className="stamp">Cupom resgatado</span>
              <div className="t-top">
                <div><div className="eyebrow">{featured.category}</div><div className="t-name">{featured.name}</div><div className="t-meta">{featured.city} · apresente no caixa</div></div>
                <div className="t-pct">{featured.discount_pct}%</div>
              </div>
              <div className="t-cut" />
              <div className="t-meta">Código</div>
              <div className="t-code">MDS-7K4Q-2H</div>
            </div>
          )}
        </div>
        <span className="photo-credit">Foto: <a href="https://commons.wikimedia.org/wiki/File:Catedral_de_Pedra,_Canela_RS.jpg" target="_blank" rel="noopener">Rosanetur</a>, CC BY 2.0</span>
        <svg className="hero-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 34 C240 4 480 4 720 26 S1200 56 1440 22 L1440 60 L0 60Z" style={{ fill: "var(--mist)" }} /></svg>
      </section>

      <div className="wrap">
        <div className="highlights">
          {HIGHLIGHTS.map(([label, cat, color]) => (
            <Link key={cat} className="hl" href={`/parceiros?cat=${encodeURIComponent(cat)}`}>
              <span style={{ ["--c" as string]: color }}><b>{list.filter((p) => p.category === cat).length}</b></span>{label}
            </Link>
          ))}
        </div>
        {banner && <div style={{ marginTop: 40 }}><PromoBanner b={banner} /></div>}
      </div>

      <section className="band"><div className="wrap">
        <div className="sec-head"><div><div className="eyebrow">Nosso diferencial</div><h2>Desconto que não acaba na primeira visita</h2></div>
          <p>Em outros clubes o cupom vale uma vez. Aqui você volta ao mesmo restaurante e ganha o desconto de novo, o ano todo.</p></div>
        <div className="diff">
          <div className="compare"><h3>Cupom comum</h3>
            <div className="visits">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className={`visit ${i === 1 ? "y" : "n"}`}>{i === 1 ? "-20%" : `${i}ª`}</div>)}</div>
            <div className="total">Economia em 6 jantares de R$ 180<b>{brl(36)}</b></div></div>
          <div className="compare ours"><h3>Mega Descontos Serra</h3>
            <div className="visits">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="visit y">-20%</div>)}</div>
            <div className="total">Economia em 6 jantares de R$ 180<b>{brl(216)}</b></div></div>
        </div>
        <div className="steps">
          <div className="step"><div className="n">Passo 1</div><h3>Garanta o passaporte</h3><p>Um pagamento libera os descontos por 12 meses.</p></div>
          <div className="step"><div className="n">Passo 2</div><h3>Escolha o lugar</h3><p>Filtre por setor ou cidade e veja o desconto de cada parceiro.</p></div>
          <div className="step"><div className="n">Passo 3</div><h3>Resgate no celular</h3><p>Toque em “Resgatar” e o cupom com código e QR aparece na tela.</p></div>
          <div className="step"><div className="n">Passo 4</div><h3>Mostre e economize</h3><p>Apresente no caixa. Na próxima visita, resgate de novo.</p></div>
        </div>
      </div></section>

      <section className="band" style={{ paddingTop: 0 }}><div className="wrap">
        <div className="sec-head"><div><div className="eyebrow">Parceiros</div><h2>Onde usar seu desconto</h2></div>
          <Link className="btn btn-line" href="/parceiros">Ver todos</Link></div>
        <div className="grid">{list.slice(0, 8).map((p) => <PartnerCard key={p.id} p={p} />)}</div>
      </div></section>

      {(posts ?? []).length > 0 && (
        <section className="band" style={{ paddingTop: 0 }}><div className="wrap">
          <div className="sec-head"><div><div className="eyebrow">Blog da serra</div><h2>Notícias, roteiros e onde comer</h2></div>
            <Link className="btn btn-line" href="/blog">Ver o blog</Link></div>
          <div className="posts">{(posts as Post[]).map((p, i) => <PostCard key={p.id} p={p} i={i} />)}</div>
        </div></section>
      )}

      <section className="band" style={{ background: "var(--surface)", borderBlock: "1px solid var(--line)" }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div><div className="eyebrow">Para empresas</div><h2 style={{ fontSize: "clamp(26px,3.4vw,38px)", marginTop: 8 }}>Tem restaurante, pousada ou passeio na serra?</h2>
            <p style={{ color: "var(--muted)", marginTop: 8, maxWidth: "52ch" }}>Cadastre sua empresa e receba clientes que voltam. Você define o desconto entre 10% e 30% e as regras de uso.</p></div>
          <Link className="btn btn-pine" href="/seja-parceiro">Cadastrar minha empresa</Link>
        </div>
      </section>
    </>
  );
}
