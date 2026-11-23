import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/format";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed = ["", "/parceiros", "/passaporte", "/blog", "/seja-parceiro"].map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const, priority: p ? 0.8 : 1 }));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // Sem as variáveis do Supabase (ex.: build sem env configurado), publica só as páginas fixas.
  if (!url || !key) return fixed;
  const supabase = createClient(url, key);
  const [{ data: posts }, { data: partners }] = await Promise.all([
    supabase.from("posts").select("slug,updated_at").eq("published", true),
    supabase.from("partners").select("slug,created_at").eq("status", "approved"),
  ]);
  return [
    ...fixed,
    ...(posts ?? []).map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updated_at, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...(partners ?? []).map((p) => ({ url: `${SITE_URL}/parceiros/${p.slug}`, lastModified: p.created_at, priority: 0.6 })),
  ];
}
