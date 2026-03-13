"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { toggleLike, addComment } from "@/app/actions/social";
import { ShareDialog } from "@/components/share-dialog";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface PostFeedItemProps {
  post: {
    id: string;
    image_url: string;
    caption: string;
    media_type?: string;
    created_at: string;
    user: {
      id: string;
      username: string;
      avatar_url: string | null;
      clerk_id: string;
    };
    likeCount: number;
    commentCount: number;
    hasLiked: boolean;
    recentComments: Comment[];
  };
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString();
}

export function PostFeedItem({ post }: PostFeedItemProps) {
  const [liked, setLiked] = useState(post.hasLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [comments, setComments] = useState<Comment[]>(post.recentComments);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [isPending, startTransition] = useTransition();
  const commentInputRef = useRef<HTMLInputElement>(null);
  const isVideo = post.media_type === "video";

  function handleLike() {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    if (!wasLiked) {
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 600);
    }
    startTransition(async () => {
      try {
        await toggleLike(post.id);
      } catch {
        // Revert on error
        setLiked(wasLiked);
        setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
      }
    });
  }

  function handleCommentClick() {
    setShowCommentInput(true);
    setTimeout(() => commentInputRef.current?.focus(), 50);
  }

  function handleReport() {
    alert("Report submitted. We will review this post.");
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;

    const text = commentText.trim();
    setCommentText("");

    // Optimistic: add a temporary comment
    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      content: text,
      created_at: new Date().toISOString(),
      user: { id: "me", username: "You", avatar_url: null },
    };
    setComments((prev) => [...prev, tempComment]);
    setCommentCount((c) => c + 1);

    startTransition(async () => {
      try {
        await addComment(post.id, text);
      } catch {
        // Revert on error
        setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
        setCommentCount((c) => c - 1);
      }
    });
  }

  function handleDoubleClickLike() {
    if (!liked) {
      handleLike();
    } else {
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 600);
    }
  }

  return (
    <article className="border-b border-border bg-card">
      {/* Header: avatar + username */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={`/profile/${post.user.id}`} className="flex-shrink-0">
          {post.user.avatar_url ? (
            <img
              src={post.user.avatar_url}
              alt={post.user.username}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-2 ring-border">
              {post.user.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </Link>
        <Link
          href={`/profile/${post.user.id}`}
          className="text-sm font-semibold text-foreground hover:opacity-70 transition-opacity"
        >
          {post.user.username}
        </Link>
        <span className="ml-auto text-xs text-muted-foreground">
          {timeAgo(post.created_at)}
        </span>
      </div>

      {/* Media */}
      <div
        className="relative w-full cursor-pointer select-none"
        onDoubleClick={handleDoubleClickLike}
      >
        {isVideo ? (
          <video
            src={post.image_url}
            className="w-full object-cover"
            style={{ maxHeight: "600px" }}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={post.image_url}
            alt={post.caption}
            className="w-full object-cover"
            style={{ maxHeight: "600px" }}
            loading="lazy"
          />
        )}

        {/* Double-tap heart animation */}
        {likeAnimating && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="white"
              stroke="none"
              className="animate-ping-once drop-shadow-lg"
              style={{
                animation: "heartBurst 0.6s ease-out forwards",
              }}
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex items-center px-4 pt-3 pb-1">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={handleLike}
            className="group transition-transform active:scale-90"
            aria-label={liked ? "Unlike" : "Like"}
          >
            {liked ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="#ef4444"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:scale-110"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground transition-all group-hover:scale-110 group-hover:text-red-400"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            )}
          </button>

          {/* Comment */}
          <button
            onClick={handleCommentClick}
            className="group transition-transform active:scale-90"
            aria-label="Comment"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground transition-all group-hover:scale-110 group-hover:text-primary"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* DM */}
          <Link
            href={`/messages/NEW?user=${post.user.id}`}
            className="group transition-transform active:scale-90"
            aria-label="Message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground transition-all group-hover:scale-110 group-hover:text-primary"
            >
              <line x1="22" x2="11" y1="2" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </Link>

          {/* Share */}
          <button
            onClick={() => setShareOpen(true)}
            className="group transition-transform active:scale-90"
            aria-label="Share"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground transition-all group-hover:scale-110 group-hover:text-primary"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" x2="12" y1="2" y2="15" />
            </svg>
          </button>
        </div>

        {/* Report - far right */}
        <button
          onClick={handleReport}
          className="ml-auto group transition-transform active:scale-90"
          aria-label="Report"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground transition-all group-hover:scale-110 group-hover:text-orange-400"
          >
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" x2="4" y1="22" y2="15" />
          </svg>
        </button>
      </div>

      {/* Like count */}
      <div className="px-4 pt-1 pb-1">
        <p className="text-sm font-semibold text-foreground">
          {likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"}
        </p>
      </div>

      {/* Caption */}
      <div className="px-4 pb-1">
        <p className="text-sm text-foreground">
          <Link
            href={`/profile/${post.user.id}`}
            className="mr-1.5 font-semibold hover:opacity-70 transition-opacity"
          >
            {post.user.username}
          </Link>
          <span className="text-muted-foreground">{post.caption}</span>
        </p>
      </div>

      {/* View all comments */}
      {commentCount > comments.length && !showAllComments && (
        <button
          onClick={() => setShowAllComments(true)}
          className="px-4 pb-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View all {commentCount} comments
        </button>
      )}

      {/* Comments */}
      {comments.length > 0 && (
        <div className="px-4 pb-1 space-y-1">
          {(showAllComments ? comments : comments.slice(0, 3)).map(
            (comment) => (
              <p key={comment.id} className="text-sm text-foreground">
                <span className="mr-1.5 font-semibold">
                  {comment.user.username}
                </span>
                <span className="text-muted-foreground">{comment.content}</span>
              </p>
            )
          )}
        </div>
      )}

      {/* Timestamp */}
      <div className="px-4 pb-3 pt-1">
        <time className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {timeAgo(post.created_at)}
        </time>
      </div>

      {/* Comment input */}
      {showCommentInput && (
        <form
          onSubmit={handleSubmitComment}
          className="flex items-center gap-2 border-t border-border px-4 py-3"
        >
          <input
            ref={commentInputRef}
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isPending}
            className="text-sm font-semibold text-primary transition-opacity disabled:opacity-40 hover:opacity-70"
          >
            Post
          </button>
        </form>
      )}

      {/* Share Dialog */}
      <ShareDialog
        postId={post.id}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      {/* Inline keyframe for heart animation */}
      <style jsx global>{`
        @keyframes heartBurst {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </article>
  );
}
