"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinInput } from "@/components/pin-input";
import { EmojiPicker } from "@/components/emoji-picker";
import { joinGroup } from "@/lib/actions/groups";

export function JoinForm({ inviteCode }: { inviteCode: string }) {
  const [emoji, setEmoji] = useState<string | null>(null);
  const [pin, setPin] = useState("");

  return (
    <form action={joinGroup} className="mt-4">
      <input type="hidden" name="inviteCode" value={inviteCode} />
      <input type="hidden" name="avatarUrl" value={emoji ?? ""} />
      <input type="hidden" name="pin" value={pin} />

      <EmojiPicker onSelect={setEmoji} />
      <div className="mt-4 space-y-3">
        <Input name="name" label="Your Name" placeholder="How your friends know you" required />
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider text-cosmos-muted">
            Set a 4-digit PIN (your password)
          </label>
          <p className="text-[10px] text-cosmos-muted/60 -mt-1">
            This is your account password — you&apos;ll need it to log back in
          </p>
          <PinInput value={pin} onChange={setPin} />
        </div>
      </div>
      <Button type="submit" className="mt-5" disabled={pin.length !== 4}>
        Join Group 🎉
      </Button>
      <p className="text-center mt-3 text-[11px] text-cosmos-muted/60">
        Emoji is optional — you&apos;ll get a colored initial if you skip it.
      </p>
    </form>
  );
}
