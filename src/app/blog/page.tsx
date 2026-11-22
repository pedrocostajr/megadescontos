import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getActiveBanner, type Post } from "@/lib/data";
import { PostCard, PromoBanner } from "@/components/Cards";

export const metadata: Metadata = {
  title: "Blog: notícias e dicas da Serra Gaúcha",
  description: "Roteiros, onde comer, passeios e eventos em Gramado, Canela e toda a Serra Gaúcha.",
  alternates: { canonical: "/blog" },
};

export default async function Blog() {
  const supabase = await createClient();
  const [{ data }, banner] = await Promise.all([
    supabase.from("posts").select("*").eq("published", true).order("published_at", { ascending: false }),
    getActiveBanner("blog"),
  ]);
  const posts = (data ?? []) as Post[];
  return (
    <section className="band"><div className="wrap">
      <div className="sec-head"><div><div className="eyebrow">Blog Mega Descontos Serra</div><h1 className="page-title">Notícias e dicas da Serra Gaúcha</h1></div>
        <p>Roteiros, onde comer, passeios e eventos.</p></div>
      {banner && <div style={{ marginBottom: 24 }}><PromoBanner b={banner} /></div>}
      {posts.length ? <div className="posts">{posts.map((p, i) => <PostCard key={p.id} p={p} i={i} />)}</div> : <p className="empty">Nenhum post publicado ainda.</p>}
    </div></section>
  );
}
