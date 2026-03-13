import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { StoriesBar } from "@/components/stories-bar";
import { getActiveStories } from "@/app/actions/stories";
import { FeedGrid } from "./feed-grid";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const [{ data: posts }, storiesData] = await Promise.all([
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
      .limit(30),
    getActiveStories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">Feed</h1>

      {/* Stories Bar */}
      <StoriesBar storiesData={storiesData} />

      {!posts || posts.length === 0 ? (
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
        <FeedGrid posts={posts.map((p: any) => ({ ...p, users: p.users as any }))} />
      )}
    </div>
  );
}
