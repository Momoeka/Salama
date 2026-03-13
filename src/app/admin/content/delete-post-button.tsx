"use client";

import { useState, useTransition } from "react";
import { deletePost } from "../actions";

export function DeletePostButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (confirmDelete) {
    return (
      <div className="flex gap-2">
        <button
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await deletePost(postId);
              setConfirmDelete(false);
            });
          }}
          className="flex-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-destructive/80 disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Confirm Delete"}
        </button>
        <button
          onClick={() => setConfirmDelete(false)}
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirmDelete(true)}
      className="w-full rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
    >
      Delete Post
    </button>
  );
}
