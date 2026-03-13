"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

// Extract hashtags from caption text
function parseHashtags(text: string): string[] {
  const regex = /#(\w+)/g;
  const tags: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    tags.push(match[1].toLowerCase());
  }
  return [...new Set(tags)]; // dedupe
}

// Save hashtags for a post (called after post creation)
export async function savePostHashtags(postId: string, caption: string) {
  const tags = parseHashtags(caption);
  if (tags.length === 0) return;

  for (const tag of tags) {
    // Upsert hashtag
    const { data: hashtag } = await supabaseAdmin
      .from("hashtags")
      .upsert({ name: tag, post_count: 1 }, { onConflict: "name" })
      .select("id")
      .single();

    if (hashtag) {
      // Link post to hashtag
      await supabaseAdmin
        .from("post_hashtags")
        .upsert(
          { post_id: postId, hashtag_id: hashtag.id },
          { onConflict: "post_id,hashtag_id" }
        );

      // Increment post count
      try {
        await supabaseAdmin.rpc("increment_hashtag_count", { hashtag_name: tag });
      } catch {
        // If RPC doesn't exist, just update directly
        await supabaseAdmin
          .from("hashtags")
          .update({ post_count: ((hashtag as any).post_count || 0) + 1 })
          .eq("id", hashtag.id);
      }
    }
  }
}

// Get trending hashtags (top by post_count)
export async function getTrendingHashtags(limit = 10) {
  const { data } = await supabaseAdmin
    .from("hashtags")
    .select("id, name, post_count")
    .order("post_count", { ascending: false })
    .limit(limit);

  return data || [];
}

// Get posts by hashtag
export async function getPostsByHashtag(hashtagName: string) {
  const { data: hashtag } = await supabaseAdmin
    .from("hashtags")
    .select("id")
    .eq("name", hashtagName.toLowerCase())
    .single();

  if (!hashtag) return [];

  const { data: postHashtags } = await supabaseAdmin
    .from("post_hashtags")
    .select("post_id")
    .eq("hashtag_id", hashtag.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (!postHashtags || postHashtags.length === 0) return [];

  const postIds = postHashtags.map((ph: any) => ph.post_id);

  const { data: posts } = await supabaseAdmin
    .from("posts")
    .select("id, image_url, caption, created_at, media_type, users:user_id(id, username, avatar_url)")
    .in("id", postIds)
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  return posts || [];
}

// Search hashtags
export async function searchHashtags(query: string) {
  const { data } = await supabaseAdmin
    .from("hashtags")
    .select("id, name, post_count")
    .ilike("name", `%${query}%`)
    .order("post_count", { ascending: false })
    .limit(10);

  return data || [];
}
