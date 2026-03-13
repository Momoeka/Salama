"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  requestNotificationPermission,
  subscribeToPush,
  saveSubscriptionToServer,
} from "@/lib/push-notifications";

export function NotificationPrompt() {
  const { isSignedIn, isLoaded } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (!("Notification" in window) || !("PushManager" in window)) return;
    if (Notification.permission !== "default") return;

    // Only show once per session
    const dismissed = sessionStorage.getItem("salama-push-dismissed");
    if (dismissed) return;

    // Show after 5 seconds
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn]);

  async function handleEnable() {
    setShow(false);
    sessionStorage.setItem("salama-push-dismissed", "1");

    const granted = await requestNotificationPermission();
    if (!granted) return;

    const subscription = await subscribeToPush();
    if (subscription) {
      await saveSubscriptionToServer(subscription);
    }
  }

  function handleDismiss() {
    setShow(false);
    sessionStorage.setItem("salama-push-dismissed", "1");
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 rounded-2xl border border-border bg-card p-4 shadow-xl sm:bottom-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Enable notifications?
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Get notified about likes, comments, and messages
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleEnable}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-lg px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
