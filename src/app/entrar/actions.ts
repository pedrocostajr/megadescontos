"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

type State = { error: string; ok?: string };

const safeNext = (n: FormDataEntryValue | null) => {
  const s = typeof n === "string" ? n : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "";
};

async function homeFor(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "/";
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return data?.role === "admin" ? "/admin" : data?.role === "partner" ? "/empresa" : "/conta";
}

export async function signIn(_: State, form: FormData): Promise<State> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  });
  if (error) {
    if (error.message.toLowerCase().includes("not confirmed")) return { error: "Confirme seu e-mail pelo link que enviamos antes de entrar." };
    return { error: "E-mail ou senha incorretos." };
  }
  redirect(safeNext(form.get("next")) || (await homeFor(supabase)));
}

export async function signUp(_: State, form: FormData): Promise<State> {
  const supabase = await createClient();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const full_name = String(form.get("full_name") ?? "").trim();
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  const h = await headers();
  const origin = h.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  const next = safeNext(form.get("next"));
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { full_name }, emailRedirectTo: `${origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}` },
  });
  if (error) {
    if (error.message.toLowerCase().includes("registered")) return { error: "Este e-mail já tem conta. Use a aba Entrar." };
    return { error: `Não foi possível criar a conta: ${error.message}` };
  }
  if (data.session) redirect(next || (await homeFor(supabase)));
  return { error: "", ok: `Conta criada. Enviamos um link de confirmação para ${email}. Abra o e-mail e depois entre aqui.` };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
