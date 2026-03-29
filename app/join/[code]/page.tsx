import { getDb } from "@/lib/db";
import { Particles } from "@/components/ui/particles";
import { JoinForm } from "./join-form";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params;

  // If code is "enter", show code entry form
  if (code === "enter") {
    return <CodeEntryPage />;
  }

  // Look up group
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
        <h1 className="font-display text-2xl bg-gold-gradient bg-clip-text text-transparent animate-shimmer text-center">
          Join Group
        </h1>

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
          <div className="flex mt-3 -space-x-1.5">
            {members.slice(0, 5).map((m: { id: string; name: string; avatar_url: string | null }) => (
              <div
                key={m.id}
                className="w-8 h-8 rounded-full border-2 border-cosmos-deep overflow-hidden"
              >
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-counting to-counting/60 flex items-center justify-center text-xs font-bold text-cosmos-deep">
                    {m.name[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-[11px] text-cosmos-muted mt-2">
            {members.map((m: { name: string }) => m.name).join(", ")}
          </div>
        </div>

        <JoinForm inviteCode={group.invite_code} />
      </div>
    </main>
  );
}

function CodeEntryPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <Particles />
      <div className="relative z-10 w-full max-w-sm text-center">
        <h1 className="font-display text-2xl bg-gold-gradient bg-clip-text text-transparent animate-shimmer">
          Join a Group
        </h1>
        <p className="text-xs text-cosmos-muted mt-1 mb-6">
          Enter the code your friend shared
        </p>
        <form
          action={(fd) => {
            const code = (fd.get("code") as string)?.trim().toUpperCase();
            if (code) window.location.href = `/join/${code}`;
          }}
        >
          <input
            name="code"
            placeholder="ABC-D23"
            className="w-full rounded-xl border-2 border-cosmos-border bg-cosmos-card px-4 py-4 text-center text-2xl font-mono font-bold tracking-[0.3em] text-gold placeholder:text-cosmos-muted/30 outline-none focus:border-gold/50"
            maxLength={7}
            autoFocus
          />
          <button
            type="submit"
            className="w-full mt-4 rounded-xl bg-gold-gradient px-6 py-3.5 text-[15px] font-bold text-cosmos-deep"
          >
            Find Group →
          </button>
        </form>
      </div>
    </main>
  );
}
