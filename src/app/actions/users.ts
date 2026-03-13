"use server";

import { getOrCreateUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function searchUsers(query: string) {
  if (!query || query.trim().length === 0) return [];

  const currentUser = await getOrCreateUser();
  if (!currentUser) return [];

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

  return data as { id: string; username: string; avatar_url: string | null }[];
}
