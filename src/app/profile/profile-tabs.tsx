"use client";

import { useState } from "react";
import Link from "next/link";

interface ProfileTabsProps {
  posts: any[];
  savedPosts?: any[];
  scheduledPosts?: any[];
  draftPosts?: any[];
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

function ScheduledPostGrid({ posts }: { posts: any[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No scheduled posts.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
      {posts.map((post: any) => (
        <div
          key={post.id}
          className="group relative aspect-square overflow-hidden rounded-xl"
        >
          {post.media_type === "video" ? (
            <video
              src={post.image_url}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
          ) : (
            <img
              src={post.image_url}
              alt={post.caption || ""}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          )}
          {/* Scheduled time badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/70 to-transparent p-3">
            <span className="rounded-lg bg-primary/90 px-2.5 py-1 text-xs font-medium text-primary-foreground">
              {new Date(post.scheduled_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}{" "}
              {new Date(post.scheduled_at).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <p className="mt-1.5 text-xs text-white/80 line-clamp-1">
              {post.caption}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DraftPostGrid({ posts }: { posts: any[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">No drafts yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
      {posts.map((post: any) => (
        <div
          key={post.id}
          className="group relative aspect-square overflow-hidden rounded-xl"
        >
          {post.media_type === "video" ? (
            <video
              src={post.image_url}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
          ) : (
            <img
              src={post.image_url}
              alt={post.caption || ""}
              className="h-full w-full object-cover opacity-75"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/70 to-transparent p-3">
            <span className="rounded-lg border border-border bg-secondary/90 px-2.5 py-1 text-xs font-medium text-foreground">
              Draft
            </span>
            <p className="mt-1.5 text-xs text-white/80 line-clamp-1">
              {post.caption}
            </p>
            <Link
              href={`/upload?draft=${post.id}`}
              className="mt-2 rounded-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-accent"
            >
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

type TabKey = "posts" | "saved" | "scheduled" | "drafts";

export function ProfileTabs({
  posts,
  savedPosts = [],
  scheduledPosts = [],
  draftPosts = [],
  showSaved = false,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("posts");

  const tabButtonClass = (tab: TabKey) =>
    `flex items-center gap-2 border-t-2 pb-1 pt-4 text-sm font-semibold transition-colors ${
      activeTab === tab
        ? "border-foreground text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="border-t border-border pt-4">
      {/* Tab bar */}
      <div className="mb-6 flex items-center gap-8 overflow-x-auto">
        <button onClick={() => setActiveTab("posts")} className={tabButtonClass("posts")}>
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
          <button onClick={() => setActiveTab("saved")} className={tabButtonClass("saved")}>
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
        <button onClick={() => setActiveTab("scheduled")} className={tabButtonClass("scheduled")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Scheduled
          {scheduledPosts.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
              {scheduledPosts.length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab("drafts")} className={tabButtonClass("drafts")}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
          Drafts
          {draftPosts.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
              {draftPosts.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "posts" && <PostGrid posts={posts} />}
      {activeTab === "saved" && <PostGrid posts={savedPosts} />}
      {activeTab === "scheduled" && <ScheduledPostGrid posts={scheduledPosts} />}
      {activeTab === "drafts" && <DraftPostGrid posts={draftPosts} />}
    </div>
  );
}
