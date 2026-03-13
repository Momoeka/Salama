import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getTrendingPosts() {
  // Get posts from last 30 days with their like counts
  const { data: posts } = await supabaseAdmin
    .from("posts")
    .select("id, image_url, caption, created_at, media_type, users:user_id(id, username, avatar_url)")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(60);

  if (!posts || posts.length === 0) return [];

  // Get like and comment counts for these posts
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

  // Sort by likes and take top 30
  return enriched.sort((a, b) => b.like_count - a.like_count).slice(0, 30);
}

async function getPopularCreators() {
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, username, avatar_url")
    .limit(50);

  if (!users || users.length === 0) return [];

  // Get follower counts
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
    <div className="mx-auto max-w-7xl px-2 py-4 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="mb-1 text-3xl font-bold text-foreground">Explore</h1>
      <p className="mb-8 text-muted-foreground">Discover trending posts and popular creators</p>

      {/* Popular Creators */}
      {popularCreators.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Popular Creators
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {popularCreators.map((creator: any) => (
              <Link
                key={creator.id}
                href={`/profile/${creator.id}`}
                className="flex w-36 flex-shrink-0 flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-violet-500/30 hover:bg-secondary"
              >
                {creator.avatar_url ? (
                  <img
                    src={creator.avatar_url}
                    alt={creator.username}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-violet-500/20"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-lg font-bold text-white ring-2 ring-violet-500/20">
                    {creator.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="text-center">
                  <p className="truncate text-sm font-semibold text-foreground w-full">
                    {creator.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Trending Posts
        </h2>
        {trendingPosts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
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
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No trending posts yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Posts with the most likes from the past week will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-4">
            {trendingPosts.map((post: any, index: number) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-violet-500/30 hover:shadow-lg hover:shadow-purple-500/5 ${
                  index % 5 === 0 ? "row-span-2 aspect-[3/5]" : index % 5 === 3 ? "row-span-2 aspect-[3/5]" : "aspect-square"
                }`}
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

                {/* Overlay on hover */}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="w-full p-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                        <span className="text-xs font-medium text-white">{post.like_count ?? 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        <span className="text-xs font-medium text-white">{post.comment_count ?? 0}</span>
                      </div>
                    </div>
                    {post.caption && (
                      <p className="mt-1 line-clamp-2 text-xs text-white/80">
                        {post.caption}
                      </p>
                    )}
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
