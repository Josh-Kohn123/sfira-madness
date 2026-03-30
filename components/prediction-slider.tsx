"use client";

interface PredictionSliderProps {
  name: string;
  avatarUrl: string | null;
  initial: string;
  value: number;
  onChange: (value: number) => void;
  locked?: boolean;
  isSelf?: boolean;
}

export function PredictionSlider({
  name,
  avatarUrl,
  initial,
  value,
  onChange,
  locked = false,
  isSelf = false,
}: PredictionSliderProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl p-3 ${
        isSelf
          ? "bg-gold/[0.06] border border-gold/[0.12]"
          : "bg-cosmos-card"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border-2 ${
          isSelf ? "border-gold" : "border-cosmos-border"
        }`}
      >
        {avatarUrl ? (
          <div className="w-full h-full bg-gradient-to-br from-counting/20 to-counting/5 flex items-center justify-center text-lg">
            {avatarUrl}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-counting to-counting/60 flex items-center justify-center text-sm font-bold text-cosmos-deep">
            {initial}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold flex items-center gap-1.5">
          {isSelf ? "You" : name}
          {isSelf && (
            <span className="text-[10px] text-cosmos-muted font-normal">
              always 49
            </span>
          )}
        </div>
        {!locked && !isSelf ? (
          <input
            type="range"
            min={1}
            max={49}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full mt-1 accent-gold"
          />
        ) : isSelf ? (
          <div className="text-[11px] text-cosmos-muted mt-0.5">
            Miss a day? You eat the penalty 💀
          </div>
        ) : null}
      </div>

      <div
        className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-center ${
          isSelf
            ? "bg-gold/15 border border-gold/20"
            : "bg-gold/[0.12] border border-gold/20"
        }`}
      >
        <div className={`text-xl font-black ${isSelf ? "text-gold" : "text-gold"}`}>
          {value}
        </div>
        <div className="text-[8px] uppercase text-cosmos-muted">
          {locked || isSelf ? "locked" : "days"}
        </div>
      </div>
    </div>
  );
}
