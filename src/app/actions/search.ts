"use server";

import { semanticSearch } from "@/lib/ai-pipeline";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function searchPosts(query: string) {
  if (!query || query.trim().length < 2) return [];

  // Try semantic search first (if Pinecone has embeddings)
  const aiResults = await semanticSearch(query.trim());
  if (aiResults.length > 0) return aiResults;

  // Fallback: text search in Supabase
  const { data: posts } = await supabaseAdmin
    .from("posts")
    .select(
      `
      *,
      users:user_id (id, username, avatar_url, clerk_id)
    `
    )
    .or(
      `caption.ilike.%${query}%,ai_description.ilike.%${query}%`
    )
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(20);

  return posts || [];
}
