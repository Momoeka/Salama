"use server";

import { getOrCreateUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function searchUsers(query: string) {
  if (!query || query.trim().length === 0) return [];

  const currentUser = await getOrCreateUser();
  if (!currentUser) return [];

  // Get blocked user IDs (both directions)
  const { data: blocks } = await supabaseAdmin
    .from("blocks")
    .select("blocked_id, blocker_id")
    .or(`blocker_id.eq.${currentUser.id},blocked_id.eq.${currentUser.id}`);

  const blockedIds = new Set<string>();
  (blocks || []).forEach((b: any) => {
    if (b.blocker_id === currentUser.id) blockedIds.add(b.blocked_id);
    if (b.blocked_id === currentUser.id) blockedIds.add(b.blocker_id);
  });

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, username, avatar_url")
    .ilike("username", `%${query.trim()}%`)
    .neq("id", currentUser.id)
    .limit(20);

  if (error) {
    console.error("Failed to search users:", error);
    return [];
  }

  // Filter out blocked users
  return (data || []).filter(
    (u: any) => !blockedIds.has(u.id)
  ) as { id: string; username: string; avatar_url: string | null }[];
}
