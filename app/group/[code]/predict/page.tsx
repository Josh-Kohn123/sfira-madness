import { getDb } from "@/lib/db";
import { getCurrentMemberForGroup } from "@/lib/auth";
import { getOmerPhase } from "@/lib/omer-date";
import { Particles } from "@/components/ui/particles";
import { redirect } from "next/navigation";
import { PredictionForm } from "./prediction-form";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function PredictPage({ params }: Props) {
  const { code } = await params;

  if (getOmerPhase() !== "pre") redirect(`/group/${code}`);

  const db = getDb();
  const [group] = await db`
    SELECT id, invite_code FROM groups WHERE invite_code = ${code}
  `;
  if (!group) redirect("/");

  const member = await getCurrentMemberForGroup(group.id);
  if (!member) redirect(`/join/${code}`);
  if (member.predictions_locked) redirect(`/group/${code}`);

  const members = await db`
    SELECT id, name, avatar_url FROM members WHERE group_id = ${group.id}
    ORDER BY joined_at ASC
  `;

  return (
    <main className="relative min-h-screen pb-10">
      <Particles />
      <div className="relative z-10 mx-auto max-w-md px-4 pt-6">
        <h1 className="font-display text-2xl bg-gold-gradient bg-clip-text text-transparent animate-shimmer text-center">
          Your Predictions
        </h1>
        <p className="text-xs text-cosmos-muted text-center mt-1 mb-6">
          How far will each person make it?
        </p>

        <PredictionForm
          members={members.map((m: { id: string; name: string; avatar_url: string | null }) => ({
            id: m.id,
            name: m.name,
            avatarUrl: m.avatar_url,
            isSelf: m.id === member.id,
          }))}
          inviteCode={code}
        />
      </div>
    </main>
  );
}
