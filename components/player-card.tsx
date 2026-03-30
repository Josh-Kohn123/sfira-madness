interface PlayerCardProps {
  name: string;
  avatarUrl: string | null;
  isYou?: boolean;
  isCounting: boolean;
  eliminatedOnDay?: number | null;
  streak?: number;
  yourPrediction?: number;
  yourScore?: number | null;
}

export function PlayerCard({
  name,
  avatarUrl,
  isYou = false,
  isCounting,
  eliminatedOnDay,
  streak,
  yourPrediction,
  yourScore,
}: PlayerCardProps) {
  const initial = name[0].toUpperCase();
  const borderColor = isYou
    ? "border-gold"
    : isCounting
      ? "border-counting"
      : "border-stopped";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl p-3 transition-all hover:translate-x-1 ${
        isYou ? "bg-gold/[0.08] border border-gold/15" : "bg-cosmos-card"
      } ${!isCounting ? "opacity-65" : ""}`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden border-2 ${borderColor} ${
          !isCounting ? "grayscale-[50%]" : ""
        }`}
      >
        {avatarUrl ? (
          <div
            className={`w-full h-full flex items-center justify-center text-xl ${
              isCounting
                ? "bg-gradient-to-br from-counting/20 to-counting/5"
                : "bg-gradient-to-br from-stopped/20 to-stopped/5"
            }`}
          >
            {avatarUrl}
          </div>
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center text-base font-bold ${
              isCounting
                ? "bg-gradient-to-br from-counting to-counting/60 text-cosmos-deep"
                : "bg-gradient-to-br from-stopped to-stopped/60 text-cosmos-deep"
            }`}
          >
            {initial}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-bold text-[15px] flex items-center gap-1.5">
          {isYou ? `You (${name})` : name}
          {isCounting && streak && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-gold-warm/15 px-2 py-0.5 text-[11px] font-semibold text-gold-warm">
              🔥 {streak}
            </span>
          )}
        </div>
        <div
          className={`text-xs ${isCounting ? "text-counting" : "text-stopped"}`}
        >
          {isCounting
            ? isYou
              ? "locked at 49 — let's go!"
              : "on a roll"
            : `stopped on day ${eliminatedOnDay}`}
        </div>
      </div>

      {yourPrediction !== undefined && (
        <div className="text-right flex-shrink-0">
          <div className="text-[10px] uppercase text-cosmos-muted">
            {isCounting ? "Your call" : "You said"}
          </div>
          <div className="text-lg font-bold">{yourPrediction}</div>
          {yourScore !== null && yourScore !== undefined && (
            <div className="text-xs font-semibold text-stopped">
              +{yourScore} pts
            </div>
          )}
        </div>
      )}
    </div>
  );
}
