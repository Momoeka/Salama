"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { toggleLike, addComment } from "@/app/actions/social";
import { toggleSavePost } from "@/app/actions/saved";
import { ShareDialog } from "@/components/share-dialog";
import { ReportModal } from "@/components/report-modal";
import { CommentPanel } from "@/components/comment-panel";
import { AuthRequiredModal } from "@/components/auth-required-modal";
import { VerifiedBadge } from "@/components/verified-badge";
import { PollCard } from "@/components/poll-card";
import type { PollData } from "@/app/actions/polls";

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
    location?: string;
    created_at: string;
    user: {
      id: string;
      username: string;
      avatar_url: string | null;
      clerk_id: string;
      verified?: boolean;
    };
    likeCount: number;
    commentCount: number;
    hasLiked: boolean;
    hasSaved: boolean;
    recentComments: Comment[];
    poll?: PollData;
  };
  poll?: PollData;
  isLoggedIn?: boolean;
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

export function PostFeedItem({ post, poll, isLoggedIn = true }: PostFeedItemProps) {
  const [liked, setLiked] = useState(post.hasLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [comments, setComments] = useState<Comment[]>(post.recentComments);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [commentPanelOpen, setCommentPanelOpen] = useState(false);
  const [saved, setSaved] = useState(post.hasSaved);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState("continue");
  const [showInlineComments, setShowInlineComments] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [inlineCommentText, setInlineCommentText] = useState("");
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const isVideo = post.media_type === "video";

  function requireAuth(action: string, callback: () => void) {
    if (!isLoggedIn) {
      setAuthAction(action);
      setAuthModalOpen(true);
      return;
    }
    callback();
  }

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
    // On mobile (<640px) show inline comments; on desktop open the modal
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setShowInlineComments(true);
    } else {
      setCommentPanelOpen(true);
    }
  }

  function handleInlineCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inlineCommentText.trim()) return;

    const text = inlineCommentText.trim();
    setInlineCommentText("");

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
        setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
        setCommentCount((c) => c - 1);
      }
    });
  }

  function handleReport() {
    setReportOpen(true);
  }

  function handleSave() {
    const wasSaved = saved;
    setSaved(!wasSaved);
    startTransition(async () => {
      try {
        await toggleSavePost(post.id);
      } catch {
        setSaved(wasSaved);
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
        <div className="flex flex-col">
          <Link
            href={`/profile/${post.user.id}`}
            className="flex items-center gap-1 text-sm font-semibold text-foreground hover:opacity-70 transition-opacity"
          >
            {post.user.username}
            {post.user.verified && <VerifiedBadge size="xs" />}
          </Link>
          {post.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {post.location}
            </span>
          )}
        </div>
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
      <div className="flex items-center px-2 pt-3 pb-1 sm:px-4">
        <div className="flex items-center gap-0 sm:gap-2">
          {/* Like */}
          <button
            onClick={() => requireAuth("like this post", handleLike)}
            className="group flex min-h-[44px] min-w-[44px] items-center justify-center transition-transform active:scale-90"
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
            onClick={() => requireAuth("comment", handleCommentClick)}
            className="group flex min-h-[44px] min-w-[44px] items-center justify-center transition-transform active:scale-90"
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
            className="group flex min-h-[44px] min-w-[44px] items-center justify-center transition-transform active:scale-90"
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
            className="group flex min-h-[44px] min-w-[44px] items-center justify-center transition-transform active:scale-90"
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

        {/* Right side: Bookmark + More menu */}
        <div className="ml-auto flex items-center gap-0 sm:gap-3">
          {/* Bookmark / Save */}
          <button
            onClick={() => requireAuth("save posts", handleSave)}
            className="group flex min-h-[44px] min-w-[44px] items-center justify-center transition-transform active:scale-90"
            aria-label={saved ? "Unsave" : "Save"}
          >
            {saved ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground transition-transform group-hover:scale-110"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
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
                className="text-foreground transition-all group-hover:scale-110 group-hover:text-primary"
              >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            )}
          </button>

          {/* More (...) menu */}
          <div className="relative">
            <button
              onClick={() => setMoreMenuOpen((v) => !v)}
              className="group flex min-h-[44px] min-w-[44px] items-center justify-center transition-transform active:scale-90"
              aria-label="More options"
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
                className="text-muted-foreground transition-all group-hover:scale-110 group-hover:text-foreground"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
            {moreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMoreMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-50 w-44 rounded-xl border border-border bg-card py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setReportOpen(true);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-secondary transition-colors"
                  >
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
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" x2="4" y1="22" y2="15" />
                    </svg>
                    Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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

      {/* Poll */}
      {(poll || post.poll) && (
        <PollCard poll={(poll || post.poll)!} isLoggedIn={isLoggedIn} />
      )}

      {/* View all comments */}
      {commentCount > comments.length && (
        <button
          onClick={() => requireAuth("view comments", handleCommentClick)}
          className="px-4 pb-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View all {commentCount} comments
        </button>
      )}

      {/* Comments */}
      {comments.length > 0 && (
        <div className="px-4 pb-1 space-y-1">
          {comments.slice(0, 3).map(
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

      {/* Mobile inline comments (sm:hidden) */}
      {showInlineComments && (
        <div className="border-t border-border bg-secondary/30 sm:hidden">
          {/* Collapse button */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <p className="text-xs font-medium text-muted-foreground">
              {commentCount} {commentCount === 1 ? "comment" : "comments"}
            </p>
            <button
              onClick={() => setShowInlineComments(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Hide
            </button>
          </div>

          {/* Comment list */}
          {comments.length === 0 ? (
            <div className="px-4 pb-3 text-center">
              <p className="text-sm text-muted-foreground">No comments yet</p>
              <p className="text-xs text-muted-foreground">Be the first to comment</p>
            </div>
          ) : (
            <div className="space-y-3 px-4 pb-2">
              {comments.slice(0, visibleCount).map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  {comment.user.avatar_url ? (
                    <img
                      src={comment.user.avatar_url}
                      alt={comment.user.username}
                      className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                      {comment.user.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-semibold text-foreground">
                        {comment.user.username}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="break-words text-sm text-foreground/90">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show more button */}
          {comments.length > visibleCount && (
            <button
              onClick={() => setVisibleCount((c) => c + 5)}
              className="w-full px-4 pb-2 text-left text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Show more comments
            </button>
          )}

          {/* Comment input area */}
          <div className="px-4 pb-3 pt-1">
            {!showCommentInput ? (
              <button
                onClick={() => {
                  setShowCommentInput(true);
                  setTimeout(() => inlineInputRef.current?.focus(), 50);
                }}
                className="w-full rounded-full bg-muted px-4 py-2 text-left text-sm text-muted-foreground"
              >
                Add a comment...
              </button>
            ) : (
              <form onSubmit={handleInlineCommentSubmit} className="flex items-center gap-2">
                <input
                  ref={inlineInputRef}
                  type="text"
                  placeholder="Add a comment..."
                  value={inlineCommentText}
                  onChange={(e) => setInlineCommentText(e.target.value)}
                  className="flex-1 rounded-full bg-muted px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!inlineCommentText.trim() || isPending}
                  className="text-sm font-semibold text-primary transition-opacity hover:opacity-70 disabled:opacity-40"
                >
                  Post
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Comment Panel (opens on desktop only via handleCommentClick logic) */}
      <CommentPanel
        postId={post.id}
        isOpen={commentPanelOpen}
        onClose={() => setCommentPanelOpen(false)}
        initialComments={comments}
        commentCount={commentCount}
        post={{
          image_url: post.image_url,
          caption: post.caption,
          media_type: post.media_type,
          user: {
            username: post.user.username,
            avatar_url: post.user.avatar_url,
          },
        }}
      />

      {/* Share Dialog */}
      <ShareDialog
        postId={post.id}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="post"
        targetId={post.id}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        action={authAction}
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
