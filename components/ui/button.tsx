import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gold-gradient text-cosmos-deep font-bold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-gold/25",
  secondary:
    "bg-cosmos-card border border-cosmos-border text-white hover:bg-white/10",
  ghost:
    "bg-transparent border border-cosmos-border text-cosmos-muted hover:bg-white/5 hover:text-white",
  danger:
    "bg-cosmos-card border border-stopped/30 text-stopped hover:bg-stopped/10",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`w-full rounded-xl px-6 py-3.5 text-[15px] font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
