"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

export async function addCollaborator(postId: string, userId: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Not authenticated");

  // Verify post belongs to current user
  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("id, user_id")
    .eq("id", postId)
    .single();

  if (!post || post.user_id !== user.id) {
    throw new Error("Not authorized");
  }

  const { error } = await supabaseAdmin
    .from("post_collaborators")
    .insert({ post_id: postId, user_id: userId, status: "pending" });

  if (error) throw new Error("Failed to add collaborator");

  // Create notification
  await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    type: "collab_invite",
    content: `${user.username} invited you to collaborate on a post`,
    from_user_id: user.id,
    post_id: postId,
  });

  revalidatePath("/notifications");
}

export async function respondToCollaboration(
  collabId: string,
  accept: boolean
) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Not authenticated");

  const { data: collab } = await supabaseAdmin
    .from("post_collaborators")
    .select("id, user_id")
    .eq("id", collabId)
    .single();

  if (!collab || collab.user_id !== user.id) {
    throw new Error("Not authorized");
  }

  await supabaseAdmin
    .from("post_collaborators")
    .update({ status: accept ? "accepted" : "rejected" })
    .eq("id", collabId);

  revalidatePath("/profile");
  revalidatePath("/notifications");
}

export async function getCollaborators(postId: string) {
  const { data } = await supabaseAdmin
    .from("post_collaborators")
    .select("*, users:user_id (id, username, avatar_url)")
    .eq("post_id", postId)
    .eq("status", "accepted");

  return data || [];
}

export async function getPendingCollaborations() {
  const user = await getOrCreateUser();
  if (!user) return [];

  const { data } = await supabaseAdmin
    .from("post_collaborators")
    .select(
      "*, posts:post_id (id, image_url, caption, users:user_id (id, username, avatar_url))"
    )
    .eq("user_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return data || [];
}
