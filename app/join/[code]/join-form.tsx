"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinInput } from "@/components/pin-input";
import { AvatarUpload } from "@/components/avatar-upload";
import { joinGroup } from "@/lib/actions/groups";

export function JoinForm({ inviteCode }: { inviteCode: string }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pin, setPin] = useState("");

  return (
    <form action={joinGroup} className="mt-4">
      <input type="hidden" name="inviteCode" value={inviteCode} />
      <input type="hidden" name="avatarUrl" value={avatarUrl ?? ""} />
      <input type="hidden" name="pin" value={pin} />

      <AvatarUpload onUploaded={setAvatarUrl} />
      <div className="mt-4 space-y-3">
        <Input name="name" label="Your Name" placeholder="How your friends know you" required />
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider text-cosmos-muted">
            Set a 4-digit PIN
          </label>
          <PinInput value={pin} onChange={setPin} />
        </div>
      </div>
      <Button type="submit" className="mt-5" disabled={pin.length !== 4}>
        Join Group 🎉
      </Button>
      <p className="text-center mt-3 text-[11px] text-cosmos-muted/60">
        📸 Photo is optional — you&apos;ll get a colored initial if you skip it.
      </p>
    </form>
  );
}
