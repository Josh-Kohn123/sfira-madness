"use client";

import { useState } from "react";
import { Particles } from "@/components/ui/particles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinInput } from "@/components/pin-input";
import { EmojiPicker } from "@/components/emoji-picker";
import { ReminderSetup } from "@/components/reminder-setup";
import { createGroup } from "@/lib/actions/groups";

export default function CreatePage() {
  const [emoji, setEmoji] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [reminders, setReminders] = useState(false);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <Particles />
      <div className="relative z-10 w-full max-w-sm">
        <a href="/" className="text-xs text-cosmos-muted hover:text-gold transition-colors">
          ← Home
        </a>
        <h1 className="font-display text-2xl text-gold-gradient text-center mt-2">
          Sfira Madness 🔥
        </h1>
        <p className="text-xs text-cosmos-muted text-center mt-1 mb-6">
          Set up your group
        </p>

        <form action={createGroup}>
          <EmojiPicker onSelect={setEmoji} />
          <p className="text-[10px] text-cosmos-muted/60 text-center mt-1">
            Tap to pick an emoji avatar (optional)
          </p>
          <input type="hidden" name="avatarUrl" value={emoji ?? ""} />

          <div className="mt-4 space-y-3">
            <Input name="name" label="Your Name" placeholder="How your friends know you" required />
            <Input name="groupName" label="Group Name" placeholder='e.g. "The Shul Boys"' required />

            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-cosmos-muted">
                Set a 4-digit PIN (your password)
              </label>
              <p className="text-[10px] text-cosmos-muted/60 -mt-1">
                This is your account password — you&apos;ll need it to log back in on a new device
              </p>
              <PinInput value={pin} onChange={setPin} />
              <input type="hidden" name="pin" value={pin} />
            </div>

            <ReminderSetup onToggle={setReminders} />
            <input type="hidden" name="reminders" value={String(reminders)} />
          </div>

          <Button type="submit" className="mt-6" disabled={pin.length !== 4}>
            Create Group 🎉
          </Button>

          <p className="text-center mt-4 text-xs text-cosmos-muted">
            Already have a code?{" "}
            <a href="/join/enter" className="text-gold">
              Join instead
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
