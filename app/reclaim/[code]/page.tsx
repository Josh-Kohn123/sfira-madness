import { getDb } from "@/lib/db";
import { Particles } from "@/components/ui/particles";
import { ReclaimForm } from "./reclaim-form";
import Link from "next/link";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function ReclaimPage({ params }: Props) {
  const { code } = await params;
  const db = getDb();

  const [group] = await db`
    SELECT id, name, invite_code FROM groups WHERE invite_code = ${code}
  `;

  if (!group) {
    return (
      <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
        <Particles />
        <div className="relative z-10 text-center">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-xl font-bold">Group not found</h1>
          <p className="text-sm text-cosmos-muted mt-2">
            Check the code and try again
          </p>
          <a href="/join/enter" className="text-gold text-sm mt-4 inline-block">
            Enter a different code →
          </a>
        </div>
      </main>
    );
  }

  const members = await db`
    SELECT id, name, avatar_url FROM members WHERE group_id = ${group.id}
    ORDER BY joined_at ASC
  `;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <Particles />
      <div className="relative z-10 w-full max-w-sm">
        <a href={`/group/${code}`} className="text-xs text-cosmos-muted hover:text-gold transition-colors">
          ← Back to group
        </a>
        <h1 className="font-display text-2xl text-gold-gradient text-center mt-2">
          Welcome Back
        </h1>
        <p className="text-center text-xs text-cosmos-muted mt-1">
          Select your name and enter your PIN to log back in
        </p>

        <div className="mt-4 rounded-2xl border border-counting/20 bg-cosmos-card p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔥</div>
            <div>
              <div className="font-bold">{group.name}</div>
              <div className="text-[11px] text-cosmos-muted">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        <ReclaimForm
          inviteCode={group.invite_code}
          members={members.map((m) => ({
            id: m.id as string,
            name: m.name as string,
            avatarUrl: m.avatar_url as string | null,
          }))}
        />

        <p className="text-center mt-6 text-[11px] text-cosmos-muted/60">
          New here?{" "}
          <Link href={`/join/${code}`} className="text-gold">
            Join as a new member →
          </Link>
        </p>
      </div>
    </main>
  );
}
