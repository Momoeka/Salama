/**
 * Index existing posts into Pinecone for semantic search.
 * Run: node --env-file=.env.local index-posts.mjs
 */

import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX || "salama-posts");

async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 2048,
  });
  return response.data[0].embedding;
}

async function main() {
  console.log("Fetching posts from Supabase...");
  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, caption, ai_description, tags")
    .is("pinecone_id", null);

  if (error) {
    console.error("Error fetching posts:", error);
    return;
  }

  if (!posts || posts.length === 0) {
    console.log("No un-indexed posts found.");
    return;
  }

  console.log(`Found ${posts.length} posts to index.`);

  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  let indexed = 0;

  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);

    const vectors = await Promise.all(
      batch.map(async (post) => {
        const text = [
          post.caption,
          post.ai_description,
          Array.isArray(post.tags) ? post.tags.join(" ") : "",
        ]
          .filter(Boolean)
          .join(" ");

        const embedding = await getEmbedding(text);
        return {
          id: post.id,
          values: embedding,
          metadata: {
            caption: post.caption || "",
            description: post.ai_description || "",
            tags: Array.isArray(post.tags) ? post.tags.join(",") : "",
            post_id: post.id,
          },
        };
      })
    );

    await index.upsert(vectors);

    // Update Supabase to mark as indexed
    for (const post of batch) {
      await supabase
        .from("posts")
        .update({ pinecone_id: post.id })
        .eq("id", post.id);
    }

    indexed += batch.length;
    console.log(`  Indexed ${indexed}/${posts.length} posts`);

    // Small delay between batches
    if (i + batchSize < posts.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`\nDone! Indexed ${indexed} posts into Pinecone.`);
}

main().catch(console.error);
