"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";

export async function getSuggestedUsers(limit = 5) {
  const user = await getOrCreateUser().catch(() => null);
  if (!user) return [];

  // Get IDs the current user already follows
  const { data: following } = await supabaseAdmin
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);

  const followingIds = (following || []).map((f: any) => f.following_id);
  followingIds.push(user.id); // exclude self

  // Get random users not in the following list
  let query = supabaseAdmin
    .from("users")
    .select("id, username, avatar_url")
    .not("id", "in", `(${followingIds.join(",")})`)
    .limit(limit * 3); // fetch more to randomize

  const { data: users } = await query;
  if (!users || users.length === 0) return [];

  // Shuffle and pick `limit`
  const shuffled = users.sort(() => Math.random() - 0.5).slice(0, limit);

  // Get follower counts
  const result = await Promise.all(
    shuffled.map(async (u: any) => {
      const { count } = await supabaseAdmin
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", u.id);

      return {
        id: u.id,
        username: u.username,
        avatar_url: u.avatar_url,
        followerCount: count || 0,
      };
    })
  );

  return result;
}
