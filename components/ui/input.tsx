import { InputHTMLAttributes } from "react";

export function Input({
  label,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[11px] uppercase tracking-wider text-cosmos-muted">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-xl border border-cosmos-border bg-cosmos-card px-3.5 py-3 text-[15px] text-white placeholder:text-cosmos-muted/30 outline-none focus:border-gold/40 focus:bg-white/[0.08] transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
