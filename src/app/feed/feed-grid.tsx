"use client";

import { PostCard } from "@/components/post-card";

interface Post {
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
}

export function FeedGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
