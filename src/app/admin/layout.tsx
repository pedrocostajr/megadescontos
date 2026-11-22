import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/data";
import { SideNav } from "@/components/SideNav";

export const metadata: Metadata = { title: "Painel dos donos", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, profile } = await requireAdmin();
  const [{ count: pend }, { count: reqs }] = await Promise.all([
    supabase.from("partners").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("banner_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return (
    <section className="band dash-band"><div className="wrap">
      <div className="dash-head"><div><div className="eyebrow">Painel dos donos</div><h1>Olá, {(profile.full_name || profile.email).split(/[ @]/)[0]}</h1></div>
        <Link className="btn btn-line" href="/">Ver o site</Link></div>
      <div className="dash">
        <SideNav items={[
          { href: "/admin", label: "Visão geral" },
          { href: "/admin/empresas", label: "Empresas", count: pend ?? 0 },
          { href: "/admin/ofertas", label: "Ofertas" },
          { href: "/admin/banners", label: "Banners e anúncios", count: reqs ?? 0 },
          { href: "/admin/blog", label: "Blog" },
          { href: "/admin/assinantes", label: "Assinantes" },
          { href: "/admin/configuracoes", label: "Configurações" },
        ]} />
        <div className="dash-main">{children}</div>
      </div>
    </div></section>
  );
}
