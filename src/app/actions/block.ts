"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

// ==================== BLOCK USER ====================

export async function blockUser(targetUserId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  if (user.id === targetUserId) throw new Error("Cannot block yourself");

  // Insert block record
  const { error } = await supabaseAdmin.from("blocks").insert({
    blocker_id: user.id,
    blocked_id: targetUserId,
  });

  if (error && error.code !== "23505") {
    // 23505 = unique violation (already blocked)
    throw new Error("Failed to block user");
  }

  // Unfollow both directions
  await supabaseAdmin
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId);

  await supabaseAdmin
    .from("follows")
    .delete()
    .eq("follower_id", targetUserId)
    .eq("following_id", user.id);

  // Delete any conversations between the two users
  await supabaseAdmin
    .from("conversations")
    .delete()
    .or(
      `and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`
    );

  revalidatePath(`/profile/${targetUserId}`);
  revalidatePath("/feed");
  revalidatePath("/messages");
}

// ==================== UNBLOCK USER ====================

export async function unblockUser(targetUserId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  await supabaseAdmin
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetUserId);

  revalidatePath(`/profile/${targetUserId}`);
  revalidatePath("/feed");
}

// ==================== CHECK IF BLOCKED ====================

export async function isBlocked(targetUserId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await getOrCreateUser();
  if (!user) return false;

  const { data } = await supabaseAdmin
    .from("blocks")
    .select("id")
    .eq("blocker_id", user.id)
    .eq("blocked_id", targetUserId)
    .single();

  return !!data;
}

// ==================== CHECK IF BLOCKED BY ====================

export async function isBlockedBy(targetUserId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await getOrCreateUser();
  if (!user) return false;

  const { data } = await supabaseAdmin
    .from("blocks")
    .select("id")
    .eq("blocker_id", targetUserId)
    .eq("blocked_id", user.id)
    .single();

  return !!data;
}

// ==================== GET BLOCKED USERS ====================

export async function getBlockedUsers() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  const { data, error } = await supabaseAdmin
    .from("blocks")
    .select("*, blocked:blocked_id(id, username, avatar_url)")
    .eq("blocker_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to get blocked users");

  return data || [];
}
