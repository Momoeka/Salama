"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleFollow } from "@/app/actions/social";

interface SuggestedUser {
  id: string;
  username: string;
  avatar_url: string | null;
  followerCount: number;
}

export function SuggestedUsers({ users }: { users: SuggestedUser[] }) {
  if (users.length === 0) return null;

  return (
    <div className="border-b border-border bg-card px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Suggested for you
        </h3>
        <Link
          href="/explore"
          className="text-xs font-semibold text-primary hover:opacity-70"
        >
          See All
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {users.map((user) => (
          <SuggestedUserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

function SuggestedUserCard({ user }: { user: SuggestedUser }) {
  const [followed, setFollowed] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleFollow() {
    setFollowed(!followed);
    startTransition(async () => {
      try {
        await toggleFollow(user.id);
      } catch {
        setFollowed(followed);
      }
    });
  }

  return (
    <div className="flex min-w-[140px] flex-col items-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-4">
      <Link href={`/profile/${user.id}`}>
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/30"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground ring-2 ring-primary/30">
            {user.username[0]?.toUpperCase()}
          </div>
        )}
      </Link>
      <Link
        href={`/profile/${user.id}`}
        className="max-w-[120px] truncate text-sm font-semibold text-foreground hover:opacity-70"
      >
        {user.username}
      </Link>
      <span className="text-xs text-muted-foreground">
        {user.followerCount} {user.followerCount === 1 ? "follower" : "followers"}
      </span>
      <button
        onClick={handleFollow}
        disabled={isPending}
        className={`w-full rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
          followed
            ? "bg-secondary text-foreground hover:bg-secondary/70"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {followed ? "Following" : "Follow"}
      </button>
    </div>
  );
}
