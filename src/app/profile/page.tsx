import { Show } from "@clerk/nextjs";
import { getOrCreateUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getOrCreateUser();

  let posts: any[] = [];
  let followerCount = 0;
  let followingCount = 0;

  if (user) {
    const { data } = await supabaseAdmin
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    posts = data || [];

    const { count: fc } = await supabaseAdmin
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", user.id);
    followerCount = fc || 0;

    const { count: fgc } = await supabaseAdmin
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id);
    followingCount = fgc || 0;
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
                  className="h-24 w-24 rounded-full"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                  {user.username[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="mb-1 text-2xl font-bold text-foreground">
                  {user.username}
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

            {/* Posts Grid */}
            <div className="border-t border-border pt-8">
              <h2 className="mb-6 text-lg font-semibold text-foreground">
                Your Posts
              </h2>
              {posts.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-12 text-center">
                  <p className="mb-4 text-muted-foreground">
                    You haven&apos;t posted anything yet.
                  </p>
                  <Link
                    href="/upload"
                    className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-accent"
                  >
                    Upload Your First Post
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
                  {posts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.id}`}
                      className="group relative aspect-square overflow-hidden rounded-xl"
                    >
                      <img
                        src={post.image_url}
                        alt={post.caption}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="p-3 text-sm text-white line-clamp-2">
                          {post.caption}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
