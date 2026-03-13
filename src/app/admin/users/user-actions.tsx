"use client";

import { useState, useTransition } from "react";
import { deleteUser, updateUserRole } from "../actions";

export function UserActions({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isSelf) {
    return (
      <span className="text-xs text-muted-foreground italic">You</span>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await updateUserRole(
              userId,
              currentRole === "admin" ? "user" : "admin"
            );
          });
        }}
        className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/50 disabled:opacity-50"
      >
        {isPending
          ? "..."
          : currentRole === "admin"
            ? "Demote"
            : "Promote"}
      </button>

      {confirmDelete ? (
        <div className="flex items-center gap-1">
          <button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await deleteUser(userId);
                setConfirmDelete(false);
              });
            }}
            className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-destructive/80 disabled:opacity-50"
          >
            {isPending ? "..." : "Confirm"}
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          Delete
        </button>
      )}
    </div>
  );
}
