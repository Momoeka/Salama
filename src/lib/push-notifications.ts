/**
 * Client-side push notification helpers.
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;

  // Check for existing subscription
  let subscription = await registration.pushManager.getSubscription();
  if (subscription) return subscription;

  // Get VAPID public key
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    console.warn("VAPID public key not configured");
    return null;
  }

  // Convert base64 to Uint8Array
  const padding = "=".repeat((4 - (vapidKey.length % 4)) % 4);
  const base64 = (vapidKey + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const applicationServerKey = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    applicationServerKey[i] = rawData.charCodeAt(i);
  }

  subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  return subscription;
}

export async function saveSubscriptionToServer(
  subscription: PushSubscription
): Promise<void> {
  const keys = subscription.toJSON().keys;
  if (!keys) return;

  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    }),
  });
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
    await subscription.unsubscribe();
  }
}
