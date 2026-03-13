"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PostFeedItem, type PostFeedItemProps } from "@/app/feed/post-feed-item";
import { SuggestedUsers } from "@/components/suggested-users";

type FeedPost = PostFeedItemProps["post"];

interface SuggestedUser {
  id: string;
  username: string;
  avatar_url: string | null;
  followerCount: number;
}

interface InfiniteFeedProps {
  initialPosts: FeedPost[];
  isLoggedIn: boolean;
  suggestedUsers?: SuggestedUser[];
}

export function InfiniteFeed({ initialPosts, isLoggedIn, suggestedUsers = [] }: InfiniteFeedProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= 10);
  const [cursor, setCursor] = useState<string | null>(
    initialPosts.length > 0
      ? initialPosts[initialPosts.length - 1].created_at
      : null
  );
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Pick a random position (between 2-4) to show suggested users
  const [suggestedPosition] = useState(() =>
    Math.floor(Math.random() * 3) + 2
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !cursor) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/feed?cursor=${encodeURIComponent(cursor)}&limit=10`);
      const data = await res.json();

      if (data.posts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
        setCursor(data.nextCursor);
        if (!data.nextCursor) setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, cursor]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="flex flex-col">
        {posts.map((post, index) => (
          <div key={post.id}>
            {/* Insert suggested users at the random position */}
            {index === suggestedPosition && suggestedUsers.length > 0 && (
              <SuggestedUsers users={suggestedUsers} />
            )}
            <PostFeedItem
              post={post}
              poll={post.poll}
              isLoggedIn={isLoggedIn}
            />
          </div>
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-1" />

      {loading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-primary" />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">You're all caught up!</p>
        </div>
      )}
    </>
  );
}
