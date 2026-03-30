"use client";

import { useEffect } from "react";

export function PushSubscriber({ remindersEnabled }: { remindersEnabled: boolean }) {
  useEffect(() => {
    if (!remindersEnabled) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "granted") return;

    (async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const existing = await registration.pushManager.getSubscription();
        if (existing) return; // Already subscribed

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        });
      } catch {
        // Subscription failed — silent
      }
    })();
  }, [remindersEnabled]);

  return null;
}
