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

function groupNotifications(notifications: any[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const today: any[] = [];
  const thisWeek: any[] = [];
  const earlier: any[] = [];

  for (const n of notifications) {
    const date = new Date(n.created_at);
    if (date >= todayStart) today.push(n);
    else if (date >= weekStart) thisWeek.push(n);
    else earlier.push(n);
  }

  return [
    { label: "Today", items: today },
    { label: "This Week", items: thisWeek },
    { label: "Earlier", items: earlier },
  ].filter((g) => g.items.length > 0);
}

export default async function NotificationsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect("/");

  const { data } = await supabaseAdmin
    .from("notifications")
    .select("*, actor:actor_id(id, username, avatar_url), post:post_id(id, image_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = data || [];

  // Mark all unread as read
  await supabaseAdmin
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  const groups = groupNotifications(notifications);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-foreground">
        Notifications
      </h1>

      {notifications.length === 0 ? (
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
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            No notifications yet
          </h3>
          <p className="text-sm text-muted-foreground">
            When someone likes, comments, or follows you, you&apos;ll see it
            here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </h2>
              <div className="space-y-0.5">
                {group.items.map((notif: any) => {
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
                      className={`flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary ${
                        !notif.read ? "bg-primary/5" : ""
                      }`}
                    >
                      {/* Actor avatar with type badge */}
                      <div className="relative flex-shrink-0">
                        {actor?.avatar_url ? (
                          <img
                            src={actor.avatar_url}
                            alt={actor.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-sm font-bold text-white">
                            {actor?.username?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        {/* Type badge */}
                        <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-card">
                          {notif.type === "like" && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-red-500"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                          )}
                          {notif.type === "comment" && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-blue-500"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                          )}
                          {notif.type === "follow" && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-violet-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                          )}
                        </div>
                      </div>

                      {/* Message */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">{notif.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>

                      {/* Post thumbnail */}
                      {post?.image_url && (
                        <img
                          src={post.image_url}
                          alt=""
                          className="h-11 w-11 flex-shrink-0 rounded-lg object-cover"
                        />
                      )}

                      {/* Unread dot */}
                      {!notif.read && (
                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-violet-500" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
