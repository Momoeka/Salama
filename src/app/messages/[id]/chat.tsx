"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { sendMessage } from "@/app/actions/messages";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface OtherUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function shouldShowDateSeparator(
  current: string,
  previous: string | null
): boolean {
  if (!previous) return true;
  const currentDate = new Date(current).toDateString();
  const previousDate = new Date(previous).toDateString();
  return currentDate !== previousDate;
}

export default function Chat({
  conversationId,
  currentUserId,
  initialMessages,
  otherUser,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
  otherUser: OtherUser;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll to bottom on initial load (instant)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  // Subscribe to realtime messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Don't add if we already have this message (optimistic update)
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // Attach sender info
            if (newMsg.sender_id === currentUserId) {
              return prev; // Already added optimistically
            }
            return [
              ...prev,
              {
                ...newMsg,
                sender: {
                  id: otherUser.id,
                  username: otherUser.username,
                  avatar_url: otherUser.avatar_url,
                },
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, otherUser]);

  function handleSend() {
    const content = input.trim();
    if (!content || isPending) return;

    setInput("");

    // Optimistic update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
      read: false,
      created_at: new Date().toISOString(),
      sender: {
        id: currentUserId,
        username: "You",
        avatar_url: null,
      },
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    startTransition(async () => {
      try {
        const realMsg = await sendMessage(conversationId, content);
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? realMsg : m))
        );
      } catch {
        // Remove optimistic message on error
        setMessages((prev) =>
          prev.filter((m) => m.id !== optimisticMsg.id)
        );
        setInput(content);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            {otherUser.avatar_url ? (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.username}
                className="mb-4 h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-xl font-bold text-white">
                {otherUser.username[0]?.toUpperCase()}
              </div>
            )}
            <p className="text-sm font-semibold text-foreground">
              {otherUser.username}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start your conversation with {otherUser.username}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, i) => {
              const isSent = msg.sender_id === currentUserId;
              const previousMsg = i > 0 ? messages[i - 1] : null;
              const showDate = shouldShowDateSeparator(
                msg.created_at,
                previousMsg?.created_at || null
              );
              // Group consecutive messages from the same sender
              const showAvatar =
                !isSent &&
                (i === messages.length - 1 ||
                  messages[i + 1]?.sender_id !== msg.sender_id);

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="my-4 flex items-center justify-center">
                      <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-medium text-muted-foreground">
                        {formatDateSeparator(msg.created_at)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex items-end gap-2 ${
                      isSent ? "justify-end" : "justify-start"
                    }`}
                  >
                    {/* Other user avatar spacer/avatar */}
                    {!isSent && (
                      <div className="w-7 flex-shrink-0">
                        {showAvatar &&
                          (otherUser.avatar_url ? (
                            <img
                              src={otherUser.avatar_url}
                              alt={otherUser.username}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-foreground">
                              {otherUser.username[0]?.toUpperCase()}
                            </div>
                          ))}
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                        isSent
                          ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">
                        {msg.content}
                      </p>
                      <p
                        className={`mt-0.5 text-[10px] ${
                          isSent
                            ? "text-white/60"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-end gap-2">
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
            disabled={!input.trim() || isPending}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:shadow-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
