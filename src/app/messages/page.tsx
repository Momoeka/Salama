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
  const { client, userId, isReady, error, retry } = useStreamChat();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [groupSearch, setGroupSearch] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState<any[]>([]);

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

  async function startConversation(otherUser: any) {
    if (!client || !userId) return;
    try {
      // Ensure the other user exists in Stream before creating channel
      await fetch("/api/stream-upsert-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: otherUser.id,
          name: otherUser.username,
          image: otherUser.avatar_url || undefined,
        }),
      });

      const channel = client.channel("messaging", {
        members: [userId, otherUser.id],
      });
      await channel.watch();
      window.location.href = `/messages/${channel.id}`;
    } catch (err) {
      console.error("Failed to create channel:", err);
    }
  }

  async function handleGroupSearch(query: string) {
    setGroupSearch(query);
    if (!query.trim()) { setGroupSearchResults([]); return; }
    try {
      const res = await fetch(`/api/search-users?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setGroupSearchResults((data.users || []).filter(
          (u: any) => !groupMembers.some((m) => m.id === u.id)
        ));
      }
    } catch { setGroupSearchResults([]); }
  }

  async function createGroup() {
    if (!client || !userId || !groupName.trim() || groupMembers.length < 1) return;
    try {
      // Upsert all members in Stream
      await Promise.all(
        groupMembers.map((m) =>
          fetch("/api/stream-upsert-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: m.id, name: m.username, image: m.avatar_url }),
          })
        )
      );
      const memberIds = [userId, ...groupMembers.map((m: any) => m.id)];
      const channel = client.channel("messaging", `group-${Date.now()}`, {
        name: groupName.trim(),
        members: memberIds,
      } as any);
      await channel.watch();
      window.location.href = `/messages/${channel.id}`;
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-2 py-4 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-sm font-medium text-red-400 mb-2">Failed to connect to chat</p>
          <p className="text-xs text-muted-foreground mb-4">{error}</p>
          <button
            onClick={retry}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
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
        <div className="flex gap-2">
          <button
            onClick={() => { setShowGroupCreate(!showGroupCreate); setShowSearch(false); }}
            className="rounded-xl border border-violet-600 px-4 py-2 text-sm font-medium text-violet-400 transition-all hover:bg-violet-600/10"
          >
            + Group
          </button>
          <button
            onClick={() => { setShowSearch(!showSearch); setShowGroupCreate(false); }}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg hover:opacity-90"
          >
            + New Chat
          </button>
        </div>
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
                  onClick={() => startConversation(user)}
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

      {/* Group creation */}
      {showGroupCreate && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <input
            type="text"
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mb-3 w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            autoFocus
          />
          {groupMembers.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {groupMembers.map((m: any) => (
                <span key={m.id} className="flex items-center gap-1 rounded-full bg-violet-600/20 px-3 py-1 text-xs font-medium text-violet-400">
                  {m.username}
                  <button onClick={() => setGroupMembers((prev) => prev.filter((p) => p.id !== m.id))} className="ml-1 hover:text-white">&times;</button>
                </span>
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="Search members to add..."
            value={groupSearch}
            onChange={(e) => handleGroupSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          {groupSearchResults.length > 0 && (
            <div className="mt-2 space-y-1">
              {groupSearchResults.map((user: any) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setGroupMembers((prev) => [...prev, user]);
                    setGroupSearch("");
                    setGroupSearchResults([]);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-xs font-bold text-white">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-foreground">{user.username}</span>
                </button>
              ))}
            </div>
          )}
          <button
            onClick={createGroup}
            disabled={!groupName.trim() || groupMembers.length < 1}
            className="mt-3 w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            Create Group ({groupMembers.length + 1} members)
          </button>
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
            const isGroup = otherMembers.length > 1 || (channel.data as any)?.name;
            const channelName = isGroup
              ? ((channel.data as any)?.name as string) || otherMembers.map((m) => m.user?.name).join(", ")
              : (otherMembers[0]?.user?.name as string) || "Unknown";
            const otherUser = otherMembers[0]?.user;
            const lastMessage = channel.state.messages[channel.state.messages.length - 1];
            const unreadCount = channel.countUnread();

            return (
              <Link
                key={channel.id}
                href={`/messages/${channel.id}`}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary"
              >
                {isGroup ? (
                  <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center">
                    {otherMembers.slice(0, 2).map((m, i) => (
                      <div key={m.user_id} className={`absolute ${i === 0 ? "left-0 top-0" : "bottom-0 right-0"} h-8 w-8`}>
                        {m.user?.image ? (
                          <img src={m.user.image as string} alt="" className="h-8 w-8 rounded-full border-2 border-background object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-violet-600 to-purple-600 text-[10px] font-bold text-white">
                            {(m.user?.name as string)?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : otherUser?.image ? (
                  <img src={otherUser.image as string} alt={otherUser.name || ""} className="h-12 w-12 flex-shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-sm font-bold text-white">
                    {(otherUser?.name as string)?.[0]?.toUpperCase() || "?"}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {channelName}
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
                        ? `${lastMessage.user?.id === userId ? "You: " : isGroup ? `${lastMessage.user?.name}: ` : ""}${lastMessage.text || (lastMessage.attachments?.length ? "Sent an attachment" : "No messages yet")}`
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
