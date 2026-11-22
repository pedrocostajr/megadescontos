"use client";
import { useActionState } from "react";
import { saveOffer } from "../actions";
import { PctPick } from "@/app/seja-parceiro/PartnerSignup";
import type { Partner } from "@/lib/data";

export function OfferForm({ p }: { p: Partner }) {
  const [state, action, pending] = useActionState(saveOffer, { error: "" });
  return (
    <form className="box" action={action}>
      <h2>Minha oferta</h2>
      <input type="hidden" name="partner_id" value={p.id} />
      <div className="field"><span className="label">Desconto para assinantes</span><PctPick name="discount_pct" value={p.discount_pct} /></div>
      <div className="field"><label htmlFor="rules">Regras de uso</label><textarea id="rules" name="rules" defaultValue={p.rules ?? ""} /></div>
      <div className="field"><label htmlFor="description">Sobre o lugar</label><textarea id="description" name="description" defaultValue={p.description ?? ""} /></div>
      <div className="field"><label htmlFor="cover_url">Link da foto de capa (opcional)</label><input id="cover_url" name="cover_url" type="url" defaultValue={p.cover_url ?? ""} placeholder="https://..." />
        <span className="hint">Use uma foto do seu estabelecimento. O envio de arquivo direto pelo painel entra numa próxima etapa.</span></div>
      {state.error && <div className="alert err" role="alert">{state.error}</div>}
      {state.ok && <div className="alert ok" role="status">{state.ok}</div>}
      <button className="btn btn-sun" disabled={pending} style={{ justifySelf: "start" }}>{pending ? "Salvando..." : "Salvar oferta"}</button>
    </form>
  );
}
