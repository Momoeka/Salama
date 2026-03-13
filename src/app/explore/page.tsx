import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getTrendingPosts() {
  const { data: posts } = await supabaseAdmin
    .from("posts")
    .select("id, image_url, caption, created_at, media_type, users:user_id(id, username, avatar_url)")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(60);

  if (!posts || posts.length === 0) return [];

  const enriched = await Promise.all(
    posts.map(async (post: any) => {
      const [{ count: likeCount }, { count: commentCount }] = await Promise.all([
        supabaseAdmin
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id),
        supabaseAdmin
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id),
      ]);
      return { ...post, like_count: likeCount || 0, comment_count: commentCount || 0 };
    })
  );

  return enriched.sort((a, b) => b.like_count - a.like_count).slice(0, 30);
}

async function getPopularCreators() {
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, username, avatar_url")
    .limit(50);

  if (!users || users.length === 0) return [];

  const enriched = await Promise.all(
    users.map(async (u: any) => {
      const { count } = await supabaseAdmin
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", u.id);
      return { ...u, follower_count: count || 0 };
    })
  );

  return enriched.sort((a, b) => b.follower_count - a.follower_count).slice(0, 20);
}

export default async function ExplorePage() {
  const [trendingPosts, popularCreators] = await Promise.all([
    getTrendingPosts(),
    getPopularCreators(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">Explore</h1>
        <p className="mt-1 text-sm text-muted-foreground">Discover what&apos;s trending</p>
      </div>

      {/* Popular Creators */}
      {popularCreators.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Creators
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {popularCreators.map((creator: any) => (
              <Link
                key={creator.id}
                href={`/profile/${creator.id}`}
                className="flex w-28 flex-shrink-0 flex-col items-center gap-2.5 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary"
              >
                {creator.avatar_url ? (
                  <img
                    src={creator.avatar_url}
                    alt={creator.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {creator.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="w-full text-center">
                  <p className="truncate text-xs font-medium text-foreground">
                    {creator.username}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {creator.follower_count ?? 0} followers
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Trending Posts */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Trending
        </h2>
        {trendingPosts.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No trending posts yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            {trendingPosts.map((post: any) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="group relative aspect-square overflow-hidden bg-secondary"
              >
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt={post.caption || "Post"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-3">
                    <p className="line-clamp-3 text-center text-xs text-muted-foreground">
                      {post.caption || "Post"}
                    </p>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center gap-4 text-white">
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                      {post.like_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1 text-sm font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                      {post.comment_count ?? 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
