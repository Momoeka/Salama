import { getCollectionPosts } from "@/app/actions/collections";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const posts = await getCollectionPosts(id);

  if (!posts) return notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/profile/collections"
          className="rounded-lg p-2 hover:bg-secondary transition-colors"
          aria-label="Back to collections"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-foreground">
          Collection ({posts.length} posts)
        </h1>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">This collection is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="group relative aspect-square overflow-hidden bg-secondary"
            >
              {post.media_type === "video" ? (
                <video
                  src={post.image_url}
                  className="h-full w-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={post.image_url}
                  alt={post.alt_text || post.caption || "Post"}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
