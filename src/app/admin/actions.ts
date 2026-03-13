"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Not authenticated");
  if (user.role !== "admin") throw new Error("Not authorized");
  return user;
}

export async function deleteUser(userId: string) {
  await requireAdmin();

  // Delete user's comments
  await supabaseAdmin.from("comments").delete().eq("user_id", userId);

  // Delete likes on user's posts
  const { data: userPosts } = await supabaseAdmin
    .from("posts")
    .select("id")
    .eq("user_id", userId);

  if (userPosts && userPosts.length > 0) {
    const postIds = userPosts.map((p: any) => p.id);
    await supabaseAdmin.from("comments").delete().in("post_id", postIds);
    await supabaseAdmin.from("likes").delete().in("post_id", postIds);
  }

  // Delete user's likes
  await supabaseAdmin.from("likes").delete().eq("user_id", userId);

  // Delete user's posts
  await supabaseAdmin.from("posts").delete().eq("user_id", userId);

  // Delete follows
  await supabaseAdmin.from("follows").delete().eq("follower_id", userId);
  await supabaseAdmin.from("follows").delete().eq("following_id", userId);

  // Delete notifications
  await supabaseAdmin.from("notifications").delete().eq("user_id", userId);
  await supabaseAdmin.from("notifications").delete().eq("actor_id", userId);

  // Delete the user
  await supabaseAdmin.from("users").delete().eq("id", userId);

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();

  if (role !== "admin" && role !== "user") {
    throw new Error("Invalid role");
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update({ role })
    .eq("id", userId);

  if (error) throw new Error("Failed to update role");

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function deletePost(postId: string) {
  await requireAdmin();

  // Delete comments on the post
  await supabaseAdmin.from("comments").delete().eq("post_id", postId);

  // Delete likes on the post
  await supabaseAdmin.from("likes").delete().eq("post_id", postId);

  // Delete notifications related to the post
  await supabaseAdmin.from("notifications").delete().eq("post_id", postId);

  // Delete the post
  await supabaseAdmin.from("posts").delete().eq("id", postId);

  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath("/feed");
}
