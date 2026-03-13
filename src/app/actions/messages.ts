"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

export async function getConversations() {
  const user = await getOrCreateUser();
  if (!user) return [];

  // Get all conversations where the current user is a participant
  const { data: conversations } = await supabaseAdmin
    .from("conversations")
    .select(
      "*, user1:user1_id(id, username, avatar_url), user2:user2_id(id, username, avatar_url)"
    )
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  if (!conversations) return [];

  // For each conversation, get the last message and unread count
  const enriched = await Promise.all(
    conversations.map(async (conv: any) => {
      const otherUser =
        conv.user1_id === user.id ? conv.user2 : conv.user1;

      // Get last message
      const { data: lastMessages } = await supabaseAdmin
        .from("messages")
        .select("content, created_at, sender_id")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastMessage = lastMessages?.[0] || null;

      // Get unread count
      const { count } = await supabaseAdmin
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("read", false)
        .neq("sender_id", user.id);

      return {
        id: conv.id,
        otherUser,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              created_at: lastMessage.created_at,
              isOwn: lastMessage.sender_id === user.id,
            }
          : null,
        unreadCount: count || 0,
        last_message_at: conv.last_message_at,
      };
    })
  );

  return enriched;
}

export async function getOrCreateConversation(otherUserId: string) {
  const user = await getOrCreateUser();
  if (!user) return null;

  if (user.id === otherUserId) return null;

  // Check for existing conversation in both directions
  const { data: existing } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .or(
      `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
    )
    .limit(1)
    .single();

  if (existing) return existing.id as string;

  // Create new conversation (user1 is the smaller UUID to maintain uniqueness)
  const [u1, u2] =
    user.id < otherUserId
      ? [user.id, otherUserId]
      : [otherUserId, user.id];

  const { data: newConv, error } = await supabaseAdmin
    .from("conversations")
    .insert({ user1_id: u1, user2_id: u2 })
    .select("id")
    .single();

  if (error) {
    // Race condition: conversation was created by the other user
    const { data: retry } = await supabaseAdmin
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`
      )
      .limit(1)
      .single();
    return retry?.id as string | null;
  }

  return newConv.id as string;
}

export async function getMessages(conversationId: string) {
  const user = await getOrCreateUser();
  if (!user) return [];

  // Verify user is part of this conversation
  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("user1_id, user2_id")
    .eq("id", conversationId)
    .single();

  if (!conv) return [];
  if (conv.user1_id !== user.id && conv.user2_id !== user.id) return [];

  // Fetch messages
  const { data: messages } = await supabaseAdmin
    .from("messages")
    .select("*, sender:sender_id(id, username, avatar_url)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  // Mark unread messages from the other user as read
  await supabaseAdmin
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .eq("read", false)
    .neq("sender_id", user.id);

  return messages || [];
}

export async function sendMessage(conversationId: string, content: string) {
  const user = await getOrCreateUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = content.trim();
  if (!trimmed) throw new Error("Message cannot be empty");

  // Verify user is part of this conversation
  const { data: conv } = await supabaseAdmin
    .from("conversations")
    .select("user1_id, user2_id")
    .eq("id", conversationId)
    .single();

  if (!conv) throw new Error("Conversation not found");
  if (conv.user1_id !== user.id && conv.user2_id !== user.id) {
    throw new Error("Not authorized");
  }

  // Insert message
  const { data: message, error } = await supabaseAdmin
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmed,
    })
    .select("*, sender:sender_id(id, username, avatar_url)")
    .single();

  if (error) throw new Error("Failed to send message");

  // Update conversation's last_message_at
  await supabaseAdmin
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);

  return message;
}

export async function getUnreadCount() {
  const user = await getOrCreateUser();
  if (!user) return 0;

  // Get all conversation IDs where user is a participant
  const { data: conversations } = await supabaseAdmin
    .from("conversations")
    .select("id")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  if (!conversations || conversations.length === 0) return 0;

  const convIds = conversations.map((c: any) => c.id);

  const { count } = await supabaseAdmin
    .from("messages")
    .select("*", { count: "exact", head: true })
    .in("conversation_id", convIds)
    .eq("read", false)
    .neq("sender_id", user.id);

  return count || 0;
}
