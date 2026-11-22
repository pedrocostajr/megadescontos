"use client";
import { useActionState, useRef, useState } from "react";
import { savePost } from "../../actions";
import { Serp } from "@/components/Cards";
import { slugify } from "@/lib/format";
import type { Post } from "@/lib/data";

const CATS = ["Notícias", "Roteiros", "Gastronomia", "Passeios", "Eventos", "Hospedagem"];

export function PostForm({ post, base }: { post: Post | null; base: string }) {
  const [state, action, pending] = useActionState(savePost, { error: "" });
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const effSlug = slugTouched ? slug : slugify(title);
  // guarda qual botão foi clicado (publicar ou rascunho) antes do envio
  const intentRef = useRef<HTMLInputElement>(null);
  const setIntent = (v: string) => { if (intentRef.current) intentRef.current.value = v; };

  return (
    <form className="two" action={action}>
      <input type="hidden" name="intent" defaultValue="publish" ref={intentRef} />
      <div className="box">
        <h2>{post ? "Editar post" : "Novo post"}</h2>
        <input type="hidden" name="id" value={post?.id ?? ""} />
        <div className="field"><label htmlFor="p-title">Título <span className="note">({title.length}/60 aparecem no Google)</span></label>
          <input id="p-title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex.: Natal na serra: o que fazer com crianças" /></div>
        <div className="field"><label htmlFor="p-slug">Endereço do post</label>
          <input id="p-slug" name="slug" value={effSlug} onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }} />
          <span className="hint">{base}/blog/{effSlug || "..."}</span></div>
        <div className="field"><label htmlFor="p-cat">Categoria</label>
          <select id="p-cat" name="category" defaultValue={post?.category ?? "Notícias"}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="field"><label htmlFor="p-excerpt">Resumo para o Google <span className="note">({excerpt.length}/160)</span></label>
          <textarea id="p-excerpt" name="excerpt" maxLength={220} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Uma ou duas frases que fazem a pessoa clicar" /></div>
        <div className="field"><label htmlFor="p-body">Texto</label>
          <textarea id="p-body" name="body" defaultValue={post?.body ?? ""} style={{ minHeight: 280 }} />
          <span className="hint">Separe os parágrafos com uma linha em branco. Comece uma linha com “## ” para criar um subtítulo.</span></div>
      </div>
      <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
        <div className="box"><h3>Prévia no Google</h3><Serp title={title} slug={effSlug} desc={excerpt} base={base} /></div>
        <div className="box">
          <h3>Imagem e ingresso</h3>
          <div className="field"><label htmlFor="p-cover">Link da imagem de capa (opcional)</label><input id="p-cover" name="cover_url" type="url" defaultValue={post?.cover_url ?? ""} placeholder="https://..." /></div>
          <div className="field"><label htmlFor="p-ticket">Ingresso à venda (opcional)</label><input id="p-ticket" name="ticket_label" defaultValue={post?.ticket_label ?? ""} placeholder="Ex.: Ingresso Natal Luz" /></div>
          <div className="field"><label htmlFor="p-price">Preço do ingresso</label><input id="p-price" name="ticket_price" inputMode="decimal" defaultValue={post?.ticket_price ?? ""} placeholder="Ex.: 150" /></div>
        </div>
        {state.error && <div className="alert err" role="alert">{state.error}</div>}
        <div className="acts">
          <button className="btn btn-sun" onClick={() => setIntent("publish")} disabled={pending}>{pending ? "Salvando..." : post?.published ? "Salvar e manter publicado" : "Publicar"}</button>
          <button className="btn btn-line" onClick={() => setIntent("draft")} disabled={pending}>{post?.published ? "Despublicar" : "Salvar rascunho"}</button>
        </div>
      </div>
    </form>
  );
}
