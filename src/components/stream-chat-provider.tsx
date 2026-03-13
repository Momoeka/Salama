"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useAuth } from "@clerk/nextjs";
import { StreamChat, Channel as StreamChannel } from "stream-chat";

interface StreamChatContextType {
  client: StreamChat | null;
  userId: string | null;
  isReady: boolean;
  error: string | null;
  retry: () => void;
}

const StreamChatContext = createContext<StreamChatContextType>({
  client: null,
  userId: null,
  isReady: false,
  error: null,
  retry: () => {},
});

export function useStreamChat() {
  return useContext(StreamChatContext);
}

export function StreamChatProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Don't init Stream Chat if not signed in or auth not loaded yet
    if (!isLoaded || !isSignedIn) return;

    let didCancel = false;
    let chatClient: StreamChat | null = null;

    async function init() {
      try {
        setError(null);
        const res = await fetch("/api/stream-token");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Stream token failed (${res.status})`);
        }

        const { token, userId: uid, username, avatarUrl } = await res.json();

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
        if (!apiKey) throw new Error("Stream API key not configured");

        chatClient = StreamChat.getInstance(apiKey);

        await chatClient.connectUser(
          {
            id: uid,
            name: username,
            image: avatarUrl || undefined,
          },
          token
        );

        if (!didCancel) {
          setClient(chatClient);
          setUserId(uid);
          setIsReady(true);
        }
      } catch (err: any) {
        console.error("Stream Chat init error:", err);
        if (!didCancel) {
          setError(err.message || "Failed to connect to chat");
        }
      }
    }

    init();

    return () => {
      didCancel = true;
      if (chatClient) {
        chatClient.disconnectUser().catch(() => {});
      }
    };
  }, [isLoaded, isSignedIn, retryCount]);

  function retry() {
    setRetryCount((c) => c + 1);
  }

  return (
    <StreamChatContext.Provider value={{ client, userId, isReady, error, retry }}>
      {children}
    </StreamChatContext.Provider>
  );
}

// Helper to create/get a DM channel between two users
export async function getOrCreateDMChannel(
  client: StreamChat,
  currentUserId: string,
  otherUserId: string
) {
  const channel = client.channel("messaging", {
    members: [currentUserId, otherUserId],
  });
  await channel.watch();
  return channel;
}
