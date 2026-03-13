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
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
        following
          ? showUnfollow
            ? "border border-destructive/40 text-destructive"
            : "border border-border text-foreground hover:bg-secondary"
          : "bg-primary text-primary-foreground hover:opacity-90"
      } ${isPending ? "opacity-50 pointer-events-none" : ""}`}
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
