import { notFound } from "next/navigation";
import { requireAdmin, type Post } from "@/lib/data";
import { SITE_URL } from "@/lib/format";
import { PostForm } from "./PostForm";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  let post: Post | null = null;
  if (id !== "novo") {
    const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    post = data as Post;
  }
  return <PostForm post={post} base={SITE_URL} />;
}
