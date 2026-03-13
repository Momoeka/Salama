import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

/**
 * Generate an embedding vector for text using OpenAI
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    dimensions: 2048,
  });
  return response.data[0].embedding;
}

/**
 * Generate AI description and tags for an image caption
 */
export async function generateImageMetadata(caption: string): Promise<{
  description: string;
  tags: string[];
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates rich descriptions and tags for social media posts. Return JSON with 'description' (2-3 sentence rich description expanding on the caption) and 'tags' (array of 3-6 relevant single-word tags, lowercase, no #).",
      },
      {
        role: "user",
        content: `Generate a description and tags for this post caption: "${caption}"`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 200,
  });

  try {
    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    return {
      description: parsed.description || caption,
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };
  } catch {
    return { description: caption, tags: [] };
  }
}
