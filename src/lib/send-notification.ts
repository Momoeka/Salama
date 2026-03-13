import webpush from "web-push";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Configure VAPID keys
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_EMAIL = process.env.VAPID_EMAIL || "mailto:noreply@salama.app";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  actions?: Array<{ action: string; title: string }>;
}

/**
 * Send a push notification to a specific user.
 * Silently fails if user has no subscription or keys aren't configured.
 */
export async function sendPushNotification(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  const { data: subscriptions } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subscriptions || subscriptions.length === 0) return;

  const payloadStr = JSON.stringify(payload);

  await Promise.allSettled(
    subscriptions.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payloadStr
        );
      } catch (err: any) {
        // Remove expired subscriptions (410 Gone)
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        }
      }
    })
  );
}

// Convenience functions for common notification types
export function notifyLike(userId: string, likerName: string, postId: string) {
  return sendPushNotification(userId, {
    title: "SALAMA",
    body: `${likerName} liked your post`,
    url: `/post/${postId}`,
  });
}

export function notifyComment(
  userId: string,
  commenterName: string,
  postId: string
) {
  return sendPushNotification(userId, {
    title: "SALAMA",
    body: `${commenterName} commented on your post`,
    url: `/post/${postId}`,
  });
}

export function notifyFollow(userId: string, followerName: string) {
  return sendPushNotification(userId, {
    title: "SALAMA",
    body: `${followerName} started following you`,
    url: "/profile",
  });
}

export function notifyMessage(
  userId: string,
  senderName: string,
  channelId: string
) {
  return sendPushNotification(userId, {
    title: "SALAMA",
    body: `${senderName} sent you a message`,
    url: `/messages/${channelId}`,
  });
}
