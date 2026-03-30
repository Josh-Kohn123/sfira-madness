import Link from "next/link";
import { Particles } from "@/components/ui/particles";
import { Button } from "@/components/ui/button";
import { daysUntilOmer } from "@/lib/omer-date";

export default function Home() {
  const daysLeft = daysUntilOmer();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <Particles />
      <div className="relative z-10 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🔥</div>
        <h1 className="font-display text-3xl text-gold-gradient">
          Sfira Madness
        </h1>
        <p className="mt-3 text-sm text-cosmos-muted leading-relaxed">
          Guess how far your friends will count.
          <br />
          Track the Omer together.
          <br />
          Bragging rights for 49 days.
        </p>

        <div className="mt-6 text-[11px] text-cosmos-muted/70 leading-relaxed space-y-1">
          <p>🎯 Guess what day each friend stops counting</p>
          <p>📊 Closest guesses win — think golf, lowest score takes the crown</p>
        </div>

        <div className="mt-6 space-y-2.5">
          <Link href="/create">
            <Button>🏆 Create a Group</Button>
          </Link>
          <Link href="/join/enter">
            <Button variant="secondary">Join with Code</Button>
          </Link>
          <Link href="/reclaim/enter">
            <Button variant="ghost">🔑 Sign Back In</Button>
          </Link>
        </div>

        {daysLeft > 0 && (
          <div className="mt-8 text-[11px] text-cosmos-muted/40">
            Omer starts in {daysLeft} days
          </div>
        )}
      </div>
    </main>
  );
}
