"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, CATEGORIES } from "@/lib/data";
import { slugify } from "@/lib/format";

const done = (...paths: string[]) => { revalidatePath("/", "layout"); paths.forEach((p) => revalidatePath(p)); };

export async function setPartnerStatus(form: FormData) {
  const { supabase } = await requireAdmin();
  const status = String(form.get("status"));
  if (!["approved", "rejected", "pending"].includes(status)) return;
  await supabase.from("partners").update({ status }).eq("id", String(form.get("id")));
  done("/admin/empresas");
}

export async function updateOffer(form: FormData) {
  const { supabase } = await requireAdmin();
  const pct = Number(form.get("discount_pct"));
  const category = String(form.get("category"));
  if (!(pct >= 10 && pct <= 30) || !(CATEGORIES as readonly string[]).includes(category)) return;
  await supabase.from("partners").update({
    discount_pct: pct, category,
    rules: String(form.get("rules") ?? "").trim() || null,
  }).eq("id", String(form.get("id")));
  done("/admin/ofertas");
}

export async function deletePartner(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("partners").delete().eq("id", String(form.get("id")));
  done("/admin/empresas");
}

export async function createBanner(_: { error: string; ok?: string }, form: FormData) {
  const { supabase } = await requireAdmin();
  const title = String(form.get("title") ?? "").trim();
  const partnerId = String(form.get("partner_id") ?? "");
  const manual = String(form.get("sponsor_manual") ?? "").trim();
  let sponsor = manual;
  if (partnerId) {
    const { data } = await supabase.from("partners").select("name").eq("id", partnerId).single();
    sponsor = data?.name ?? manual;
  }
  if (!title || !sponsor) return { error: "Preencha a chamada e o anunciante." };
  const position = String(form.get("position"));
  const { data: price } = await supabase.from("settings").select("value").eq("key", `price_${position}`).single();
  const { error } = await supabase.from("banners").insert({
    title, sponsor_name: sponsor, partner_id: partnerId || null, position,
    color: String(form.get("color") ?? "#C8101A"),
    link_url: String(form.get("link_url") ?? "").trim() || null,
    starts_on: String(form.get("starts_on")), ends_on: String(form.get("ends_on")),
    price_month: Number(price?.value ?? 0),
  });
  if (error) return { error: error.message };
  done("/admin/banners");
  return { error: "", ok: "Banner publicado. Ele já aparece no site." };
}

export async function toggleBanner(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("banners").update({ status: String(form.get("status")) === "ativo" ? "pausado" : "ativo" }).eq("id", String(form.get("id")));
  done("/admin/banners");
}

export async function deleteBanner(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("banners").delete().eq("id", String(form.get("id")));
  done("/admin/banners");
}

export async function decideRequest(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id"));
  const approve = String(form.get("decision")) === "approve";
  const { data: r } = await supabase.from("banner_requests").select("*, partner:partners(name)").eq("id", id).single();
  if (!r) return;
  await supabase.from("banner_requests").update({ status: approve ? "approved" : "rejected" }).eq("id", id);
  if (approve) {
    const { data: price } = await supabase.from("settings").select("value").eq("key", `price_${r.position}`).single();
    const end = new Date(); end.setMonth(end.getMonth() + r.months);
    await supabase.from("banners").insert({
      title: r.title, sponsor_name: r.partner?.name ?? "Parceiro", partner_id: r.partner_id, position: r.position,
      color: ["#C8101A", "#FF8A00", "#2E9F18", "#00A6ED"][Math.floor(Math.random() * 4)],
      ends_on: end.toISOString().slice(0, 10), price_month: Number(price?.value ?? 0),
    });
  }
  done("/admin/banners");
}

export async function savePost(_: { error: string }, form: FormData): Promise<{ error: string }> {
  const { supabase, user } = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const title = String(form.get("title") ?? "").trim();
  if (!title) return { error: "Escreva um título." };
  const slug = slugify(String(form.get("slug") ?? "") || title);
  const publish = String(form.get("intent")) === "publish";
  const price = parseFloat(String(form.get("ticket_price") ?? "").replace(",", "."));
  const row = {
    title, slug,
    category: String(form.get("category") ?? "Notícias"),
    excerpt: String(form.get("excerpt") ?? "").trim(),
    body: String(form.get("body") ?? ""),
    cover_url: String(form.get("cover_url") ?? "").trim() || null,
    ticket_label: String(form.get("ticket_label") ?? "").trim() || null,
    ticket_price: Number.isFinite(price) ? price : null,
    published: publish,
    updated_at: new Date().toISOString(),
  };
  let res;
  if (id) {
    const { data: cur } = await supabase.from("posts").select("published_at").eq("id", id).single();
    res = await supabase.from("posts").update({ ...row, published_at: publish ? (cur?.published_at ?? new Date().toISOString()) : cur?.published_at ?? null }).eq("id", id);
  } else {
    res = await supabase.from("posts").insert({ ...row, author_id: user.id, published_at: publish ? new Date().toISOString() : null });
  }
  if (res.error) return { error: res.error.code === "23505" ? "Já existe um post com esse endereço. Mude o endereço." : res.error.message };
  done("/blog", `/blog/${slug}`, "/admin/blog");
  redirect("/admin/blog?salvo=1");
}

export async function deletePost(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("posts").delete().eq("id", String(form.get("id")));
  done("/blog", "/admin/blog");
}

export async function saveSettings(_: { error: string; ok?: string }, form: FormData) {
  const { supabase } = await requireAdmin();
  const keys = ["passport_price", "coupon_minutes", "price_home", "price_categoria", "price_blog"];
  for (const k of keys) {
    const v = Number(String(form.get(k) ?? "").replace(",", "."));
    if (!Number.isFinite(v) || v <= 0) return { error: `Valor inválido em ${k}.` };
  }
  const { error } = await supabase.from("settings").upsert(keys.map((k) => ({ key: k, value: String(form.get(k)).replace(",", ".") })));
  if (error) return { error: error.message };
  done("/admin/configuracoes", "/passaporte");
  return { error: "", ok: "Configurações salvas." };
}

export async function addAdminEmail(form: FormData) {
  const { supabase } = await requireAdmin();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return;
  await supabase.from("admin_emails").upsert({ email });
  // se a pessoa já tem conta, vira admin na hora
  await supabase.from("profiles").update({ role: "admin" }).eq("email", email);
  done("/admin/configuracoes");
}
