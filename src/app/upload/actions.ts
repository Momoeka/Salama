"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { processPostWithAI } from "@/lib/ai-pipeline";

export async function uploadPost(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  const file = formData.get("image") as File;
  const caption = formData.get("caption") as string;
  const visibility = (formData.get("visibility") as string) || "public";

  if (!file || !caption) {
    throw new Error("File and caption are required");
  }

  // Detect media type from the file
  const mediaType = file.type.startsWith("video/") ? "video" : "image";

  // Upload to Supabase Storage
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("post-images")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error("Failed to upload file");
  }

  // Get the public URL
  const { data: urlData } = supabaseAdmin.storage
    .from("post-images")
    .getPublicUrl(fileName);

  // Create the post in the database
  // Note: requires media_type column on posts table (see posts-video-schema.sql)
  const { data: newPost, error: postError } = await supabaseAdmin
    .from("posts")
    .insert({
      user_id: user.id,
      image_url: urlData.publicUrl,
      caption,
      visibility,
      media_type: mediaType,
    })
    .select("id")
    .single();

  if (postError) {
    console.error("Post creation error:", postError);
    throw new Error("Failed to create post");
  }

  // Trigger AI pipeline in background (non-blocking)
  if (newPost?.id) {
    processPostWithAI(newPost.id, caption).catch(() => {});
  }

  redirect("/feed");
}
