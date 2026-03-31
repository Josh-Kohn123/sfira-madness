"use client";

import { reportMissed } from "@/lib/actions/elimination";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DashboardActionsProps {
  inviteCode: string;
  currentDay: number;
}

export function DashboardActions({ inviteCode, currentDay }: DashboardActionsProps) {
  const [step, setStep] = useState<"idle" | "picking" | "confirming">("idle");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  if (step === "picking") {
    // Show day picker: "What was the last day you successfully counted?"
    const maxDay = currentDay - 1; // They can't have counted today yet if reporting missed
    return (
      <div className="mt-6 rounded-xl border border-stopped/20 bg-cosmos-card p-4">
        <p className="text-sm text-center mb-3">
          What was the last day you <span className="font-semibold text-white">successfully</span> counted?
        </p>
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {Array.from({ length: Math.max(maxDay, 1) }, (_, i) => i + 1).map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                selectedDay === d
                  ? "bg-stopped text-cosmos-deep"
                  : "bg-white/5 text-cosmos-muted hover:bg-white/10 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => setSelectedDay(0)}
            className={`rounded-lg py-1.5 text-[10px] font-semibold transition-colors col-span-2 ${
              selectedDay === 0
                ? "bg-stopped text-cosmos-deep"
                : "bg-white/5 text-cosmos-muted hover:bg-white/10 hover:text-white"
            }`}
          >
            Never started
          </button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => { setStep("idle"); setSelectedDay(null); }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={selectedDay === null}
            onClick={() => setStep("confirming")}
          >
            Next →
          </Button>
        </div>
      </div>
    );
  }

  if (step === "confirming") {
    const label = selectedDay === 0 ? "never started counting" : `last counted day ${selectedDay}`;
    return (
      <div className="mt-6 rounded-xl border border-stopped/20 bg-cosmos-card p-4 text-center">
        <p className="text-sm mb-1">Are you sure? This can&apos;t be undone.</p>
        <p className="text-xs text-cosmos-muted mb-3">
          You {label}.
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => { setStep("idle"); setSelectedDay(null); }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => reportMissed(inviteCode, Math.max(selectedDay ?? 0, 1))}
          >
            Yes, I missed 😞
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep("picking")}
      className="mt-6 w-full rounded-xl border border-dashed border-white/15 bg-white/5 py-3.5 text-sm text-cosmos-muted transition-all hover:border-stopped/30 hover:bg-stopped/[0.08] hover:text-stopped"
    >
      I missed a day... 😞
    </button>
  );
}
