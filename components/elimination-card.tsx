"use client";

import { useTransition } from "react";

const EMOJIS = ["😱", "🫡", "💀", "🕯️", "😂"] as const;

interface EliminationCardProps {
  subjectName: string;
  avatarUrl: string | null;
  eliminatedOnDay: number;
  selfPenalty: number;
  reactions: Record<string, number>;
  myReactions: string[];
  onReact: (emoji: string) => Promise<void>;
}

export function EliminationCard({
  subjectName,
  avatarUrl,
  eliminatedOnDay,
  selfPenalty,
  reactions,
  myReactions,
  onReact,
}: EliminationCardProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-stopped/15 bg-cosmos-card p-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-gradient from-stopped/5 to-transparent animate-pulse" />

      <div className="relative z-10">
        <div className="mx-auto w-[72px] h-[72px] rounded-full overflow-hidden border-[3px] border-stopped mb-3">
          {avatarUrl ? (
            <div className="w-full h-full bg-gradient-to-br from-stopped/20 to-stopped/5 flex items-center justify-center text-3xl opacity-60">
              {avatarUrl}
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stopped to-stopped/60 flex items-center justify-center text-2xl font-bold text-cosmos-deep">
              {subjectName[0]}
            </div>
          )}
        </div>

        <div className="text-xl font-black">{subjectName} is out 😞</div>
        <div className="text-sm text-stopped mt-1">
          Lasted {eliminatedOnDay} of 49 days
        </div>

        <div className="inline-block mt-3 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm text-red-300">
          Self-penalty: <strong className="text-red-400 text-lg">+{selfPenalty}</strong> pts
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              disabled={isPending}
              onClick={() => startTransition(() => onReact(emoji))}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110 ${
                myReactions.includes(emoji)
                  ? "bg-gold/15 border border-gold/30 scale-110"
                  : "bg-white/[0.08] border border-cosmos-border"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        {Object.values(reactions).some((v) => v > 0) && (
          <div className="flex justify-center gap-2 mt-1.5">
            {EMOJIS.map((emoji) =>
              reactions[emoji] ? (
                <div key={emoji} className="text-[10px] text-cosmos-muted w-11 text-center">
                  {reactions[emoji]}
                </div>
              ) : (
                <div key={emoji} className="w-11" />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
