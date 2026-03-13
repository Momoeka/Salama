"use server";

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import { revalidatePath } from "next/cache";
import { sendNotificationEmail } from "@/lib/email";

// ==================== LIKES ====================

export async function toggleLike(postId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  // Check if already liked
  const { data: existing } = await supabaseAdmin
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  if (existing) {
    // Unlike
    await supabaseAdmin.from("likes").delete().eq("id", existing.id);
  } else {
    // Like
    await supabaseAdmin.from("likes").insert({
      user_id: user.id,
      post_id: postId,
    });

    // Create notification for post owner
    const { data: post } = await supabaseAdmin
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (post && post.user_id !== user.id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: post.user_id,
        actor_id: user.id,
        type: "like",
        post_id: postId,
        message: `${user.username} liked your post`,
      });

      // Send email notification (non-blocking)
      const { data: postOwner } = await supabaseAdmin
        .from("users")
        .select("email, username")
        .eq("id", post.user_id)
        .single();
      if (postOwner?.email) {
        sendNotificationEmail(
          postOwner.email,
          postOwner.username,
          "like",
          `${user.username} liked your post`
        ).catch(() => {});
      }
    }
  }

  revalidatePath(`/post/${postId}`);
  revalidatePath("/feed");
}

export async function hasUserLiked(postId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await getOrCreateUser();
  if (!user) return false;

  const { data } = await supabaseAdmin
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .single();

  return !!data;
}

// ==================== COMMENTS ====================

export async function addComment(postId: string, content: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  if (!content.trim()) throw new Error("Comment cannot be empty");

  await supabaseAdmin.from("comments").insert({
    user_id: user.id,
    post_id: postId,
    content: content.trim(),
  });

  // Notification for post owner
  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (post && post.user_id !== user.id) {
    await supabaseAdmin.from("notifications").insert({
      user_id: post.user_id,
      actor_id: user.id,
      type: "comment",
      post_id: postId,
      message: `${user.username} commented on your post`,
    });

    // Send email notification (non-blocking)
    const { data: postOwner } = await supabaseAdmin
      .from("users")
      .select("email, username")
      .eq("id", post.user_id)
      .single();
    if (postOwner?.email) {
      sendNotificationEmail(
        postOwner.email,
        postOwner.username,
        "comment",
        `${user.username} commented on your post`
      ).catch(() => {});
    }
  }

  revalidatePath(`/post/${postId}`);
}

export async function deleteComment(commentId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  // Only allow deleting own comments (or admin)
  const { data: comment } = await supabaseAdmin
    .from("comments")
    .select("user_id, post_id")
    .eq("id", commentId)
    .single();

  if (!comment) throw new Error("Comment not found");
  if (comment.user_id !== user.id && user.role !== "admin") {
    throw new Error("Not authorized");
  }

  await supabaseAdmin.from("comments").delete().eq("id", commentId);
  revalidatePath(`/post/${comment.post_id}`);
}

// ==================== FOLLOWS ====================

export async function toggleFollow(targetUserId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const user = await getOrCreateUser();
  if (!user) throw new Error("Failed to get user");

  if (user.id === targetUserId) throw new Error("Cannot follow yourself");

  // Check if already following
  const { data: existing } = await supabaseAdmin
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .single();

  if (existing) {
    // Unfollow
    await supabaseAdmin.from("follows").delete().eq("id", existing.id);
  } else {
    // Follow
    await supabaseAdmin.from("follows").insert({
      follower_id: user.id,
      following_id: targetUserId,
    });

    // Notification
    await supabaseAdmin.from("notifications").insert({
      user_id: targetUserId,
      actor_id: user.id,
      type: "follow",
      message: `${user.username} started following you`,
    });

    // Send email notification (non-blocking)
    const { data: targetUser } = await supabaseAdmin
      .from("users")
      .select("email, username")
      .eq("id", targetUserId)
      .single();
    if (targetUser?.email) {
      sendNotificationEmail(
        targetUser.email,
        targetUser.username,
        "follow",
        `${user.username} started following you`
      ).catch(() => {});
    }
  }

  revalidatePath(`/profile/${targetUserId}`);
  revalidatePath("/feed");
}

export async function isFollowing(targetUserId: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await getOrCreateUser();
  if (!user) return false;

  const { data } = await supabaseAdmin
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .single();

  return !!data;
}
