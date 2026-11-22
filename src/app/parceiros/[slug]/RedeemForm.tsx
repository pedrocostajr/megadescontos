"use client";
import { useActionState } from "react";
import { redeemCoupon } from "@/app/conta/actions";

export function RedeemForm({ partnerId }: { partnerId: string }) {
  const [state, action, pending] = useActionState(redeemCoupon, { error: "" });
  return (
    <form action={action} style={{ display: "grid", gap: 12 }}>
      <input type="hidden" name="partner_id" value={partnerId} />
      <div className="field">
        <label htmlFor="bill">Valor estimado da conta (opcional)</label>
        <input id="bill" name="bill" inputMode="decimal" placeholder="Ex.: 180" />
        <span className="hint">Usado só para calcular quanto você economizou.</span>
      </div>
      {state.error && <div className="alert err" role="alert">{state.error}</div>}
      <button className="btn btn-sun" disabled={pending}>{pending ? "Gerando cupom..." : "Resgatar agora"}</button>
    </form>
  );
}
