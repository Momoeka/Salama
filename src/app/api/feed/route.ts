import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import { getPollForPost } from "@/app/actions/polls";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor"); // created_at ISO string
  const limit = Math.min(Number(searchParams.get("limit") || "10"), 20);

  const user = await getOrCreateUser().catch(() => null);

  let query = supabaseAdmin
    .from("posts")
    .select(`*, users:user_id (id, username, avatar_url, clerk_id)`)
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: posts, error } = await query;

  if (error || !posts) {
    return NextResponse.json({ posts: [], nextCursor: null });
  }

  const enriched = await Promise.all(
    posts.map(async (post: any) => {
      const [
        { count: likeCount },
        { count: commentCount },
        { data: userLike },
        { data: recentComments },
        { data: userSaved },
        pollData,
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
          .select(`id, content, created_at, users:user_id (id, username, avatar_url)`)
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
        getPollForPost(post.id).catch(() => null),
      ]);

      return {
        id: post.id,
        image_url: post.image_url,
        caption: post.caption || "",
        media_type: post.media_type,
        location: post.location_name || undefined,
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
        poll: pollData || undefined,
      };
    })
  );

  const nextCursor =
    posts.length === limit ? posts[posts.length - 1].created_at : null;

  return NextResponse.json({ posts: enriched, nextCursor });
}
