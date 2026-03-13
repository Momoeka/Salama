import { Show } from "@clerk/nextjs";
import { getOrCreateUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSavedPosts } from "@/app/actions/saved";
import Link from "next/link";
import { ProfileTabs } from "./profile-tabs";
import { VerifiedBadge } from "@/components/verified-badge";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getOrCreateUser();

  let posts: any[] = [];
  let savedPosts: any[] = [];
  let scheduledPosts: any[] = [];
  let draftPosts: any[] = [];
  let followerCount = 0;
  let followingCount = 0;

  if (user) {
    const [postsRes, savedRes, fcRes, fgcRes, scheduledRes, draftsRes] = await Promise.all([
      supabaseAdmin
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .or("status.eq.published,status.is.null")
        .order("created_at", { ascending: false }),
      getSavedPosts().catch(() => []),
      supabaseAdmin
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", user.id),
      supabaseAdmin
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.id),
      supabaseAdmin
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "scheduled")
        .order("scheduled_at", { ascending: true }),
      supabaseAdmin
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "draft")
        .order("created_at", { ascending: false }),
    ]);

    posts = postsRes.data || [];
    savedPosts = (savedRes as any[]).map((s: any) => s.post).filter(Boolean);
    followerCount = fcRes.count || 0;
    followingCount = fgcRes.count || 0;
    scheduledPosts = scheduledRes.data || [];
    draftPosts = draftsRes.data || [];
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Show when="signed-in">
        {user && (
          <>
            {/* Profile Header */}
            <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-border"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-3xl font-bold text-white ring-4 ring-border">
                  {user.username[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="mb-1 flex items-center justify-center gap-1.5 text-2xl font-bold text-foreground sm:justify-start">
                  {user.username}
                  {(user as any).role === "admin" && <VerifiedBadge size="md" />}
                </h1>
                <p className="mb-1 text-sm text-muted-foreground">
                  {user.email}
                </p>
                {user.bio && (
                  <p className="mb-4 text-sm text-foreground">{user.bio}</p>
                )}
                <div className="flex justify-center gap-8 sm:justify-start">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {posts.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {followerCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Followers
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {followingCount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Following
                    </div>
                  </div>
                </div>
              </div>
              <Link
                href="/settings"
                className="rounded-xl border border-border px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Edit Profile
              </Link>
            </div>

            {/* Posts & Saved Tabs */}
            <ProfileTabs
              posts={posts}
              savedPosts={savedPosts}
              scheduledPosts={scheduledPosts}
              draftPosts={draftPosts}
              showSaved={true}
            />
          </>
        )}
      </Show>
      <Show when="signed-out">
        <div className="py-20 text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Sign in to view your profile
          </h2>
          <p className="text-muted-foreground">
            Create an account or sign in to manage your profile and posts.
          </p>
        </div>
      </Show>
    </div>
  );
}
