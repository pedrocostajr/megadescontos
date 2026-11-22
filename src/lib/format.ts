export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dateBR = (s: string | null | undefined) =>
  s ? new Date(s.length === 10 ? `${s}T12:00:00` : s).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "";

export const dateTimeBR = (s: string) =>
  new Date(s).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export const slugify = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
