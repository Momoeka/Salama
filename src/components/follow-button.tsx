"use client";

import { useState, useTransition } from "react";
import { toggleFollow } from "@/app/actions/social";

export function FollowButton({
  targetUserId,
  initialFollowing,
}: {
  targetUserId: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [hovered, setHovered] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleFollow() {
    const prev = following;
    setFollowing(!prev);

    startTransition(async () => {
      try {
        await toggleFollow(targetUserId);
      } catch {
        setFollowing(prev);
      }
    });
  }

  const showUnfollow = following && hovered;

  return (
    <button
      onClick={handleFollow}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={isPending}
      className={`rounded-xl px-6 py-2 text-sm font-medium transition-all ${
        following
          ? showUnfollow
            ? "border border-red-500/50 text-red-500 bg-red-500/10"
            : "border border-border text-foreground"
          : "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30"
      } ${isPending ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {isPending
        ? "..."
        : following
          ? showUnfollow
            ? "Unfollow"
            : "Following"
          : "Follow"}
    </button>
  );
}
