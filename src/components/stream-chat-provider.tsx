"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { StreamChat, Channel as StreamChannel } from "stream-chat";

interface StreamChatContextType {
  client: StreamChat | null;
  userId: string | null;
  isReady: boolean;
}

const StreamChatContext = createContext<StreamChatContextType>({
  client: null,
  userId: null,
  isReady: false,
});

export function useStreamChat() {
  return useContext(StreamChatContext);
}

export function StreamChatProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let didCancel = false;
    let chatClient: StreamChat | null = null;

    async function init() {
      try {
        const res = await fetch("/api/stream-token");
        if (!res.ok) return;

        const { token, userId: uid, username, avatarUrl } = await res.json();

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
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
      } catch (err) {
        console.error("Stream Chat init error:", err);
      }
    }

    init();

    return () => {
      didCancel = true;
      if (chatClient) {
        chatClient.disconnectUser().catch(() => {});
      }
    };
  }, []);

  return (
    <StreamChatContext.Provider value={{ client, userId, isReady }}>
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
