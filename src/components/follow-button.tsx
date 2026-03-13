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
  const [isPending, startTransition] = useTransition();

  function handleFollow() {
    setFollowing(!following);

    startTransition(async () => {
      try {
        await toggleFollow(targetUserId);
      } catch {
        setFollowing(following);
      }
    });
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={`rounded-xl px-6 py-2 text-sm font-medium transition-colors ${
        following
          ? "border border-border text-foreground hover:border-destructive hover:text-destructive"
          : "bg-primary text-primary-foreground hover:bg-accent"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
