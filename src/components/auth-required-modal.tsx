"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useEffect } from "react";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string; // e.g. "like", "comment", "follow"
}

export function AuthRequiredModal({
  isOpen,
  onClose,
  action = "continue",
}: AuthRequiredModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 rounded-2xl border border-border bg-card p-8 text-center shadow-2xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
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

        {/* Logo */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-xl font-bold text-white shadow-lg shadow-purple-500/20">
          S
        </div>

        <h2 className="mb-2 text-xl font-bold text-foreground">
          Sign in to {action}
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Join SALAMA to {action}, connect with creators, and share your moments.
        </p>

        <div className="flex flex-col gap-3">
          <SignInButton mode="modal">
            <button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition-all hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.01]">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary">
              Create Account
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
