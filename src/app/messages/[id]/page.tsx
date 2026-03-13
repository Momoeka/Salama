"use client";

import { useEffect, useState, useRef } from "react";
import { useStreamChat } from "@/components/stream-chat-provider";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Channel, MessageResponse } from "stream-chat";

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateSeparator(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString("en-US", { weekday: "long" });
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function shouldShowDateSeparator(current: Date, previous: Date | null): boolean {
  if (!previous) return true;
  return current.toDateString() !== previous.toDateString();
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { client, userId, isReady } = useStreamChat();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize channel
  useEffect(() => {
    if (!client || !userId || !isReady || !id) return;

    let ch: Channel;

    async function initChannel() {
      // Check if id is a channel ID or we need to create from user param
      const searchParams = new URLSearchParams(window.location.search);
      const targetUserId = searchParams.get("user");

      if (id === "NEW" && targetUserId) {
        ch = client!.channel("messaging", {
          members: [userId!, targetUserId],
        });
      } else {
        ch = client!.channel("messaging", id);
      }

      await ch.watch();
      setChannel(ch);
      setMessages(ch.state.messages);

      // Mark as read
      await ch.markRead();

      // Get other user info
      const otherMember = Object.values(ch.state.members).find(
        (m) => m.user_id !== userId
      );
      if (otherMember?.user) {
        setOtherUser(otherMember.user);
      }
    }

    initChannel();

    return () => {
      if (ch) {
        ch.stopWatching().catch(() => {});
      }
    };
  }, [client, userId, isReady, id]);

  // Listen for new messages and typing events
  useEffect(() => {
    if (!channel) return;

    const messageHandler = channel.on("message.new", (event) => {
      setMessages([...channel.state.messages]);
      channel.markRead();
    });

    const typingStartHandler = channel.on("typing.start", (event) => {
      if (event.user?.id !== userId) {
        setTypingUsers((prev) =>
          prev.includes(event.user?.name || "") ? prev : [...prev, event.user?.name || ""]
        );
      }
    });

    const typingStopHandler = channel.on("typing.stop", (event) => {
      if (event.user?.id !== userId) {
        setTypingUsers((prev) => prev.filter((n) => n !== event.user?.name));
      }
    });

    return () => {
      messageHandler.unsubscribe();
      typingStartHandler.unsubscribe();
      typingStopHandler.unsubscribe();
    };
  }, [channel, userId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [channel]);

  async function handleSend() {
    if (!input.trim() || !channel || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);

    try {
      await channel.sendMessage({ text });
    } catch (err) {
      setInput(text);
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !channel) return;

    try {
      const res = await channel.sendImage(file);
      await channel.sendMessage({
        text: "",
        attachments: [
          {
            type: "image",
            image_url: res.file,
            fallback: file.name,
          },
        ],
      });
    } catch (err) {
      console.error("Failed to upload image:", err);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Send typing indicator
    channel?.keystroke();
  }

  if (!isReady || !channel) {
    return (
      <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-0 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
          <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
        </div>
        <div className="flex-1" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-0 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href="/messages"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <Link
          href={`/profile/${otherUser?.id || ""}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          {otherUser?.image ? (
            <img src={otherUser.image} alt={otherUser.name || ""} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-xs font-bold text-white">
              {(otherUser?.name as string)?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <div>
            <span className="text-sm font-semibold text-foreground">
              {(otherUser?.name as string) || "Unknown"}
            </span>
            {otherUser?.online && (
              <p className="text-[10px] text-green-500">Online</p>
            )}
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            {otherUser?.image ? (
              <img src={otherUser.image} alt={otherUser.name || ""} className="mb-4 h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-xl font-bold text-white">
                {(otherUser?.name as string)?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <p className="text-sm font-semibold text-foreground">{otherUser?.name || "Unknown"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start your conversation with {otherUser?.name || "them"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, i) => {
              const isSent = msg.user?.id === userId;
              const msgDate = new Date(msg.created_at);
              const prevDate = i > 0 ? new Date(messages[i - 1].created_at) : null;
              const showDate = shouldShowDateSeparator(msgDate, prevDate);
              const showAvatar =
                !isSent &&
                (i === messages.length - 1 || messages[i + 1]?.user?.id !== msg.user?.id);

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="my-4 flex items-center justify-center">
                      <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-medium text-muted-foreground">
                        {formatDateSeparator(msgDate)}
                      </span>
                    </div>
                  )}
                  <div className={`flex items-end gap-2 ${isSent ? "justify-end" : "justify-start"}`}>
                    {!isSent && (
                      <div className="w-7 flex-shrink-0">
                        {showAvatar &&
                          (otherUser?.image ? (
                            <img src={otherUser.image} alt={otherUser.name || ""} className="h-7 w-7 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                              {(otherUser?.name as string)?.[0]?.toUpperCase() || "?"}
                            </div>
                          ))}
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${isSent ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white" : "bg-secondary text-foreground"}`}>
                      {/* Image attachments */}
                      {msg.attachments?.map((att: any, idx: number) =>
                        att.type === "image" || att.image_url ? (
                          <img
                            key={idx}
                            src={att.image_url || att.thumb_url}
                            alt="shared image"
                            className="mb-1 max-w-full rounded-lg"
                            style={{ maxHeight: "300px" }}
                          />
                        ) : att.og_scrape_url ? (
                          <a
                            key={idx}
                            href={att.og_scrape_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-1 block rounded-lg border border-border/50 bg-background/50 p-2"
                          >
                            {att.title && <p className="text-xs font-semibold">{att.title}</p>}
                            {att.text && <p className="text-[10px] opacity-70 line-clamp-2">{att.text}</p>}
                          </a>
                        ) : null
                      )}
                      {msg.text && (
                        <p className="whitespace-pre-wrap break-words text-sm">{msg.text}</p>
                      )}
                      <p className={`mt-0.5 text-[10px] ${isSent ? "text-white/60" : "text-muted-foreground"}`}>
                        {formatTime(msgDate)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex gap-0.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
            </div>
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:shadow-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
