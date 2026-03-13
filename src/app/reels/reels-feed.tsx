"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { toggleLike } from "@/app/actions/social";
import { toggleSavePost } from "@/app/actions/saved";

interface Reel {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  likeCount: number;
  commentCount: number;
  hasLiked: boolean;
  hasSaved: boolean;
}

interface ReelsFeedProps {
  reels: Reel[];
  isLoggedIn: boolean;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function ReelItem({
  reel,
  isActive,
  isLoggedIn,
}: {
  reel: Reel;
  isActive: boolean;
  isLoggedIn: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(reel.hasLiked);
  const [likeCount, setLikeCount] = useState(reel.likeCount);
  const [saved, setSaved] = useState(reel.hasSaved);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);

  // Play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleTap = useCallback(() => {
    const now = Date.now();
    // Double tap to like
    if (now - lastTapRef.current < 300) {
      if (!liked && isLoggedIn) {
        setLiked(true);
        setLikeCount((c) => c + 1);
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
        startTransition(() => {
          toggleLike(reel.id).catch(() => {
            setLiked(false);
            setLikeCount((c) => c - 1);
          });
        });
      } else if (liked) {
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
      }
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    // Single tap: play/pause after a small delay
    setTimeout(() => {
      if (lastTapRef.current !== now) return;
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) {
        video.play().catch(() => {});
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }, 310);
  }, [liked, isLoggedIn, reel.id]);

  const handleLike = useCallback(() => {
    if (!isLoggedIn) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    startTransition(() => {
      toggleLike(reel.id).catch(() => {
        setLiked(!newLiked);
        setLikeCount((c) => c + (newLiked ? -1 : 1));
      });
    });
  }, [liked, isLoggedIn, reel.id]);

  const handleSave = useCallback(() => {
    if (!isLoggedIn) return;
    const newSaved = !saved;
    setSaved(newSaved);
    startTransition(() => {
      toggleSavePost(reel.id).catch(() => {
        setSaved(!newSaved);
      });
    });
  }, [saved, isLoggedIn, reel.id]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this reel on SALAMA",
          url: `${window.location.origin}/post/${reel.id}`,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${reel.id}`
      );
    }
  }, [reel.id]);

  return (
    <div className="relative h-full w-full bg-black">
      {/* 9:16 video container - centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <video
          ref={videoRef}
          src={reel.image_url}
          className="h-full w-full object-contain"
          loop
          muted
          playsInline
          preload={isActive ? "auto" : "metadata"}
        />
      </div>

      {/* Tap area */}
      <div
        className="absolute inset-0 z-10"
        onClick={handleTap}
      />

      {/* Double-tap heart animation */}
      {showHeart && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="96"
            height="96"
            viewBox="0 0 24 24"
            fill="white"
            className="animate-ping opacity-80 drop-shadow-lg"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      )}

      {/* Play/pause indicator */}
      {!isPlaying && isActive && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-full bg-black/40 p-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="white">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      )}

      {/* Right side action buttons - fixed overlay */}
      <div className="absolute bottom-24 right-3 z-30 flex flex-col items-center gap-5 sm:bottom-8">
        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className="rounded-full bg-black/30 p-2.5 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill={liked ? "#ef4444" : "none"}
              stroke={liked ? "#ef4444" : "white"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-white drop-shadow">{formatCount(likeCount)}</span>
        </button>

        {/* Comment */}
        <Link href={`/post/${reel.id}`} className="flex flex-col items-center gap-1">
          <div className="rounded-full bg-black/30 p-2.5 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-white drop-shadow">{formatCount(reel.commentCount)}</span>
        </Link>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="rounded-full bg-black/30 p-2.5 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-white drop-shadow">Share</span>
        </button>

        {/* Bookmark */}
        <button onClick={handleSave} className="flex flex-col items-center gap-1">
          <div className="rounded-full bg-black/30 p-2.5 backdrop-blur-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill={saved ? "white" : "none"}
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors"
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-white drop-shadow">Save</span>
        </button>

        {/* Profile avatar */}
        <Link href={`/profile/${reel.user.id}`} className="flex flex-col items-center gap-1">
          {reel.user.avatar_url ? (
            <img
              src={reel.user.avatar_url}
              alt={reel.user.username}
              className="h-10 w-10 rounded-full border-2 border-white object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white/20 text-sm font-bold text-white">
              {reel.user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
      </div>

      {/* Bottom overlay: user info + caption - fixed overlay */}
      <div className="absolute bottom-0 left-0 right-16 z-30 pb-20 sm:pb-4">
        <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-20">
          {/* User row */}
          <Link
            href={`/profile/${reel.user.id}`}
            className="mb-2 flex items-center gap-2"
          >
            <span className="text-sm font-bold text-white drop-shadow">
              @{reel.user.username}
            </span>
          </Link>

          {/* Caption */}
          {reel.caption && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                setCaptionExpanded(!captionExpanded);
              }}
              className="cursor-pointer"
            >
              <p className={`text-sm text-white/90 drop-shadow ${captionExpanded ? "" : "line-clamp-2"}`}>
                {reel.caption}
              </p>
              {!captionExpanded && reel.caption.length > 80 && (
                <span className="text-xs font-semibold text-white/70">more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReelsFeed({ reels, isLoggedIn }: ReelsFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Hide bottom nav and remove main padding on mobile for true fullscreen reels
  useEffect(() => {
    const bottomNav = document.querySelector("nav.fixed.bottom-0") as HTMLElement;
    const mainEl = document.querySelector("main") as HTMLElement;
    const footer = document.querySelector("footer") as HTMLElement;
    if (bottomNav) bottomNav.style.display = "none";
    if (mainEl) {
      mainEl.style.paddingBottom = "0";
      mainEl.style.minHeight = "0";
      mainEl.style.overflow = "hidden";
    }
    if (footer) footer.style.display = "none";
    return () => {
      if (bottomNav) bottomNav.style.display = "";
      if (mainEl) {
        mainEl.style.paddingBottom = "";
        mainEl.style.minHeight = "";
        mainEl.style.overflow = "";
      }
      if (footer) footer.style.display = "";
    };
  }, []);

  // IntersectionObserver to track which reel is in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.index
            );
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.7,
      }
    );

    const items = container.querySelectorAll("[data-index]");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [reels]);

  if (reels.length === 0) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-black px-4 text-center sm:h-[calc(100vh-4rem)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-4 opacity-40"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-white">No reels yet</h3>
        <p className="mb-6 text-sm text-white/50">
          Be the first to upload a video!
        </p>
        <Link
          href="/upload"
          className="rounded-xl bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] px-6 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          Upload a Video
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="reels-container h-[100dvh] snap-y snap-mandatory overflow-y-scroll bg-black sm:h-[calc(100vh-4rem)]"
    >
      <style>{`
        .reels-container::-webkit-scrollbar { display: none; }
        .reels-container { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          data-index={index}
          className="h-[100dvh] w-full snap-start snap-always sm:h-[calc(100vh-4rem)]"
        >
          <ReelItem
            reel={reel}
            isActive={index === activeIndex}
            isLoggedIn={isLoggedIn}
          />
        </div>
      ))}
    </div>
  );
}
