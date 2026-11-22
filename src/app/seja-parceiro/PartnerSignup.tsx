"use client";
import { useActionState } from "react";
import { createPartner } from "./actions";
import { CATEGORIES } from "@/lib/constants";

export function PctPick({ name, value }: { name: string; value: number }) {
  return (
    <div className="pct-pick" role="radiogroup" aria-label="Desconto">
      {[10, 15, 20, 25, 30].map((v) => (
        <label key={v}><input type="radio" name={name} value={v} defaultChecked={v === value} /><span>{v}%</span></label>
      ))}
    </div>
  );
}

export function PartnerSignup() {
  const [state, action, pending] = useActionState(createPartner, { error: "" });
  return (
    <form className="form cols" action={action}>
      <div className="field full"><label htmlFor="name">Nome do estabelecimento</label><input id="name" name="name" required placeholder="Ex.: Restaurante Vista da Serra" /></div>
      <div className="field"><label htmlFor="category">Setor</label><select id="category" name="category">{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
      <div className="field"><label htmlFor="city">Cidade</label><input id="city" name="city" required placeholder="Ex.: Gramado" /></div>
      <div className="field"><label htmlFor="cnpj">CNPJ</label><input id="cnpj" name="cnpj" inputMode="numeric" placeholder="00.000.000/0000-00" /></div>
      <div className="field"><label htmlFor="whatsapp">WhatsApp do responsável</label><input id="whatsapp" name="whatsapp" inputMode="tel" placeholder="(54) 90000-0000" /></div>
      <div className="field full"><span className="label">Desconto para assinantes</span><PctPick name="discount_pct" value={20} /></div>
      <div className="field full"><label htmlFor="description">Sobre o lugar</label><textarea id="description" name="description" placeholder="Uma ou duas frases sobre o que você oferece" /></div>
      <div className="field full"><label htmlFor="rules">Regras de uso</label><textarea id="rules" name="rules" placeholder="Ex.: Válido no almoço de segunda a sexta, não cumulativo com outras promoções" /></div>
      {state.error && <div className="alert err full" role="alert">{state.error}</div>}
      <div className="field full"><button className="btn btn-sun" disabled={pending}>{pending ? "Enviando..." : "Enviar cadastro"}</button>
        <span className="hint">O cadastro fica “em análise” até os donos aprovarem.</span></div>
    </form>
  );
}
