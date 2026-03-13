import { Show } from "@clerk/nextjs";
import { getOrCreateUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getSavedPosts } from "@/app/actions/saved";
import Link from "next/link";
import { ProfileTabs } from "./profile-tabs";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getOrCreateUser();

  let posts: any[] = [];
  let savedPosts: any[] = [];
  let followerCount = 0;
  let followingCount = 0;

  if (user) {
    const [postsRes, savedRes, fcRes, fgcRes] = await Promise.all([
      supabaseAdmin
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
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
    ]);

    posts = postsRes.data || [];
    savedPosts = (savedRes as any[]).map((s: any) => s.post).filter(Boolean);
    followerCount = fcRes.count || 0;
    followingCount = fgcRes.count || 0;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <Show when="signed-in">
        {user && (
          <>
            {/* Profile Header */}
            <div className="mb-8 flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-8">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-border sm:h-24 sm:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground ring-2 ring-border sm:h-24 sm:w-24 sm:text-3xl">
                  {user.username[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <div className="mb-3 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                  <h1 className="text-xl font-semibold text-foreground">
                    {user.username}
                  </h1>
                  <Link
                    href="/settings"
                    className="rounded-md border border-border px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Edit Profile
                  </Link>
                </div>
                <div className="mb-3 flex justify-center gap-6 sm:justify-start">
                  <div className="text-center sm:text-left">
                    <span className="font-semibold text-foreground">{posts.length}</span>
                    <span className="ml-1 text-sm text-muted-foreground">posts</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="font-semibold text-foreground">{followerCount}</span>
                    <span className="ml-1 text-sm text-muted-foreground">followers</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="font-semibold text-foreground">{followingCount}</span>
                    <span className="ml-1 text-sm text-muted-foreground">following</span>
                  </div>
                </div>
                {user.bio && (
                  <p className="text-sm text-foreground">{user.bio}</p>
                )}
              </div>
            </div>

            <ProfileTabs
              posts={posts}
              savedPosts={savedPosts}
              showSaved={true}
            />
          </>
        )}
      </Show>
      <Show when="signed-out">
        <div className="py-20 text-center">
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Sign in to view your profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Create an account or sign in to get started.
          </p>
        </div>
      </Show>
    </div>
  );
}
