"use client";

import { useState, useTransition } from "react";
import { blockUser, unblockUser } from "@/app/actions/block";

interface BlockButtonProps {
  targetUserId: string;
  initialBlocked: boolean;
}

export function BlockButton({ targetUserId, initialBlocked }: BlockButtonProps) {
  const [blocked, setBlocked] = useState(initialBlocked);
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleToggleBlock() {
    if (!blocked) {
      setShowConfirm(true);
      return;
    }
    // Unblock
    setBlocked(false);
    startTransition(async () => {
      try {
        await unblockUser(targetUserId);
      } catch {
        setBlocked(true);
      }
    });
  }

  function confirmBlock() {
    setShowConfirm(false);
    setBlocked(true);
    startTransition(async () => {
      try {
        await blockUser(targetUserId);
      } catch {
        setBlocked(false);
      }
    });
  }

  return (
    <>
      <button
        onClick={handleToggleBlock}
        disabled={isPending}
        className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
          blocked
            ? "border border-border text-muted-foreground hover:bg-secondary"
            : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
        }`}
      >
        {isPending ? "..." : blocked ? "Unblock" : "Block"}
      </button>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-border bg-card p-6 shadow-2xl text-center">
            <h3 className="mb-2 text-lg font-bold text-foreground">
              Block this user?
            </h3>
            <p className="mb-6 text-sm text-muted-foreground">
              They won&apos;t be able to find your profile, posts, or send you messages. You can unblock them anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmBlock}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
