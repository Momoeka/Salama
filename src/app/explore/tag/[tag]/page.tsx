import { getPostsByHashtag } from "@/app/actions/hashtags";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HashtagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = await getPostsByHashtag(tag);

  return (
    <div className="mx-auto max-w-7xl px-2 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-8">
        <Link
          href="/explore"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to Explore
        </Link>
        <h1 className="text-3xl font-bold text-foreground">#{tag}</h1>
        <p className="text-muted-foreground">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No posts with #{tag}
          </h3>
          <p className="text-sm text-muted-foreground">
            Be the first to use this hashtag!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-4">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-violet-500/30 hover:shadow-lg"
            >
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.caption || "Post"}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/20 to-purple-600/20 p-4">
                  <p className="line-clamp-4 text-center text-sm text-foreground">
                    {post.caption || "Post"}
                  </p>
                </div>
              )}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="w-full p-3">
                  {post.caption && (
                    <p className="line-clamp-2 text-xs text-white/80">{post.caption}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
