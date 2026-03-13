import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { StoriesBar } from "@/components/stories-bar";
import { getActiveStories } from "@/app/actions/stories";
import { getOrCreateUser } from "@/lib/user";
import { PostFeedItem } from "./post-feed-item";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const [user, { data: posts }, storiesData] = await Promise.all([
    getOrCreateUser(),
    supabaseAdmin
      .from("posts")
      .select(
        `
      *,
      users:user_id (id, username, avatar_url, clerk_id)
    `
      )
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(20),
    getActiveStories(),
  ]);

  // For each post, fetch like count, comment count, user liked status, and recent comments in parallel
  const enrichedPosts = posts
    ? await Promise.all(
        posts.map(async (post: any) => {
          const [
            { count: likeCount },
            { count: commentCount },
            { data: userLike },
            { data: recentComments },
            { data: userSaved },
          ] = await Promise.all([
            supabaseAdmin
              .from("likes")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id),
            supabaseAdmin
              .from("comments")
              .select("*", { count: "exact", head: true })
              .eq("post_id", post.id),
            user
              ? supabaseAdmin
                  .from("likes")
                  .select("id")
                  .eq("post_id", post.id)
                  .eq("user_id", user.id)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
            supabaseAdmin
              .from("comments")
              .select(
                `
              id,
              content,
              created_at,
              users:user_id (id, username, avatar_url)
            `
              )
              .eq("post_id", post.id)
              .order("created_at", { ascending: false })
              .limit(3),
            user
              ? supabaseAdmin
                  .from("saved_posts")
                  .select("id")
                  .eq("post_id", post.id)
                  .eq("user_id", user.id)
                  .maybeSingle()
              : Promise.resolve({ data: null }),
          ]);

          return {
            id: post.id,
            image_url: post.image_url,
            caption: post.caption || "",
            media_type: post.media_type,
            created_at: post.created_at,
            user: {
              id: post.users?.id || "",
              username: post.users?.username || "Unknown",
              avatar_url: post.users?.avatar_url || null,
              clerk_id: post.users?.clerk_id || "",
            },
            likeCount: likeCount || 0,
            commentCount: commentCount || 0,
            hasLiked: !!userLike,
            hasSaved: !!userSaved,
            recentComments: (recentComments || [])
              .reverse()
              .map((c: any) => ({
                id: c.id,
                content: c.content,
                created_at: c.created_at,
                user: {
                  id: c.users?.id || "",
                  username: c.users?.username || "Unknown",
                  avatar_url: c.users?.avatar_url || null,
                },
              })),
          };
        })
      )
    : [];

  return (
    <div className="mx-auto max-w-xl pb-8">
      {/* Stories Bar */}
      <div className="px-0 pt-6 sm:px-4">
        <StoriesBar storiesData={storiesData} />
      </div>

      {!enrichedPosts || enrichedPosts.length === 0 ? (
        <div className="mx-0 rounded-none border border-border bg-card p-12 text-center sm:mx-4 sm:rounded-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 text-muted-foreground"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No posts yet
          </h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Be the first to share something!
          </p>
          <Link
            href="/upload"
            className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
          >
            Upload a Post
          </Link>
        </div>
      ) : (
        <div className="flex flex-col">
          {enrichedPosts.map((post) => (
            <PostFeedItem key={post.id} post={post} isLoggedIn={!!user} />
          ))}
        </div>
      )}
    </div>
  );
}
