import { openai } from "./openai";

export interface ModerationResult {
  safe: boolean;
  reason?: string;
  flags: string[];
}

export interface ImageModerationResult {
  safe: boolean;
  reason?: string;
}

/**
 * Use OpenAI chat completions to check if text content is appropriate.
 * Checks for: hate speech, violence, sexual content, harassment, self-harm, spam.
 */
export async function moderateContent(
  caption: string
): Promise<ModerationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a content moderation assistant for a social media platform. Analyze the given text and check for the following categories of inappropriate content:
- hate_speech: Hateful or discriminatory language targeting individuals or groups
- violence: Threats, glorification of violence, or graphic violent content
- sexual_content: Sexually explicit or suggestive material
- harassment: Bullying, intimidation, or targeted harassment
- self_harm: Content promoting or glorifying self-harm or suicide
- spam: Repetitive, misleading, or unsolicited promotional content

Return a JSON object with:
- "safe": boolean (true if the content is appropriate, false otherwise)
- "reason": string (explanation if not safe, omit if safe)
- "flags": array of strings (list of violated categories, empty array if safe)`,
        },
        {
          role: "user",
          content: `Analyze this social media caption for content policy violations: "${caption}"`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    return {
      safe: parsed.safe !== false,
      reason: parsed.reason || undefined,
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
    };
  } catch (error) {
    console.error("Content moderation error:", error);
    // Fail open — allow content through if moderation service is unavailable
    return { safe: true, flags: [] };
  }
}

/**
 * Use OpenAI vision to check if an image is appropriate.
 */
export async function moderateImage(
  imageUrl: string
): Promise<ImageModerationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an image content moderation assistant. Analyze the provided image and determine if it contains inappropriate content such as:
- Explicit nudity or sexual content
- Graphic violence or gore
- Hate symbols or imagery
- Self-harm imagery
- Illegal activities

Return a JSON object with:
- "safe": boolean (true if the image is appropriate, false otherwise)
- "reason": string (explanation if not safe, omit if safe)`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Is this image appropriate for a social media platform?",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");
    return {
      safe: parsed.safe !== false,
      reason: parsed.reason || undefined,
    };
  } catch (error) {
    console.error("Image moderation error:", error);
    // Fail open
    return { safe: true };
  }
}
