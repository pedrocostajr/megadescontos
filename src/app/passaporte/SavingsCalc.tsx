"use client";
import { useState } from "react";
import { brl } from "@/lib/format";

export function SavingsCalc({ price }: { price: number }) {
  const [visits, setVisits] = useState(4);
  const [ticket, setTicket] = useState(150);
  const [pct, setPct] = useState(20);
  const year = visits * 12 * ticket * pct / 100;
  return (
    <div className="side-dark" style={{ display: "grid", gap: 10, alignContent: "start" }}>
      <div className="eyebrow" style={{ color: "var(--gold)" }}>Calculadora</div>
      <h2 style={{ fontSize: 26 }}>Quanto você economiza no ano?</h2>
      <label htmlFor="cv" style={{ color: "#ffffffb3", fontSize: 14 }}>Saídas por mês: <b style={{ color: "var(--gold)" }}>{visits}</b></label>
      <input id="cv" type="range" min={1} max={12} value={visits} onChange={(e) => setVisits(+e.target.value)} style={{ accentColor: "var(--gold)" }} />
      <label htmlFor="ct" style={{ color: "#ffffffb3", fontSize: 14 }}>Gasto médio por saída: <b style={{ color: "var(--gold)" }}>{brl(ticket)}</b></label>
      <input id="ct" type="range" min={50} max={600} step={10} value={ticket} onChange={(e) => setTicket(+e.target.value)} style={{ accentColor: "var(--gold)" }} />
      <label htmlFor="cp" style={{ color: "#ffffffb3", fontSize: 14 }}>Desconto médio: <b style={{ color: "var(--gold)" }}>{pct}%</b></label>
      <input id="cp" type="range" min={10} max={30} value={pct} onChange={(e) => setPct(+e.target.value)} style={{ accentColor: "var(--gold)" }} />
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(40px,5vw,56px)", color: "var(--gold)", lineHeight: 1, marginTop: 12 }}>{brl(year)}</div>
      <p style={{ color: "#ffffffb3" }}>{year > price ? `Sobram ${brl(year - price)} depois de pagar o passaporte.` : "Com esse uso o passaporte ainda se paga em parte."}</p>
    </div>
  );
}
