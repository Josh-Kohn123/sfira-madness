interface LeaderboardEntry {
  memberId: string;
  memberName: string;
  totalScore: number;
  eliminatedOnDay: number | null;
  isYou: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  resolvedCount: number;
  totalMembers: number;
}

export function Leaderboard({
  entries,
  resolvedCount,
  totalMembers,
}: LeaderboardProps) {
  return (
    <div>
      <div className="space-y-1">
        {entries.map((entry, i) => (
          <div
            key={entry.memberId}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all hover:translate-x-1 ${
              i === 0
                ? "bg-gradient-to-r from-gold/[0.12] to-gold-warm/[0.08] border border-gold/20"
                : entry.isYou
                  ? "bg-gold/[0.08] border border-gold/[0.12]"
                  : "bg-white/[0.04]"
            }`}
          >
            <div
              className={`text-xl font-black w-7 text-center ${
                i === 0 ? "text-gold" : "text-cosmos-muted"
              }`}
            >
              {i === 0 ? "👑" : i + 1}
            </div>
            <div
              className={`flex-1 font-semibold text-sm ${
                entry.isYou ? "text-gold" : "text-white"
              }`}
            >
              {entry.isYou ? `You (${entry.memberName})` : entry.memberName}
              {entry.eliminatedOnDay && (
                <span className="text-[10px] text-stopped font-normal ml-1.5">
                  stopped
                </span>
              )}
            </div>
            <div
              className={`text-xl font-black ${
                i === 0 ? "text-gold" : "text-white"
              }`}
            >
              {entry.totalScore}{" "}
              <span className="text-[11px] font-normal text-cosmos-muted">
                pts
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="text-[11px] text-cosmos-muted/50 mt-1.5 italic">
        {resolvedCount} of {totalMembers} resolved
      </div>
    </div>
  );
}
