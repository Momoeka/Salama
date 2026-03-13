"use client";

import { useEffect, useState } from "react";
import { useStreamChat } from "@/components/stream-chat-provider";
import Link from "next/link";
import type { Channel } from "stream-chat";

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

export default function MessagesPage() {
  const { client, userId, isReady } = useStreamChat();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (!client || !userId || !isReady) return;

    async function loadChannels() {
      try {
        const filter = { type: "messaging", members: { $in: [userId!] } };
        const sort = [{ last_message_at: -1 as const }];
        const chs = await client!.queryChannels(filter, sort, {
          watch: true,
          state: true,
          limit: 30,
        });
        setChannels(chs);
      } catch (err) {
        console.error("Failed to load channels:", err);
      } finally {
        setLoading(false);
      }
    }

    loadChannels();

    // Listen for new messages to update channel list
    const handler = client.on((event) => {
      if (event.type === "message.new" || event.type === "notification.message_new") {
        loadChannels();
      }
    });

    return () => handler.unsubscribe();
  }, [client, userId, isReady]);

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (!query.trim() || !client) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/search-users?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      }
    } catch {
      setSearchResults([]);
    }
  }

  async function startConversation(otherUserId: string) {
    if (!client || !userId) return;
    try {
      const channel = client.channel("messaging", {
        members: [userId, otherUserId],
      });
      await channel.watch();
      window.location.href = `/messages/${channel.id}`;
    } catch (err) {
      console.error("Failed to create channel:", err);
    }
  }

  if (!isReady) {
    return (
      <div className="mx-auto max-w-2xl px-2 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3">
              <div className="h-12 w-12 animate-pulse rounded-full bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                <div className="h-3 w-48 animate-pulse rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-2 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:opacity-90"
        >
          + New Chat
        </button>
      </div>

      {/* Search for new conversation */}
      {showSearch && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            autoFocus
          />
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-1">
              {searchResults.map((user: any) => (
                <button
                  key={user.id}
                  onClick={() => startConversation(user.id)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-xs font-bold text-white">
                      {user.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">{user.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3">
              <div className="h-12 w-12 animate-pulse rounded-full bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                <div className="h-3 w-48 animate-pulse rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      ) : channels.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 className="mb-2 text-lg font-semibold text-foreground">No messages yet</h3>
          <p className="text-sm text-muted-foreground">
            Start a conversation with someone using the + New Chat button.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {channels.map((channel) => {
            const otherMembers = Object.values(channel.state.members).filter(
              (m) => m.user_id !== userId
            );
            const otherUser = otherMembers[0]?.user;
            const lastMessage = channel.state.messages[channel.state.messages.length - 1];
            const unreadCount = channel.countUnread();

            return (
              <Link
                key={channel.id}
                href={`/messages/${channel.id}`}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary"
              >
                {otherUser?.image ? (
                  <img src={otherUser.image as string} alt={otherUser.name || ""} className="h-12 w-12 flex-shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-sm font-bold text-white">
                    {(otherUser?.name as string)?.[0]?.toUpperCase() || "?"}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {(otherUser?.name as string) || "Unknown"}
                    </span>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(lastMessage.created_at?.toISOString() || new Date().toISOString())}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`truncate text-sm ${unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {lastMessage
                        ? `${lastMessage.user?.id === userId ? "You: " : ""}${lastMessage.text || (lastMessage.attachments?.length ? "Sent an attachment" : "No messages yet")}`
                        : "No messages yet"}
                    </p>
                    {unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-1.5 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
