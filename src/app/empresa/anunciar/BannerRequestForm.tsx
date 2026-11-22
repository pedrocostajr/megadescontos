"use client";
import { useActionState, useState } from "react";
import { requestBanner } from "../actions";
import { POSITIONS } from "@/lib/constants";
import { brl } from "@/lib/format";

type Pos = keyof typeof POSITIONS;

export function BannerRequestForm({ partnerId, defaultTitle, prices }: { partnerId: string; defaultTitle: string; prices: Record<Pos, number> }) {
  const [state, action, pending] = useActionState(requestBanner, { error: "" });
  const [pos, setPos] = useState<Pos>("home");
  const [months, setMonths] = useState(1);
  return (
    <form className="box" action={action}>
      <h2>Comprar destaque</h2>
      <p className="note">Seu banner aparece para todos os visitantes do site.</p>
      <input type="hidden" name="partner_id" value={partnerId} />
      <div className="field"><label htmlFor="title">Chamada</label><input id="title" name="title" maxLength={80} defaultValue={defaultTitle} required /></div>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="label" style={{ marginBottom: 6 }}>Posição</legend>
        {(Object.keys(POSITIONS) as Pos[]).map((k) => (
          <label key={k} className="cta-box" style={{ display: "flex", gap: 10, cursor: "pointer", marginBottom: 8, borderColor: pos === k ? "var(--sun)" : undefined }}>
            <input type="radio" name="position" value={k} checked={pos === k} onChange={() => setPos(k)} />
            <span><b>{brl(prices[k])}/mês</b><br /><span className="note">{POSITIONS[k]}</span></span>
          </label>
        ))}
      </fieldset>
      <div className="field"><label htmlFor="months">Duração</label>
        <select id="months" name="months" value={months} onChange={(e) => setMonths(+e.target.value)}>
          {[1, 3, 6, 12].map((m) => <option key={m} value={m}>{m} {m > 1 ? "meses" : "mês"}</option>)}
        </select></div>
      <div style={{ fontSize: 16 }}>Total: <b style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>{brl(prices[pos] * months)}</b></div>
      {state.error && <div className="alert err" role="alert">{state.error}</div>}
      {state.ok && <div className="alert ok" role="status">{state.ok}</div>}
      <button className="btn btn-sun" disabled={pending} style={{ justifySelf: "start" }}>{pending ? "Enviando..." : "Enviar pedido"}</button>
    </form>
  );
}
