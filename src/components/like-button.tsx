"use client";

import { useState, useTransition } from "react";
import { toggleLike } from "@/app/actions/social";

export function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    // Optimistic update
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    startTransition(async () => {
      try {
        await toggleLike(postId);
      } catch {
        // Revert on error
        setLiked(liked);
        setCount(count);
      }
    });
  }

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`flex items-center gap-1.5 transition-colors ${
        liked
          ? "text-red-500"
          : "text-muted-foreground hover:text-red-500"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
      <span className="text-sm">{count}</span>
    </button>
  );
}
