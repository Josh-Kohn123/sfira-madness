import { getDb } from "@/lib/db";
import { getCurrentMemberForGroup } from "@/lib/auth";
import { getOmerPhase, getCurrentOmerDay } from "@/lib/omer-date";
import { Particles } from "@/components/ui/particles";
import { redirect } from "next/navigation";
import { PredictionForm } from "./prediction-form";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function PredictPage({ params }: Props) {
  const { code } = await params;

  const phase = getOmerPhase();
  // Only block after the Omer is completely over
  if (phase === "post") redirect(`/group/${code}`);

  const db = getDb();
  const [group] = await db`
    SELECT id, invite_code FROM groups WHERE invite_code = ${code}
  `;
  if (!group) redirect("/");

  const member = await getCurrentMemberForGroup(group.id);
  if (!member) redirect(`/join/${code}`);

  const members = await db`
    SELECT id, name, avatar_url FROM members WHERE group_id = ${group.id}
    ORDER BY joined_at ASC
  `;

  // Load existing predictions so user can edit them
  const existingPreds = await db`
    SELECT subject_id, predicted_day FROM predictions
    WHERE predictor_id = ${member.id}
  `;
  const savedPredictions: Record<string, number> = {};
  for (const p of existingPreds) {
    savedPredictions[p.subject_id] = p.predicted_day;
  }

  const currentDay = phase === "during" ? getCurrentOmerDay() : null;

  return (
    <main className="relative min-h-screen pb-10">
      <Particles />
      <div className="relative z-10 mx-auto max-w-md px-4 pt-6">
        <a href={`/group/${code}`} className="text-xs text-cosmos-muted hover:text-gold transition-colors">
          ← Back to group
        </a>
        <h1 className="font-display text-2xl text-gold-gradient text-center mt-2">
          Your Predictions
        </h1>
        <p className="text-xs text-cosmos-muted text-center mt-1 mb-1">
          Guess what day each person will stop counting (1–49).
        </p>
        {currentDay && Object.keys(savedPredictions).length === 0 ? (
          <p className="text-[10px] text-cosmos-muted/60 text-center mb-6">
            Joining late — you can predict for days {currentDay + 1}–49.
            Past-day predictions are locked.
          </p>
        ) : currentDay ? (
          <p className="text-[10px] text-cosmos-muted/60 text-center mb-6">
            Past predictions are locked. You can update future-day predictions.
          </p>
        ) : (
          <p className="text-[10px] text-cosmos-muted/60 text-center mb-6">
            You can change these anytime before the Omer starts.
          </p>
        )}

        <PredictionForm
          members={members.map((m) => ({
            id: m.id,
            name: m.name,
            avatarUrl: m.avatar_url,
            isSelf: m.id === member.id,
          }))}
          inviteCode={code}
          savedPredictions={savedPredictions}
          currentOmerDay={currentDay}
        />
      </div>
    </main>
  );
}
