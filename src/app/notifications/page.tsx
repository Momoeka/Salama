import { getOrCreateUser } from "@/lib/user";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

const iconMap: Record<string, ReactNode> = {
  like: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-red-500">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  comment: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  follow: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 11h-6" />
    </svg>
  ),
  system: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
};

export default async function NotificationsPage() {
  const user = await getOrCreateUser();

  let notifications: any[] = [];
  if (user) {
    const { data } = await supabaseAdmin
      .from("notifications")
      .select("*, actor:actor_id (id, username, avatar_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    notifications = data || [];

    // Mark all as read
    if (notifications.some((n) => !n.read)) {
      await supabaseAdmin
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);
    }
  }

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
        <div className="space-y-1">
          {notifications.map((notif: any) => {
            const actor = notif.actor as any;
            const href = notif.post_id
              ? `/post/${notif.post_id}`
              : actor
                ? `/profile/${actor.id}`
                : "#";

            return (
              <Link
                key={notif.id}
                href={href}
                className={`flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-secondary ${
                  !notif.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="mt-0.5">
                  {iconMap[notif.type] || iconMap.system}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{notif.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notif.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {!notif.read && (
                  <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
