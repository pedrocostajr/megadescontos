"use client";
import { useEffect, useState } from "react";

export function Countdown({ createdAt, expiresAt }: { createdAt: string; expiresAt: string }) {
  const start = new Date(createdAt).getTime();
  const end = new Date(expiresAt).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = Math.max(0, end - now);
  const m = Math.floor(left / 60000), s = Math.floor(left / 1000) % 60;
  if (!left) return <div className="cp-timer" style={{ color: "var(--red)" }}>Cupom expirado. Resgate um novo na página do parceiro.</div>;
  return (
    <>
      <div className="cp-timer"><span className="live" />Expira em <b>{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</b></div>
      <div className="cp-bar"><i style={{ width: `${(left / (end - start)) * 100}%` }} /></div>
    </>
  );
}
