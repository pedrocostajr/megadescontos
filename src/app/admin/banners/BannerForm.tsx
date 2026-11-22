"use client";
import { useActionState, useState } from "react";
import { createBanner } from "../actions";
import { BRAND_COLORS, POSITIONS } from "@/lib/constants";
import { brl } from "@/lib/format";

type Pos = keyof typeof POSITIONS;
const iso = (d: Date) => d.toISOString().slice(0, 10);

export function BannerForm({ partners, prices }: { partners: { id: string; name: string }[]; prices: Record<Pos, number> }) {
  const [state, action, pending] = useActionState(createBanner, { error: "" });
  const [title, setTitle] = useState("");
  const [partner, setPartner] = useState(partners[0]?.id ?? "");
  const [manual, setManual] = useState("");
  const [color, setColor] = useState<string>(BRAND_COLORS[0][1]);
  const end = new Date(); end.setDate(end.getDate() + 30);
  const sponsor = partners.find((p) => p.id === partner)?.name ?? (manual || "Anunciante");

  return (
    <form className="box" action={action}>
      <h2>Novo banner ou anúncio</h2>
      <div className="field"><label htmlFor="b-title">Chamada do banner</label><input id="b-title" name="title" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Jantar com 20% OFF todas as noites" required /></div>
      <div className="field"><label htmlFor="b-partner">Anunciante</label>
        <select id="b-partner" name="partner_id" value={partner} onChange={(e) => setPartner(e.target.value)}>
          {partners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          <option value="">Outro anunciante (manual)</option>
        </select></div>
      {!partner && <>
        <div className="field"><label htmlFor="b-manual">Nome do anunciante</label><input id="b-manual" name="sponsor_manual" value={manual} onChange={(e) => setManual(e.target.value)} required /></div>
        <div className="field"><label htmlFor="b-link">Link do anúncio</label><input id="b-link" name="link_url" type="url" placeholder="https://..." /></div>
      </>}
      <div className="field"><label htmlFor="b-pos">Posição no site</label>
        <select id="b-pos" name="position" defaultValue="home">{(Object.keys(POSITIONS) as Pos[]).map((k) => <option key={k} value={k}>{POSITIONS[k]} · {brl(prices[k])}/mês</option>)}</select></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field"><label htmlFor="b-start">Início</label><input id="b-start" type="date" name="starts_on" defaultValue={iso(new Date())} required /></div>
        <div className="field"><label htmlFor="b-end">Fim</label><input id="b-end" type="date" name="ends_on" defaultValue={iso(end)} required /></div>
      </div>
      <div className="field"><span className="label">Cor</span>
        <div className="swatches">{BRAND_COLORS.map(([n, c]) => (
          <label key={c} title={n}><input type="radio" name="color" value={c} checked={color === c} onChange={() => setColor(c)} aria-label={n} /><span style={{ ["--c" as string]: c }} /></label>
        ))}</div></div>
      <div className="field"><span className="label">Prévia</span>
        <div className="promo" style={{ ["--pc" as string]: color, pointerEvents: "none" }}>
          <span className="promo-tag">Patrocinado · {sponsor}</span><span className="promo-title">{title || "Chamada do banner"}</span><span className="promo-go">Ver oferta</span>
        </div></div>
      {state.error && <div className="alert err" role="alert">{state.error}</div>}
      {state.ok && <div className="alert ok" role="status">{state.ok}</div>}
      <button className="btn btn-sun" disabled={pending} style={{ justifySelf: "start" }}>{pending ? "Publicando..." : "Publicar banner"}</button>
    </form>
  );
}
