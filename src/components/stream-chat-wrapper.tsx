"use client";

import dynamic from "next/dynamic";

const StreamChatProvider = dynamic(
  () => import("@/components/stream-chat-provider").then((m) => m.StreamChatProvider),
  { ssr: false }
);

export function StreamChatWrapper({ children }: { children: React.ReactNode }) {
  return <StreamChatProvider>{children}</StreamChatProvider>;
}
