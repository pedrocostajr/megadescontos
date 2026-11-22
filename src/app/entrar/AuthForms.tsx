"use client";
import { useActionState, useState } from "react";
import { signIn, signUp } from "./actions";

export function AuthForms({ next }: { next: string }) {
  const [tab, setTab] = useState<"in" | "up">("in");
  const [inState, inAction, inPending] = useActionState(signIn, { error: "" });
  const [upState, upAction, upPending] = useActionState(signUp, { error: "" });
  return (
    <div className="form" style={{ maxWidth: 460, margin: "0 auto" }}>
      <div className="cats" role="tablist" style={{ marginBottom: 0 }}>
        <button type="button" role="tab" aria-selected={tab === "in"} className={`chip ${tab === "in" ? "on" : ""}`} onClick={() => setTab("in")}>Entrar</button>
        <button type="button" role="tab" aria-selected={tab === "up"} className={`chip ${tab === "up" ? "on" : ""}`} onClick={() => setTab("up")}>Criar conta</button>
      </div>
      {tab === "in" ? (
        <form action={inAction} style={{ display: "grid", gap: 14 }}>
          <input type="hidden" name="next" value={next} />
          <div className="field"><label htmlFor="in-email">E-mail</label><input id="in-email" name="email" type="email" autoComplete="email" required /></div>
          <div className="field"><label htmlFor="in-pass">Senha</label><input id="in-pass" name="password" type="password" autoComplete="current-password" required /></div>
          {inState.error && <div className="alert err" role="alert">{inState.error}</div>}
          <button className="btn btn-sun" disabled={inPending}>{inPending ? "Entrando..." : "Entrar"}</button>
        </form>
      ) : (
        <form action={upAction} style={{ display: "grid", gap: 14 }}>
          <input type="hidden" name="next" value={next} />
          <div className="field"><label htmlFor="up-name">Nome</label><input id="up-name" name="full_name" autoComplete="name" required /></div>
          <div className="field"><label htmlFor="up-email">E-mail</label><input id="up-email" name="email" type="email" autoComplete="email" required /></div>
          <div className="field"><label htmlFor="up-pass">Senha</label><input id="up-pass" name="password" type="password" autoComplete="new-password" minLength={8} required />
            <span className="hint">Pelo menos 8 caracteres.</span></div>
          {upState.error && <div className="alert err" role="alert">{upState.error}</div>}
          {upState.ok && <div className="alert ok" role="status">{upState.ok}</div>}
          <button className="btn btn-sun" disabled={upPending}>{upPending ? "Criando..." : "Criar conta"}</button>
        </form>
      )}
    </div>
  );
}
