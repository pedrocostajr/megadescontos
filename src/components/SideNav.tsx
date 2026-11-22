"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SideNav({ items }: { items: { href: string; label: string; count?: number }[] }) {
  const path = usePathname();
  return (
    <nav className="side" aria-label="Seções do painel">
      {items.map((it) => {
        const on = it.href === path || (it.href !== items[0].href && path.startsWith(it.href));
        return (
          <Link key={it.href} href={it.href} className={on ? "on" : ""} aria-current={on ? "page" : undefined}>
            {it.label}{it.count ? <span className="cnt">{it.count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
