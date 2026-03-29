interface AchievementBadgeProps {
  emoji: string;
  name: string;
  description: string;
  earned: boolean;
}

export function AchievementBadge({
  emoji,
  name,
  description,
  earned,
}: AchievementBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border p-3 min-w-[180px] ${
        earned
          ? "border-gold/20 bg-gold/[0.06]"
          : "border-cosmos-border bg-cosmos-card opacity-35 grayscale-[80%]"
      }`}
    >
      <div className="text-2xl flex-shrink-0">{emoji}</div>
      <div>
        <div className="text-[13px] font-bold">{name}</div>
        <div className="text-[11px] text-cosmos-muted">{description}</div>
      </div>
    </div>
  );
}
