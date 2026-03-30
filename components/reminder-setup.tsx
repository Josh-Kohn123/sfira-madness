"use client";

import { useState, useEffect } from "react";

interface ReminderSetupProps {
  onToggle: (enabled: boolean) => void;
}

export function ReminderSetup({ onToggle }: ReminderSetupProps) {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported("Notification" in window);
  }, []);

  if (!supported) return null;

  async function toggle() {
    if (enabled) {
      setEnabled(false);
      onToggle(false);
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setEnabled(true);
      onToggle(true);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] uppercase tracking-wider text-cosmos-muted">
        Daily Reminders
      </label>
      <p className="text-[10px] text-cosmos-muted/60 -mt-1">
        Get a notification each evening to count the Omer
      </p>
      <button
        type="button"
        onClick={toggle}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-all ${
          enabled
            ? "bg-gold/10 border border-gold/20 text-gold"
            : "bg-cosmos-card border border-cosmos-border text-cosmos-muted"
        }`}
      >
        {enabled ? "🔔 Reminders on" : "🔕 Enable reminders"}
      </button>
      <p className="text-[10px] text-cosmos-muted/40">
        iPhone users: add this page to your Home Screen for notifications to work
      </p>
    </div>
  );
}
