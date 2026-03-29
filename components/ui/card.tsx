import { HTMLAttributes } from "react";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-cosmos-border bg-cosmos-card p-4 ${className}`}
      {...props}
    />
  );
}
