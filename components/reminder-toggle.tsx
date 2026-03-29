"use client";

import { useState, useEffect } from "react";

export function ReminderToggle({ enabled: initial }: { enabled: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported("serviceWorker" in navigator && "PushManager" in window);
  }, []);

  if (!supported) return null;

  async function toggle() {
    if (enabled) {
      setEnabled(false);
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

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

      setEnabled(true);
    } catch {
      // Permission denied or error
    }
  }

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-all ${
        enabled
          ? "bg-gold/10 border border-gold/20 text-gold"
          : "bg-cosmos-card border border-cosmos-border text-cosmos-muted"
      }`}
    >
      {enabled ? "🔔 Reminders on" : "🔕 Enable reminders"}
    </button>
  );
}
