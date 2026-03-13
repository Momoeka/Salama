"use client";

import { useState, useTransition } from "react";
import { addComment } from "@/app/actions/social";

export function CommentForm({ postId }: { postId: string }) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      try {
        await addComment(postId, content);
        setContent("");
      } catch (err) {
        console.error("Failed to add comment:", err);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "..." : "Post"}
      </button>
    </form>
  );
}
