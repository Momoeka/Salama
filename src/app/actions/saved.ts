"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

// ==================== TOGGLE SAVE POST ====================

export async function toggleSavePost(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  // Check if already saved
  const { data: existing } = await supabaseAdmin
    .from("saved_posts")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  if (existing) {
    // Unsave
    await supabaseAdmin.from("saved_posts").delete().eq("id", existing.id);
  } else {
    // Save
    await supabaseAdmin.from("saved_posts").insert({
      user_id: user.id,
      post_id: postId,
    });
  }

  revalidatePath(`/post/${postId}`);
  revalidatePath("/saved");
  revalidatePath("/feed");
}

// ==================== CHECK IF SAVED ====================

export async function hasSavedPost(postId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await getOrCreateUser();
  if (!user) return false;

  const { data } = await supabaseAdmin
    .from("saved_posts")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  return !!data;
}

// ==================== GET SAVED POSTS ====================

export async function getSavedPosts() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  const { data, error } = await supabaseAdmin
    .from("saved_posts")
    .select("*, post:post_id(*, user:user_id(id, username, avatar_url))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to get saved posts");

  return data || [];
}
