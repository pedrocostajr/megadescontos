import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireUser } from "@/lib/data";
import { Countdown } from "./Countdown";

export const metadata: Metadata = { title: "Cupom", robots: { index: false } };

export default async function Cupom({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { supabase, profile } = await requireUser(`/conta/cupom/${code}`);
  const { data } = await supabase.from("coupons").select("code,discount_pct,created_at,expires_at,validated_at,partner:partners(name,city)").eq("code", code).maybeSingle();
  if (!data) notFound();
  const c = data as unknown as { code: string; discount_pct: number; created_at: string; expires_at: string; validated_at: string | null; partner: { name: string; city: string } };
  const qr = await QRCode.toDataURL(c.code, { margin: 1, width: 340, color: { dark: "#0E2231", light: "#FFFFFF" } });
  const used = Boolean(c.validated_at);

  return (
    <section className="band"><div className="wrap">
      <div className="coupon-screen">
        <div className="cp-head">
          <span className={`cp-ok ${used ? "bad" : ""}`}>{used ? "Cupom já usado" : "Cupom válido"}</span>
          <h1>{c.partner.name}</h1>
          <p>{c.partner.city} · {profile.full_name || profile.email}</p>
        </div>
        <div className="cp-card">
          <div className="cp-pct">-{c.discount_pct}%<small>de desconto nesta visita</small></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cp-qr" src={qr} alt={`QR code do cupom ${c.code}`} />
          <div className="cp-code">{c.code}</div>
          {!used && <Countdown createdAt={c.created_at} expiresAt={c.expires_at} />}
        </div>
        <div className="cp-foot">
          <span>Mostre esta tela no caixa ou na recepção. Na próxima visita, resgate um novo cupom.</span>
          <Link className="btn btn-line" href="/conta">Ver meus cupons</Link>
        </div>
      </div>
    </div></section>
  );
}
