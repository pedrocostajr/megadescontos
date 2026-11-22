import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Link de confirmação de e-mail do Supabase
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "";
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/conta";
  return NextResponse.redirect(new URL(dest, url.origin));
}
