import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/format";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/empresa", "/conta", "/entrar", "/auth"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
