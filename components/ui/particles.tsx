export function Particles() {
  const items = ["✨", "🌙", "⭐", "✡", "🔥", "✨", "🌾", "⭐"];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {items.map((emoji, i) => (
        <span
          key={i}
          className="absolute text-xl opacity-15 animate-float"
          style={{
            top: `${10 + i * 12}%`,
            left: `${5 + ((i * 23) % 90)}%`,
            animationDelay: `${-i * 3}s`,
            fontSize: `${14 + (i % 4) * 4}px`,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}
