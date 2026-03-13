import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await getOrCreateUser();

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
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
            className="mx-auto mb-4 text-destructive"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          <h2 className="mb-2 text-xl font-bold text-foreground">
            Access Denied
          </h2>
          <p className="text-sm text-muted-foreground">
            You do not have permission to view this page.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // Fetch stats in parallel
  const [usersCount, postsCount, likesCount, commentsCount, recentActivity] =
    await Promise.all([
      supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true })
        .then((r) => r.count ?? 0),
      supabaseAdmin
        .from("posts")
        .select("*", { count: "exact", head: true })
        .then((r) => r.count ?? 0),
      supabaseAdmin
        .from("likes")
        .select("*", { count: "exact", head: true })
        .then((r) => r.count ?? 0),
      supabaseAdmin
        .from("comments")
        .select("*", { count: "exact", head: true })
        .then((r) => r.count ?? 0),
      supabaseAdmin
        .from("notifications")
        .select(
          `
          *,
          actor:actor_id (id, username, avatar_url)
        `
        )
        .order("created_at", { ascending: false })
        .limit(10)
        .then((r) => r.data ?? []),
    ]);

  const stats = [
    {
      label: "Total Users",
      value: usersCount,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Total Posts",
      value: postsCount,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      ),
    },
    {
      label: "Total Likes",
      value: likesCount,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
    },
    {
      label: "Total Comments",
      value: commentsCount,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your platform
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/users"
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/content"
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-secondary"
          >
            Manage Content
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              <span className="text-primary">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/users"
          className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        >
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            User Management
          </h3>
          <p className="text-sm text-muted-foreground">
            View all users, manage roles, and remove accounts.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Manage users
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
              className="transition-transform group-hover:translate-x-1"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </Link>
        <Link
          href="/admin/content"
          className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        >
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Content Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Review all posts, moderate content, and remove violations.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Manage content
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
              className="transition-transform group-hover:translate-x-1"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((item: any) => {
              const actor = item.actor as unknown as {
                id: string;
                username: string;
                avatar_url: string | null;
              } | null;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3"
                >
                  {actor?.avatar_url ? (
                    <img
                      src={actor.avatar_url}
                      alt={actor.username}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {actor?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {item.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-muted-foreground">
                    {item.type}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
