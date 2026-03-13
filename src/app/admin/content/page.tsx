import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import Link from "next/link";
import { DeletePostButton } from "./delete-post-button";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const user = await getOrCreateUser();

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <h2 className="mb-2 text-xl font-bold text-foreground">
            Access Denied
          </h2>
          <p className="text-sm text-muted-foreground">
            You do not have permission to view this page.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const { data: posts } = await supabaseAdmin
    .from("posts")
    .select(
      `
      *,
      users:user_id (id, username, avatar_url)
    `
    )
    .order("created_at", { ascending: false });

  // Get like and comment counts for all posts
  const postIds = (posts ?? []).map((p: any) => p.id);
  const likeCounts: Record<string, number> = {};
  const commentCounts: Record<string, number> = {};

  if (postIds.length > 0) {
    const { data: likes } = await supabaseAdmin
      .from("likes")
      .select("post_id")
      .in("post_id", postIds);

    if (likes) {
      for (const like of likes) {
        likeCounts[like.post_id] = (likeCounts[like.post_id] || 0) + 1;
      }
    }

    const { data: comments } = await supabaseAdmin
      .from("comments")
      .select("post_id")
      .in("post_id", postIds);

    if (comments) {
      for (const comment of comments) {
        commentCounts[comment.post_id] =
          (commentCounts[comment.post_id] || 0) + 1;
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">
          Admin
        </Link>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="text-foreground">Content</span>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Content Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {posts?.length ?? 0} posts total
        </p>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No posts found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => {
            const postUser = post.users as unknown as {
              id: string;
              username: string;
              avatar_url: string | null;
            } | null;

            return (
              <div
                key={post.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <Link
                  href={`/post/${post.id}`}
                  className="block aspect-square overflow-hidden"
                >
                  <img
                    src={post.image_url}
                    alt={post.caption || "Post image"}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </Link>
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    {postUser?.avatar_url ? (
                      <img
                        src={postUser.avatar_url}
                        alt={postUser.username}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {postUser?.username?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {postUser?.username || "Unknown"}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {post.caption && (
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                      {post.caption}
                    </p>
                  )}

                  <div className="mb-3 flex items-center gap-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      <span className="text-xs">
                        {likeCounts[post.id] || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="text-xs">
                        {commentCounts[post.id] || 0}
                      </span>
                    </div>
                  </div>

                  <DeletePostButton postId={post.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
