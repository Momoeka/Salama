"use client";

import { useState, useEffect, useCallback, useRef, useTransition } from "react";
import type { UserWithStories } from "@/app/actions/stories";
import { deleteStory } from "@/app/actions/stories";
import { reactToStory } from "@/app/actions/story-reactions";

interface StoryViewerProps {
  allUserStories: UserWithStories[];
  initialUserIndex: number;
  currentUserId?: string;
  onClose: () => void;
}

const STORY_DURATION = 5000; // 5 seconds per story

export function StoryViewer({
  allUserStories,
  initialUserIndex,
  currentUserId,
  onClose,
}: StoryViewerProps) {
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [floatingEmoji, setFloatingEmoji] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentUser = allUserStories[userIndex];
  const currentStory = currentUser?.stories[storyIndex];
  const isVideo = currentStory?.media_type === "video";

  const goNext = useCallback(() => {
    if (!currentUser) return;

    if (storyIndex < currentUser.stories.length - 1) {
      // Next story for same user
      setStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else if (userIndex < allUserStories.length - 1) {
      // Next user
      setUserIndex((prev) => prev + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      // End of all stories
      onClose();
    }
  }, [currentUser, storyIndex, userIndex, allUserStories.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else if (userIndex > 0) {
      const prevUser = allUserStories[userIndex - 1];
      setUserIndex((prev) => prev - 1);
      setStoryIndex(prevUser.stories.length - 1);
      setProgress(0);
    }
  }, [storyIndex, userIndex, allUserStories]);

  // Auto-advance timer (only for images; videos advance on ended)
  useEffect(() => {
    if (isVideo) return;

    startTimeRef.current = Date.now();
    setProgress(0);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        goNext();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [userIndex, storyIndex, isVideo, goNext]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!currentUser || !currentStory) return null;

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      goPrev();
    } else {
      goNext();
    }
  }

  function handleVideoEnded() {
    goNext();
  }

  function handleVideoTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
    const video = e.currentTarget;
    if (video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  }

  function handleDelete() {
    if (!currentStory) return;
    startTransition(async () => {
      try {
        await deleteStory(currentStory.id);
        // If this was the last story for this user, go to next user or close
        if (currentUser.stories.length <= 1) {
          if (userIndex < allUserStories.length - 1) {
            setUserIndex((prev) => prev + 1);
            setStoryIndex(0);
          } else {
            onClose();
          }
        } else {
          goNext();
        }
      } catch {
        // ignore
      }
    });
  }

  const isOwnStory = currentUserId === currentUser?.user_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
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

      {/* Story container */}
      <div
        className="relative flex h-full max-h-[90vh] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl bg-black"
        onClick={handleTap}
      >
        {/* Progress bars */}
        <div className="absolute left-0 right-0 top-0 z-30 flex gap-1 p-3">
          {currentUser.stories.map((_, i) => (
            <div
              key={i}
              className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full rounded-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width:
                    i < storyIndex
                      ? "100%"
                      : i === storyIndex
                        ? `${progress}%`
                        : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* User info header */}
        <div className="absolute left-0 right-0 top-6 z-30 flex items-center gap-3 px-4 py-2">
          {currentUser.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.username}
              className="h-8 w-8 rounded-full border border-white/30 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {currentUser.username?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <span className="text-sm font-semibold text-white drop-shadow-lg">
            {currentUser.username}
          </span>
          <span className="text-xs text-white/60">
            {timeAgo(currentStory.created_at)}
          </span>
          <span className="text-xs text-white/60">
            {timeLeft(currentStory.expires_at)}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {isOwnStory && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isPending}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-white backdrop-blur-sm transition-colors hover:bg-red-500/40 disabled:opacity-50"
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
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Media content */}
        <div className="flex flex-1 items-center justify-center">
          {isVideo ? (
            <video
              key={currentStory.id}
              src={currentStory.media_url}
              className="max-h-full max-w-full object-contain"
              autoPlay
              playsInline
              onEnded={handleVideoEnded}
              onTimeUpdate={handleVideoTimeUpdate}
            />
          ) : (
            <img
              key={currentStory.id}
              src={currentStory.media_url}
              alt={currentStory.caption || "Story"}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* Caption at bottom */}
        {currentStory.caption && (
          <div className="absolute bottom-14 left-0 right-0 z-30 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12">
            <p className="text-sm text-white drop-shadow-lg">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Floating emoji animation */}
        {floatingEmoji && (
          <div
            key={Date.now()}
            className="pointer-events-none absolute bottom-16 left-1/2 z-40 -translate-x-1/2 text-5xl"
            style={{
              animation: "emojiFloat 1s ease-out forwards",
            }}
          >
            {floatingEmoji}
          </div>
        )}

        {/* Emoji reaction bar */}
        {!isOwnStory && currentUserId && (
          <div
            className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-4 bg-black/50 px-4 py-3 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {["❤️", "😂", "😮", "😢", "🔥", "👏"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setFloatingEmoji(emoji);
                  setTimeout(() => setFloatingEmoji(null), 1000);
                  startTransition(() => {
                    reactToStory(currentStory.id, emoji).catch(() => {});
                  });
                }}
                className="text-2xl transition-transform hover:scale-125 active:scale-90"
                aria-label={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <style>{`
          @keyframes emojiFloat {
            0% { opacity: 1; transform: translate(-50%, 0) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -120px) scale(1.5); }
          }
        `}</style>
      </div>

      {/* Left / Right navigation hints (for larger screens) */}
      {userIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-4 hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 lg:flex"
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
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      )}
      {userIndex < allUserStories.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-4 hidden h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 lg:flex"
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
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function timeLeft(expiresAt: string): string {
  const remaining = new Date(expiresAt).getTime() - Date.now();
  if (remaining <= 0) return "expired";
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}
