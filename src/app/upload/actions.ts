"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import { redirect } from "next/navigation";
import { processPostWithAI } from "@/lib/ai-pipeline";
import { moderateContent, moderateImage } from "@/lib/content-moderation";
import { createPoll } from "@/app/actions/polls";
import { savePostHashtags } from "@/app/actions/hashtags";
import { addCollaborator } from "@/app/actions/collaborations";

export async function uploadPost(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  const file = formData.get("image") as File;
  const caption = formData.get("caption") as string;
  const visibility = (formData.get("visibility") as string) || "public";
  const status =
    (formData.get("status") as "published" | "scheduled" | "draft") ||
    "published";
  const scheduledAt = formData.get("scheduled_at") as string | null;
  const locationName = (formData.get("location_name") as string) || null;
  const altText = (formData.get("alt_text") as string) || null;
  const collaboratorIdInput = formData.get("collaborator_id") as string | null;
  const pollQuestion = formData.get("poll_question") as string | null;
  const pollOptionsRaw = formData.get("poll_options") as string | null;

  if (!file || !caption) {
    throw new Error("File and caption are required");
  }

  // AI content moderation — block unsafe captions before creating the post
  const moderation = await moderateContent(caption);
  if (!moderation.safe) {
    throw new Error(
      moderation.reason ||
        `Content flagged for: ${moderation.flags.join(", ")}`
    );
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
  const insertData: Record<string, unknown> = {
    user_id: user.id,
    image_url: urlData.publicUrl,
    caption,
    visibility,
    media_type: mediaType,
    status,
    location_name: locationName,
    alt_text: altText,
  };

  if (status === "scheduled" && scheduledAt) {
    insertData.scheduled_at = scheduledAt;
  }

  const { data: newPost, error: postError } = await supabaseAdmin
    .from("posts")
    .insert(insertData)
    .select("id")
    .single();

  if (postError) {
    console.error("Post creation error:", postError);
    throw new Error("Failed to create post");
  }

  // Create poll if poll data was provided
  if (newPost?.id && pollQuestion && pollOptionsRaw) {
    try {
      const pollOptionsArr: string[] = JSON.parse(pollOptionsRaw);
      if (pollOptionsArr.length >= 2) {
        await createPoll(newPost.id, pollQuestion, pollOptionsArr);
      }
    } catch (pollErr) {
      console.error("Poll creation error:", pollErr);
      // Non-fatal: post was created successfully, poll just failed
    }
  }

  // Save hashtags from caption
  if (newPost?.id) {
    savePostHashtags(newPost.id, caption).catch(() => {});
  }

  // Add collaborator if specified
  if (newPost?.id && collaboratorIdInput) {
    addCollaborator(newPost.id, collaboratorIdInput).catch(() => {});
  }

  // Trigger AI pipeline in background (non-blocking) only for published posts
  if (newPost?.id && status === "published") {
    processPostWithAI(newPost.id, caption).catch(() => {});

    // Background image moderation — if flagged, hide the post
    moderateImage(urlData.publicUrl)
      .then(async (result) => {
        if (!result.safe) {
          console.warn(
            `Image moderation flagged post ${newPost.id}: ${result.reason}`
          );
          await supabaseAdmin
            .from("posts")
            .update({ visibility: "private" })
            .eq("id", newPost.id);
        }
      })
      .catch(() => {});
  }

  if (status === "published") {
    redirect("/feed");
  } else {
    redirect("/profile");
  }
}
