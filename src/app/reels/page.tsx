import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import { ReelsFeed } from "./reels-feed";

export const dynamic = "force-dynamic";

export default async function ReelsPage() {
  const [user, { data: posts }] = await Promise.all([
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
      .eq("media_type", "video")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const enrichedReels = posts
    ? await Promise.all(
        posts.map(async (post: any) => {
          const [
            { count: likeCount },
            { count: commentCount },
            { data: userLike },
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
            created_at: post.created_at,
            user: {
              id: post.users?.id || "",
              username: post.users?.username || "Unknown",
              avatar_url: post.users?.avatar_url || null,
            },
            likeCount: likeCount || 0,
            commentCount: commentCount || 0,
            hasLiked: !!userLike,
            hasSaved: !!userSaved,
          };
        })
      )
    : [];

  return <ReelsFeed reels={enrichedReels} isLoggedIn={!!user} />;
}
