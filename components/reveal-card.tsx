interface RevealEntry {
  predictorName: string;
  predictedDay: number;
  isYou: boolean;
  isSelf: boolean;
}

interface RevealCardProps {
  subjectName: string;
  eliminatedOnDay: number;
  predictions: RevealEntry[];
  madeItAll?: boolean;
}

export function RevealCard({
  subjectName,
  eliminatedOnDay,
  predictions,
  madeItAll = false,
}: RevealCardProps) {
  return (
    <div className="rounded-2xl border border-cosmos-border bg-cosmos-card p-3.5">
      <div className={`text-sm font-bold mb-2 ${madeItAll ? "text-counting" : "text-stopped"}`}>
        {subjectName} — {madeItAll ? "made it all 49 days! 🎉" : `stopped day ${eliminatedOnDay}`}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {predictions.map((p) => {
          const diff = Math.abs(eliminatedOnDay - p.predictedDay);
          const isClose = diff <= 1;
          const isSelfPenalty = p.isSelf;
          return (
            <div
              key={p.predictorName}
              className={`rounded-lg p-2 text-center ${
                p.isYou ? "bg-gold/[0.08]" : "bg-white/[0.04]"
              }`}
            >
              <div
                className={`text-[10px] uppercase ${
                  p.isYou ? "text-gold" : "text-cosmos-muted"
                }`}
              >
                {p.isYou ? "You" : p.predictorName}
              </div>
              <div className="text-base font-bold">{p.predictedDay}</div>
              <div
                className={`text-[11px] font-semibold ${
                  isClose ? "text-counting" : "text-stopped"
                }`}
              >
                +{diff}
                {isClose && " 🎯"}
                {isSelfPenalty && " 💀"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
