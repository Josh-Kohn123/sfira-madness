interface InviteCodeProps {
  code: string;
}

export function InviteCode({ code }: InviteCodeProps) {
  return (
    <div className="text-center">
      <div className="text-[11px] text-cosmos-muted uppercase tracking-wider mb-1.5">
        Share this game code to invite friends
      </div>
      <div className="inline-block rounded-xl border border-gold/15 bg-gold/[0.08] px-5 py-3 font-mono text-3xl font-black tracking-widest text-gold">
        {code}
      </div>
    </div>
  );
}
