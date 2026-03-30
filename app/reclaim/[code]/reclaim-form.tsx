"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PinInput } from "@/components/pin-input";
import { reclaimAccount } from "@/lib/actions/reclaim";

interface Member {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export function ReclaimForm({
  inviteCode,
  members,
}: {
  inviteCode: string;
  members: Member[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || pin.length !== 4) return;

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.set("memberId", selectedId);
      formData.set("pin", pin);
      await reclaimAccount(formData);
      router.push(`/group/${inviteCode}`);
    } catch {
      setError("Incorrect PIN. Please try again.");
      setPin("");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <label className="text-[11px] uppercase tracking-wider text-cosmos-muted">
        Who are you?
      </label>
      <div className="mt-1.5 space-y-1.5">
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setSelectedId(m.id);
              setError(null);
            }}
            className={`w-full flex items-center gap-2.5 rounded-xl p-2.5 transition-colors text-left ${
              selectedId === m.id
                ? "bg-gold/10 border border-gold/40"
                : "bg-cosmos-card border border-cosmos-border hover:border-cosmos-muted/40"
            }`}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-cosmos-border flex-shrink-0">
              {m.avatarUrl ? (
                <div className="w-full h-full bg-gradient-to-br from-counting/20 to-counting/5 flex items-center justify-center text-lg">
                  {m.avatarUrl}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-counting to-counting/60 flex items-center justify-center text-sm font-bold text-cosmos-deep">
                  {m.name[0]}
                </div>
              )}
            </div>
            <span className="text-sm font-semibold">{m.name}</span>
            {selectedId === m.id && (
              <span className="ml-auto text-gold text-sm">✓</span>
            )}
          </button>
        ))}
      </div>

      {selectedId && (
        <div className="mt-4 space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider text-cosmos-muted">
            Enter your 4-digit PIN
          </label>
          <PinInput value={pin} onChange={setPin} />
          {error && (
            <p className="text-xs text-stopped mt-1">{error}</p>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="mt-5"
        disabled={!selectedId || pin.length !== 4 || loading}
      >
        {loading ? "Logging in..." : "Log Back In"}
      </Button>
    </form>
  );
}
