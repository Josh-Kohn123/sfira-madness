"use client";

import { reportMissed } from "@/lib/actions/elimination";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function DashboardActions({ inviteCode }: { inviteCode: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="mt-6 rounded-xl border border-stopped/20 bg-cosmos-card p-4 text-center">
        <p className="text-sm mb-3">Are you sure? This can&apos;t be undone.</p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => reportMissed(inviteCode)}
          >
            Yes, I missed 😞
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="mt-6 w-full rounded-xl border border-dashed border-white/15 bg-white/5 py-3.5 text-sm text-cosmos-muted transition-all hover:border-stopped/30 hover:bg-stopped/[0.08] hover:text-stopped"
    >
      I missed a day... 😞
    </button>
  );
}
