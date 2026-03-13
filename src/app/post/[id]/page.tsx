import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import { CommentForm } from "@/components/comment-form";
import { hasUserLiked } from "@/app/actions/social";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select(
      `
      *,
      users:user_id (id, username, avatar_url, clerk_id)
    `
    )
    .eq("id", id)
    .single();

  if (!post) notFound();

  const user = post.users as unknown as {
    id: string;
    username: string;
    avatar_url: string | null;
    clerk_id: string;
  };

  // Get like count + whether current user liked
  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);

  const liked = await hasUserLiked(id);

  // Get comments
  const { data: comments } = await supabase
    .from("comments")
    .select(
      `
      *,
      users:user_id (id, username, avatar_url)
    `
    )
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/feed"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
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
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Feed
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl border border-border">
          <img
            src={post.image_url}
            alt={post.caption}
            className="w-full object-contain"
          />
        </div>

        {/* Details sidebar */}
        <div className="space-y-6">
          {/* Author */}
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {user?.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <Link
                href={`/profile/${user?.id}`}
                className="font-medium text-foreground hover:text-primary"
              >
                {user?.username || "Unknown"}
              </Link>
              <p className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Caption */}
          <p className="text-foreground">{post.caption}</p>

          {/* AI description */}
          {post.ai_description && (
            <div className="rounded-xl bg-secondary p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                AI Description
              </p>
              <p className="text-sm text-foreground">{post.ai_description}</p>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Interactive stats */}
          <div className="flex gap-6 border-t border-border pt-4">
            <LikeButton
              postId={id}
              initialLiked={liked}
              initialCount={likeCount || 0}
            />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-sm">
                {comments?.length || 0}
              </span>
            </div>
          </div>

          {/* Comment form */}
          <CommentForm postId={id} />

          {/* Comments section */}
          <div className="border-t border-border pt-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Comments
            </h3>
            {!comments || comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment: any) => {
                  const commentUser = comment.users as unknown as {
                    id: string;
                    username: string;
                    avatar_url: string | null;
                  };
                  return (
                    <div key={comment.id} className="flex gap-3">
                      {commentUser?.avatar_url ? (
                        <img
                          src={commentUser.avatar_url}
                          alt={commentUser.username}
                          className="h-7 w-7 rounded-full"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                          {commentUser?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm">
                          <span className="font-medium text-foreground">
                            {commentUser?.username}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            {comment.content}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
