import { getMessages, getOrCreateConversation } from "@/app/actions/messages";
import { getOrCreateUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Chat from "./chat";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ user?: string }>;
}) {
  const { id } = await params;
  const { user: targetUserId } = await searchParams;

  const currentUser = await getOrCreateUser();
  if (!currentUser) redirect("/");

  let conversationId = id;

  // Handle "NEW" conversation creation
  if (id === "NEW" && targetUserId) {
    const newConvId = await getOrCreateConversation(targetUserId);
    if (!newConvId) redirect("/messages");
    redirect(`/messages/${newConvId}`);
  }

  // Get conversation details
  const { data: conversation } = await supabaseAdmin
    .from("conversations")
    .select(
      "*, user1:user1_id(id, username, avatar_url), user2:user2_id(id, username, avatar_url)"
    )
    .eq("id", conversationId)
    .single();

  if (!conversation) notFound();

  // Verify current user is a participant
  if (
    conversation.user1_id !== currentUser.id &&
    conversation.user2_id !== currentUser.id
  ) {
    notFound();
  }

  const otherUser: any =
    conversation.user1_id === currentUser.id
      ? conversation.user2
      : conversation.user1;

  const messages = await getMessages(conversationId);

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-0 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href="/messages"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <Link
          href={`/profile/${otherUser?.id}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          {otherUser?.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.username}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-xs font-bold text-white">
              {otherUser?.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <span className="text-sm font-semibold text-foreground">
            {otherUser?.username || "Unknown"}
          </span>
        </Link>
      </div>

      {/* Chat */}
      <Chat
        conversationId={conversationId}
        currentUserId={currentUser.id}
        initialMessages={messages}
        otherUser={otherUser}
      />
    </div>
  );
}
