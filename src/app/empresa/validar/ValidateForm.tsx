"use client";
import { useActionState } from "react";
import { validateCoupon } from "../actions";

export function ValidateForm() {
  const [res, action, pending] = useActionState(validateCoupon, null);
  return (
    <form action={action} style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input className="code-input" name="code" placeholder="MDS-XXXX-XX" autoComplete="off" aria-label="Código do cupom" autoFocus />
        <button className="btn btn-sun" disabled={pending}>{pending ? "Validando..." : "Validar"}</button>
      </div>
      {res && <div className={`vres ${res.ok ? "ok" : "bad"}`} role="status"><b>{res.msg}</b>{res.detail}</div>}
    </form>
  );
}
