"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface PostCardProps {
  post: {
    id: string;
    image_url: string;
    caption: string;
    media_type?: string;
    tags?: string[];
    users: {
      id: string;
      username: string;
      avatar_url: string | null;
      clerk_id: string;
    };
  };
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const user = post.users;
  const isVideo = post.media_type === "video";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
    >
      <Link
        href={`/post/${post.id}`}
        className="group relative block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
      >
        {/* Media */}
        <div className="relative aspect-square overflow-hidden">
          {isVideo ? (
            <video
              src={post.image_url}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={post.image_url}
              alt={post.caption}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/30" />

          {/* Video badge */}
          {isVideo && (
            <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              Video
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="h-7 w-7 rounded-full ring-2 ring-border"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-2 ring-border">
                {user?.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span className="text-sm font-medium text-foreground">
              {user?.username || "Unknown"}
            </span>
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {post.caption}
          </p>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
