import Link from "next/link";
import { requireAdmin, type Post } from "@/lib/data";
import { Status } from "@/components/Cards";
import { dateBR } from "@/lib/format";
import { deletePost } from "../actions";

export default async function AdminBlog({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  const { salvo } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  const posts = (data ?? []) as Post[];
  return (
    <div className="box">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h2>Posts do blog</h2><Link className="btn btn-sun sm" href="/admin/blog/novo">Escrever post</Link>
      </div>
      {salvo && <div className="alert ok">Post salvo.</div>}
      {posts.length ? posts.map((p) => (
        <div key={p.id} className="bitem"><i style={{ background: p.published ? "var(--ok)" : "var(--line)" }} />
          <div><b>{p.title}</b><br /><small>{p.category} · {p.published ? `publicado em ${dateBR(p.published_at)}` : "rascunho"} · /blog/{p.slug}</small></div>
          <div className="acts">
            <Status s={p.published ? "published" : "draft"} />
            <Link className="linkbtn" href={`/admin/blog/${p.id}`}>Editar</Link>
            {p.published && <Link className="linkbtn" href={`/blog/${p.slug}`}>Ver</Link>}
            <form action={deletePost}><input type="hidden" name="id" value={p.id} /><button className="linkbtn danger">Excluir</button></form>
          </div></div>
      )) : <p className="empty">Nenhum post ainda.</p>}
    </div>
  );
}
