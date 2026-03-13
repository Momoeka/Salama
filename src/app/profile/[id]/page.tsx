import { supabaseAdmin } from "@/lib/supabase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FollowButton } from "@/components/follow-button";
import { BlockButton } from "@/components/block-button";
import { isFollowing } from "@/app/actions/social";
import { isBlocked, isBlockedBy } from "@/app/actions/block";
import { getOrCreateUser } from "@/lib/user";
import { ProfileTabs } from "../profile-tabs";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const currentUser = await getOrCreateUser();

  // Check if this user blocked us
  const blockedByThem = currentUser ? await isBlockedBy(id) : false;
  if (blockedByThem) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="mb-2 text-xl font-bold text-foreground">
          This profile is not available
        </h2>
        <p className="text-muted-foreground">
          The content you&apos;re looking for doesn&apos;t exist or is unavailable.
        </p>
      </div>
    );
  }

  const { data: profileUser } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!profileUser) notFound();

  const [{ data: posts }, { count: followerCount }, { count: followingCount }] =
    await Promise.all([
      supabaseAdmin
        .from("posts")
        .select("*")
        .eq("user_id", id)
        .eq("visibility", "public")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", id),
      supabaseAdmin
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", id),
    ]);

  const isOwnProfile = currentUser?.id === id;
  const [following, blocked] = currentUser && !isOwnProfile
    ? await Promise.all([isFollowing(id), isBlocked(id)])
    : [false, false];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {profileUser.avatar_url ? (
          <img
            src={profileUser.avatar_url}
            alt={profileUser.username}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-border"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-3xl font-bold text-white ring-4 ring-border">
            {profileUser.username[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="mb-1 text-2xl font-bold text-foreground">
            {profileUser.username}
          </h1>
          {profileUser.bio && (
            <p className="mb-4 text-sm text-foreground">{profileUser.bio}</p>
          )}
          <div className="flex justify-center gap-8 sm:justify-start">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {posts?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {followerCount || 0}
              </div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {followingCount || 0}
              </div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
          </div>
        </div>
        {isOwnProfile ? (
          <Link
            href="/settings"
            className="rounded-xl border border-border px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Edit Profile
          </Link>
        ) : currentUser ? (
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <FollowButton targetUserId={id} initialFollowing={following} />
              <Link
                href={`/messages/NEW?user=${id}`}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <span className="flex items-center gap-1.5">
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
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Message
                </span>
              </Link>
            </div>
            <BlockButton targetUserId={id} initialBlocked={blocked} />
          </div>
        ) : null}
      </div>

      {/* Posts Grid */}
      <ProfileTabs posts={posts || []} />
    </div>
  );
}
