"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";

export async function createStory(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  const file = formData.get("media") as File;
  const caption = (formData.get("caption") as string) || "";

  if (!file) {
    throw new Error("Media file is required");
  }

  const isVideo = file.type.startsWith("video/");
  const mediaType = isVideo ? "video" : "image";

  // Upload to Supabase Storage
  const fileExt = file.name.split(".").pop();
  const fileName = `stories/${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("post-images")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Story upload error:", uploadError);
    throw new Error("Failed to upload story media");
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("post-images")
    .getPublicUrl(fileName);

  const { error: insertError } = await supabaseAdmin.from("stories").insert({
    user_id: user.id,
    media_url: urlData.publicUrl,
    media_type: mediaType,
    caption,
  });

  if (insertError) {
    console.error("Story insert error:", insertError);
    throw new Error("Failed to create story");
  }

  return { success: true };
}

export interface StoryItem {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
}

export interface UserWithStories {
  user_id: string;
  username: string;
  avatar_url: string | null;
  stories: StoryItem[];
}

export async function getActiveStories(): Promise<UserWithStories[]> {
  const { data: stories } = await supabaseAdmin
    .from("stories")
    .select(
      `
      *,
      users:user_id (id, username, avatar_url)
    `
    )
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: true });

  if (!stories || stories.length === 0) return [];

  // Group stories by user
  const grouped = new Map<string, UserWithStories>();

  for (const story of stories) {
    const storyUser = story.users as unknown as {
      id: string;
      username: string;
      avatar_url: string | null;
    };

    if (!grouped.has(storyUser.id)) {
      grouped.set(storyUser.id, {
        user_id: storyUser.id,
        username: storyUser.username,
        avatar_url: storyUser.avatar_url,
        stories: [],
      });
    }

    grouped.get(storyUser.id)!.stories.push({
      id: story.id,
      user_id: story.user_id,
      media_url: story.media_url,
      media_type: story.media_type,
      caption: story.caption,
      created_at: story.created_at,
      expires_at: story.expires_at,
    });
  }

  return Array.from(grouped.values());
}

export async function deleteStory(storyId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  const { error } = await supabaseAdmin
    .from("stories")
    .delete()
    .eq("id", storyId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Delete story error:", error);
    throw new Error("Failed to delete story");
  }

  return { success: true };
}
