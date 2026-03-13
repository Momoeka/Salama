"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";

export async function reactToStory(storyId: string, emoji: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Not authenticated");

  // Upsert reaction (one reaction per user per story)
  const { error } = await supabaseAdmin
    .from("story_reactions")
    .upsert(
      { story_id: storyId, user_id: user.id, emoji },
      { onConflict: "story_id,user_id" }
    );

  if (error) throw new Error("Failed to react");
  return { ok: true };
}

export async function getStoryReactions(storyId: string) {
  const { data } = await supabaseAdmin
    .from("story_reactions")
    .select("emoji, user_id, users:user_id (username)")
    .eq("story_id", storyId);

  if (!data) return { total: 0, reactions: {} };

  // Group by emoji
  const reactions: Record<string, number> = {};
  for (const r of data) {
    reactions[r.emoji] = (reactions[r.emoji] || 0) + 1;
  }

  return { total: data.length, reactions };
}
