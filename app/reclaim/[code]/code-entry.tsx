"use client";

import { Particles } from "@/components/ui/particles";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReclaimCodeEntry() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (trimmed) router.push(`/reclaim/${trimmed}`);
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <Particles />
      <div className="relative z-10 w-full max-w-sm text-center">
        <a href="/" className="text-xs text-cosmos-muted hover:text-gold transition-colors float-left">
          &larr; Home
        </a>
        <h1 className="font-display text-2xl text-gold-gradient clear-both mt-2">
          Sign Back In
        </h1>
        <p className="text-xs text-cosmos-muted mt-1 mb-6">
          Enter your group code to find your account
        </p>
        <form onSubmit={handleSubmit}>
          <input
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ABC-D23"
            className="w-full rounded-xl border-2 border-cosmos-border bg-cosmos-card px-4 py-4 text-center text-2xl font-mono font-bold tracking-[0.3em] text-gold placeholder:text-cosmos-muted/30 outline-none focus:border-gold/50"
            maxLength={7}
            autoFocus
          />
          <button
            type="submit"
            className="w-full mt-4 rounded-xl bg-gold-gradient px-6 py-3.5 text-[15px] font-bold text-cosmos-deep"
          >
            Find My Account &rarr;
          </button>
        </form>
      </div>
    </main>
  );
}
