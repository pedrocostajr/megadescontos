"use client";
import { useActionState } from "react";
import { saveSettings } from "../actions";

type S = { passportPrice: number; couponMinutes: number; paymentsMode: string; prices: { home: number; categoria: number; blog: number } };

export function SettingsForm({ s }: { s: S }) {
  const [state, action, pending] = useActionState(saveSettings, { error: "" });
  return (
    <form className="box" action={action}>
      <h2>Preços e regras</h2>
      <div className="field"><label htmlFor="pp">Preço do passaporte anual (R$)</label><input id="pp" name="passport_price" inputMode="decimal" defaultValue={s.passportPrice} /></div>
      <div className="field"><label htmlFor="cm">Validade do cupom na tela (minutos)</label><input id="cm" name="coupon_minutes" inputMode="numeric" defaultValue={s.couponMinutes} /></div>
      <div className="field"><label htmlFor="ph">Banner na home (R$/mês)</label><input id="ph" name="price_home" inputMode="decimal" defaultValue={s.prices.home} /></div>
      <div className="field"><label htmlFor="pc">Banner na página de parceiros (R$/mês)</label><input id="pc" name="price_categoria" inputMode="decimal" defaultValue={s.prices.categoria} /></div>
      <div className="field"><label htmlFor="pb">Banner no blog (R$/mês)</label><input id="pb" name="price_blog" inputMode="decimal" defaultValue={s.prices.blog} /></div>
      <p className="note">Pagamento: <b>{s.paymentsMode === "simulado" ? "modo de teste (sem cobrança)" : s.paymentsMode}</b>. Muda quando a integração de pagamento for ligada.</p>
      {state.error && <div className="alert err" role="alert">{state.error}</div>}
      {state.ok && <div className="alert ok" role="status">{state.ok}</div>}
      <button className="btn btn-sun" disabled={pending} style={{ justifySelf: "start" }}>{pending ? "Salvando..." : "Salvar"}</button>
    </form>
  );
}
