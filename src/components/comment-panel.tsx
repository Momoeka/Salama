"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from "react";
import { addComment } from "@/app/actions/social";

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

interface CommentPanelProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  initialComments: Comment[];
  commentCount: number;
  post: {
    image_url: string;
    caption: string;
    media_type?: string;
    user: {
      username: string;
      avatar_url: string | null;
    };
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

export function CommentPanel({
  postId,
  isOpen,
  onClose,
  initialComments,
  commentCount: initialCommentCount,
  post,
}: CommentPanelProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [commentText, setCommentText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  // Sync with parent when initialComments change
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    setCommentCount(initialCommentCount);
  }, [initialCommentCount]);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setVisible(true);
      });
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Escape key handler
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Scroll to bottom when new comment added
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;

    const text = commentText.trim();
    setCommentText("");

    // Optimistic comment
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
        await addComment(postId, text);
      } catch {
        // Revert on error
        setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
        setCommentCount((c) => c - 1);
      }
    });
  }

  if (!isOpen) return null;

  const isVideo = post.media_type === "video";

  // Shared comment list content
  const commentList = (
    <>
      {comments.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-3 opacity-40"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-sm">No comments yet</p>
          <p className="text-xs">Be the first to comment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              {comment.user.avatar_url ? (
                <img
                  src={comment.user.avatar_url}
                  alt={comment.user.username}
                  className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {comment.user.username?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {comment.user.username}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="mt-0.5 break-words text-sm text-foreground/90">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>
      )}
    </>
  );

  // Shared comment input
  const commentInput = (
    <form
      onSubmit={handleSubmitComment}
      className="flex items-center gap-2 border-t border-border px-4 py-3"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Add a comment..."
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        className="flex-1 rounded-full bg-muted px-4 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={!commentText.trim() || isPending}
        className="text-sm font-semibold text-primary transition-opacity hover:opacity-70 disabled:opacity-40"
      >
        Post
      </button>
    </form>
  );

  // Shared header
  const header = (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
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
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">
          {post.user.username}
        </p>
        <p className="text-xs text-muted-foreground">
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </p>
      </div>
      <button
        onClick={onClose}
        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Close comments"
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
        >
          <line x1="18" x2="6" y1="6" y2="18" />
          <line x1="6" x2="18" y1="6" y2="18" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* ===== DESKTOP MODAL (sm+): side-by-side image + comments ===== */}
      <div
        className={`relative hidden max-h-[90vh] w-full max-w-4xl mx-4 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-300 sm:flex ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* LEFT: Image / Video */}
        <div className="relative flex w-[55%] items-center justify-center bg-black">
          {isVideo ? (
            <video
              src={post.image_url}
              controls
              className="h-full w-full object-contain"
              style={{ maxHeight: "90vh" }}
            />
          ) : (
            <img
              src={post.image_url}
              alt="Post"
              className="h-full w-full object-contain"
              style={{ maxHeight: "90vh" }}
            />
          )}
        </div>

        {/* RIGHT: Comments panel */}
        <div className="flex w-[45%] flex-col">
          {/* Header */}
          {header}

          {/* Caption */}
          {post.caption && (
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-start gap-3">
                {post.user.avatar_url ? (
                  <img
                    src={post.user.avatar_url}
                    alt={post.user.username}
                    className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {post.user.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-foreground">
                    {post.user.username}
                  </span>
                  <p className="mt-0.5 text-sm text-foreground/90">
                    {post.caption}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable comment list */}
          <div className="flex-1 overflow-y-auto px-4 py-3">{commentList}</div>

          {/* Comment input */}
          {commentInput}
        </div>
      </div>

      {/* ===== MOBILE MODAL (<sm): full-screen stacked ===== */}
      <div
        className={`relative flex h-full w-full flex-col bg-card transition-all duration-300 sm:hidden ${
          visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* Header */}
        {header}

        {/* Post preview thumbnail + caption */}
        <div className="flex items-start gap-3 border-b border-border px-4 py-3">
          {isVideo ? (
            <video
              src={post.image_url}
              className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
              muted
            />
          ) : (
            <img
              src={post.image_url}
              alt="Post"
              className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
            />
          )}
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {post.caption}
          </p>
        </div>

        {/* Scrollable comment list */}
        <div className="flex-1 overflow-y-auto px-4 py-3">{commentList}</div>

        {/* Comment input */}
        {commentInput}
      </div>
    </div>
  );
}
