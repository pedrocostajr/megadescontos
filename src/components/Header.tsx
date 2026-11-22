import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/data";

export async function Header() {
  const { profile } = await getSession();
  const panel = profile?.role === "admin" ? "/admin" : profile?.role === "partner" ? "/empresa" : "/conta";
  return (
    <header className="top">
      <div className="wrap">
        <Link href="/" className="logo" aria-label="Mega Descontos Serra, início">
          <Image src="/img/logo-mega.png" alt="Mega Descontos Serra" width={176} height={93} priority />
        </Link>
        <input type="checkbox" id="menu" className="menu-toggle" aria-hidden="true" tabIndex={-1} />
        <label htmlFor="menu" className="menu-btn">Menu</label>
        <nav className="main" aria-label="Principal">
          <Link href="/">Início</Link>
          <Link href="/parceiros">Parceiros</Link>
          <Link href="/passaporte">Passaporte</Link>
          <Link href="/seja-parceiro">Sou empresa</Link>
          <Link href="/blog">Blog</Link>
          <Link href={profile ? panel : "/entrar"}>{profile ? "Meu painel" : "Entrar"}</Link>
          <Link href="/passaporte" className="cta">Quero meu passaporte</Link>
        </nav>
      </div>
    </header>
  );
}
