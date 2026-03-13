import { getEmbedding, generateImageMetadata } from "./openai";
import { pineconeIndex } from "./pinecone";
import { supabaseAdmin } from "./supabase-admin";

/**
 * Process a newly created post:
 * 1. Generate AI description and tags
 * 2. Create embedding from caption + description
 * 3. Store embedding in Pinecone
 * 4. Update post in Supabase with AI metadata
 */
export async function processPostWithAI(postId: string, caption: string) {
  try {
    // Step 1: Generate AI metadata
    const { description, tags } = await generateImageMetadata(caption);

    // Step 2: Create embedding from combined text
    const embeddingText = `${caption} ${description} ${tags.join(" ")}`;
    const embedding = await getEmbedding(embeddingText);

    // Step 3: Store in Pinecone
    await pineconeIndex.upsert({
      records: [
        {
          id: postId,
          values: embedding,
          metadata: {
            caption,
            description,
            tags: tags.join(","),
            post_id: postId,
          },
        },
      ],
    });

    // Step 4: Update Supabase with AI data
    await supabaseAdmin
      .from("posts")
      .update({
        ai_description: description,
        tags,
        pinecone_id: postId,
      })
      .eq("id", postId);

    return { description, tags };
  } catch (error) {
    console.error("AI pipeline error for post", postId, ":", error);
    // Don't throw — AI is a nice-to-have, not a blocker
    return null;
  }
}

/**
 * Semantic search: embed the query and find similar posts in Pinecone
 */
export async function semanticSearch(query: string, topK: number = 12) {
  try {
    const queryEmbedding = await getEmbedding(query);

    const results = await pineconeIndex.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    const postIds = results.matches
      ?.map((m) => m.id)
      .filter(Boolean) || [];

    if (postIds.length === 0) return [];

    // Fetch full post data from Supabase
    const { data: posts } = await supabaseAdmin
      .from("posts")
      .select(
        `
        *,
        users:user_id (id, username, avatar_url, clerk_id)
      `
      )
      .in("id", postIds);

    if (!posts) return [];

    // Sort by Pinecone relevance order
    const postMap = new Map(posts.map((p: any) => [p.id, p]));
    return postIds.map((id) => postMap.get(id)).filter(Boolean);
  } catch (error) {
    console.error("Semantic search error:", error);
    return [];
  }
}
