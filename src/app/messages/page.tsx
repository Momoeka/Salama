import { getConversations } from "@/app/actions/messages";
import { getOrCreateUser } from "@/lib/user";
import Link from "next/link";
import { redirect } from "next/navigation";
import MessagesHeader from "@/components/messages-header";

export const dynamic = "force-dynamic";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function MessagesPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/");

  const conversations = await getConversations();

  return (
    <div className="mx-auto max-w-2xl px-2 py-4 sm:px-6 sm:py-8 lg:px-8">
      <MessagesHeader />

      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 text-muted-foreground"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No messages yet
          </h3>
          <p className="text-sm text-muted-foreground">
            When you start a conversation with someone, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {conversations.map((conv: any) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary"
            >
              {/* Avatar */}
              {conv.otherUser?.avatar_url ? (
                <img
                  src={conv.otherUser.avatar_url}
                  alt={conv.otherUser.username}
                  className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-sm font-bold text-white">
                  {conv.otherUser?.username?.[0]?.toUpperCase() || "?"}
                </div>
              )}

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${
                      conv.unreadCount > 0
                        ? "text-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {conv.otherUser?.username || "Unknown"}
                  </span>
                  {conv.lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(conv.lastMessage.created_at)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p
                    className={`truncate text-sm ${
                      conv.unreadCount > 0
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {conv.lastMessage
                      ? `${conv.lastMessage.isOwn ? "You: " : ""}${conv.lastMessage.content}`
                      : "No messages yet"}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-1.5 text-[10px] font-bold text-white">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
