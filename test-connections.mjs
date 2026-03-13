// Quick test to verify OpenAI and Pinecone connections
// Run with: node --env-file=.env.local test-connections.mjs

import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

async function testOpenAI() {
  console.log("--- Testing OpenAI ---");
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: "test connection",
    });
    console.log(
      `OpenAI OK! Embedding dimension: ${embedding.data[0].embedding.length}`
    );
    return true;
  } catch (err) {
    console.error("OpenAI FAILED:", err.message);
    return false;
  }
}

async function testPinecone() {
  console.log("\n--- Testing Pinecone ---");
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const indexes = await pc.listIndexes();
    console.log(
      "Pinecone OK! Available indexes:",
      indexes.indexes?.map((i) => i.name) || []
    );

    const indexName = process.env.PINECONE_INDEX || "salama-posts";
    const found = indexes.indexes?.find((i) => i.name === indexName);
    if (found) {
      console.log(`Index "${indexName}" found! Dimension: ${found.dimension}, Metric: ${found.metric}`);
    } else {
      console.log(
        `Index "${indexName}" NOT found. Create it in the Pinecone dashboard with dimension=1536 and metric=cosine.`
      );
    }
    return true;
  } catch (err) {
    console.error("Pinecone FAILED:", err.message);
    return false;
  }
}

const openaiOk = await testOpenAI();
const pineconeOk = await testPinecone();

console.log("\n--- Summary ---");
console.log(`OpenAI:   ${openaiOk ? "CONNECTED" : "FAILED"}`);
console.log(`Pinecone: ${pineconeOk ? "CONNECTED" : "FAILED"}`);
