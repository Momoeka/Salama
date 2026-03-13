import { supabaseAdmin } from "@/lib/supabase-admin";
import { getOrCreateUser } from "@/lib/user";
import Link from "next/link";
import { UserSearch } from "./user-search";
import { UserActions } from "./user-actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getOrCreateUser();

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
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

  const { q } = await searchParams;

  let query = supabaseAdmin
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("username", `%${q}%`);
  }

  const { data: users } = await query;

  // Get post counts for all users
  const userIds = (users ?? []).map((u: any) => u.id);
  const postCounts: Record<string, number> = {};

  if (userIds.length > 0) {
    const { data: posts } = await supabaseAdmin
      .from("posts")
      .select("user_id")
      .in("user_id", userIds);

    if (posts) {
      for (const post of posts) {
        postCounts[post.user_id] = (postCounts[post.user_id] || 0) + 1;
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">
          Admin
        </Link>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="text-foreground">Users</span>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {users?.length ?? 0} users total
          </p>
        </div>
      </div>

      <UserSearch initialQuery={q ?? ""} />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Posts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(!users || users.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    No users found.
                  </td>
                </tr>
              )}
              {users?.map((u: any) => (
                <tr
                  key={u.id}
                  className="transition-colors hover:bg-secondary/30"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <img
                          src={u.avatar_url}
                          alt={u.username}
                          className="h-9 w-9 rounded-full"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {u.username?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {u.username}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {u.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {postCounts[u.id] || 0}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <UserActions
                      userId={u.id}
                      currentRole={u.role}
                      isSelf={u.id === user.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
