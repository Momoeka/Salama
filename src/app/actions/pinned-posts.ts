"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

export async function togglePinPost(postId: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Not authenticated");

  // Check if post belongs to user
  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("id, is_pinned, user_id")
    .eq("id", postId)
    .single();

  if (!post || post.user_id !== user.id) {
    throw new Error("Not authorized");
  }

  if (post.is_pinned) {
    // Unpin
    await supabaseAdmin
      .from("posts")
      .update({ is_pinned: false, pinned_at: null })
      .eq("id", postId);
  } else {
    // Check max 3 pinned
    const { count } = await supabaseAdmin
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_pinned", true);

    if ((count || 0) >= 3) {
      throw new Error("You can pin a maximum of 3 posts");
    }

    await supabaseAdmin
      .from("posts")
      .update({ is_pinned: true, pinned_at: new Date().toISOString() })
      .eq("id", postId);
  }

  revalidatePath("/profile");
}

export async function getPinnedPosts(userId: string) {
  const { data } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("user_id", userId)
    .eq("is_pinned", true)
    .order("pinned_at", { ascending: false });

  return data || [];
}
