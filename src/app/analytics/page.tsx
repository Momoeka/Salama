import { getOrCreateUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function truncate(str: string, len: number): string {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

export default async function AnalyticsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/");

  // Fetch user's posts
  const { data: allPosts } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const posts = allPosts || [];

  // Fetch follower count
  const { count: followerCount } = await supabaseAdmin
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", user.id);

  // Fetch like and comment counts for each post in parallel
  const postStats = await Promise.all(
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
      return {
        ...post,
        likeCount: likeCount || 0,
        commentCount: commentCount || 0,
      };
    })
  );

  const totalLikes = postStats.reduce((sum, p) => sum + p.likeCount, 0);
  const totalComments = postStats.reduce((sum, p) => sum + p.commentCount, 0);

  // Last 10 posts for the chart (chronological order for display)
  const last10 = postStats.slice(0, 10).reverse();

  // Top 5 posts by likes
  const top5 = [...postStats].sort((a, b) => b.likeCount - a.likeCount).slice(0, 5);

  // Max likes for bar chart scaling
  const maxLikes = Math.max(...last10.map((p) => p.likeCount), 1);

  // Recent activity from notifications
  const { data: recentActivity } = await supabaseAdmin
    .from("notifications")
    .select("*, actor:actor_id(id, username, avatar_url), post:post_id(id, image_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const notifications = recentActivity || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Creator Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your content performance and audience growth.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider">Total Posts</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{posts.length}</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-red-500">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider">Total Likes</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{totalLikes}</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider">Total Comments</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{totalComments}</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider">Followers</span>
          </div>
          <div className="text-3xl font-bold text-foreground">{followerCount || 0}</div>
        </div>
      </div>

      {/* Engagement Chart */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Engagement Chart</h2>
        <p className="mb-6 text-xs text-muted-foreground">Likes per post (last 10 posts)</p>

        {last10.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No posts yet. Upload your first post to see engagement data.
          </div>
        ) : (
          <div className="flex items-end gap-2 sm:gap-3" style={{ height: "220px" }}>
            {last10.map((post: any) => {
              const barHeight = Math.max((post.likeCount / maxLikes) * 100, 4);
              return (
                <div
                  key={post.id}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  style={{ height: "100%" }}
                >
                  {/* Tooltip on hover */}
                  <div className="pointer-events-none absolute -top-2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg group-hover:block">
                    <div className="font-medium text-foreground">{post.likeCount} likes</div>
                    <div className="text-muted-foreground">{truncate(post.caption, 30)}</div>
                  </div>

                  {/* Like count label */}
                  <span className="mb-1 text-[10px] font-medium text-muted-foreground sm:text-xs">
                    {post.likeCount}
                  </span>

                  {/* Bar */}
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[var(--gradient-start)] to-[var(--gradient-end)] transition-all group-hover:opacity-80"
                    style={{ height: `${barHeight}%` }}
                  />

                  {/* Caption label */}
                  <span className="mt-2 max-w-full truncate text-[9px] text-muted-foreground sm:text-[10px]">
                    {truncate(post.caption, 12)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top Posts */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Top Posts</h2>
          <p className="mb-4 text-xs text-muted-foreground">Your best performing content by likes</p>

          {top5.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No posts yet.
            </div>
          ) : (
            <div className="space-y-3">
              {top5.map((post: any, index: number) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-secondary"
                >
                  {/* Rank */}
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                    {index + 1}
                  </span>

                  {/* Thumbnail */}
                  {post.image_url ? (
                    <img
                      src={post.image_url}
                      alt=""
                      className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {post.caption || "No caption"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-shrink-0 items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-red-500">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                      {post.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {post.commentCount}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-1 text-lg font-semibold text-foreground">Recent Activity</h2>
          <p className="mb-4 text-xs text-muted-foreground">Latest interactions on your content</p>

          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No activity yet. Share content to start receiving interactions.
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notif: any) => {
                const actor = notif.actor as any;
                const post = notif.post as any;
                const href = notif.post_id
                  ? `/post/${notif.post_id}`
                  : actor
                    ? `/profile/${actor.id}`
                    : "#";

                return (
                  <Link
                    key={notif.id}
                    href={href}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-secondary"
                  >
                    {/* Actor avatar */}
                    <div className="relative flex-shrink-0">
                      {actor?.avatar_url ? (
                        <img
                          src={actor.avatar_url}
                          alt={actor.username}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-xs font-bold text-white">
                          {actor?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      {/* Type badge */}
                      <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card bg-background">
                        {notif.type === "like" && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                        )}
                        {notif.type === "comment" && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        )}
                        {notif.type === "follow" && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-violet-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(notif.created_at)}</p>
                    </div>

                    {/* Post thumbnail */}
                    {post?.image_url && (
                      <img
                        src={post.image_url}
                        alt=""
                        className="h-9 w-9 flex-shrink-0 rounded-lg object-cover"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
