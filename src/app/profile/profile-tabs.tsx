"use client";

import { useState } from "react";
import Link from "next/link";

interface ProfileTabsProps {
  posts: any[];
  savedPosts?: any[];
  showSaved?: boolean;
}

function PostGrid({ posts }: { posts: any[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No posts here yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
      {posts.map((post: any) => (
        <Link
          key={post.id}
          href={`/post/${post.id}`}
          className="group relative aspect-square overflow-hidden rounded-xl"
        >
          {post.media_type === "video" ? (
            <video
              src={post.image_url}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              muted
              playsInline
            />
          ) : (
            <img
              src={post.image_url}
              alt={post.caption || ""}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
            <p className="p-3 text-sm text-white line-clamp-2">
              {post.caption}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function ProfileTabs({
  posts,
  savedPosts = [],
  showSaved = false,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");

  return (
    <div className="border-t border-border pt-4">
      {/* Tab bar */}
      <div className="mb-6 flex items-center gap-8">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 border-t-2 pb-1 pt-4 text-sm font-semibold transition-colors ${
            activeTab === "posts"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
          Posts
        </button>
        {showSaved && (
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 border-t-2 pb-1 pt-4 text-sm font-semibold transition-colors ${
              activeTab === "saved"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
            Saved
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === "posts" ? (
        <PostGrid posts={posts} />
      ) : (
        <PostGrid posts={savedPosts} />
      )}
    </div>
  );
}
