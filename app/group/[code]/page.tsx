import { getDb } from "@/lib/db";
import { getCurrentMemberForGroup } from "@/lib/auth";
import { getOmerPhase, getCurrentOmerDay, daysUntilOmer } from "@/lib/omer-date";
import { getGroupScores, computeScore } from "@/lib/scoring";
import { getEarnedAchievements, ACHIEVEMENTS } from "@/lib/achievements";
import { Particles } from "@/components/ui/particles";
import { DayCounter } from "@/components/day-counter";
import { PlayerCard } from "@/components/player-card";
import { Leaderboard } from "@/components/leaderboard";
import { RevealCard } from "@/components/reveal-card";
import { InviteCode } from "@/components/invite-code";
import { ShareButton } from "@/components/share-button";
import { AchievementBadge } from "@/components/achievement-badge";
import { DashboardActions } from "./dashboard-actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function GroupDashboard({ params }: Props) {
  const { code } = await params;
  const db = getDb();

  const [group] = await db`
    SELECT id, name, invite_code FROM groups WHERE invite_code = ${code}
  `;
  if (!group) redirect("/");

  const member = await getCurrentMemberForGroup(group.id);
  interface GroupMember {
    id: string;
    name: string;
    avatar_url: string | null;
    eliminated_on_day: number | null;
    predictions_locked: boolean;
    is_creator: boolean;
  }
  const members = (await db`
    SELECT id, name, avatar_url, eliminated_on_day, predictions_locked, is_creator
    FROM members WHERE group_id = ${group.id}
    ORDER BY joined_at ASC
  `) as unknown as GroupMember[];

  const phase = getOmerPhase();
  const currentDay = getCurrentOmerDay();
  const scores = await getGroupScores(group.id);

  // Get current user's predictions
  let myPredictions: Record<string, number> = {};
  if (member) {
    const preds = await db`
      SELECT subject_id, predicted_day FROM predictions
      WHERE predictor_id = ${member.id}
    `;
    myPredictions = Object.fromEntries(
      preds.map((p) => [p.subject_id, p.predicted_day])
    );
  }

  // Get predictions for resolved members only (eliminated, or everyone if post phase)
  const resolvedMembers = phase === "post"
    ? members
    : members.filter((m) => m.eliminated_on_day !== null);
  const reveals: Record<
    string,
    { predictions: { predictorName: string; predictedDay: number; isYou: boolean; isSelf: boolean }[] }
  > = {};

  for (const rm of resolvedMembers) {
    const preds = await db`
      SELECT p.predictor_id, pm.name as predictor_name, p.predicted_day
      FROM predictions p
      JOIN members pm ON p.predictor_id = pm.id
      WHERE p.subject_id = ${rm.id}
      ORDER BY pm.joined_at ASC
    `;
    reveals[rm.id] = {
      predictions: preds.map((p) => ({
        predictorName: p.predictor_name as string,
        predictedDay: p.predicted_day as number,
        isYou: member ? p.predictor_id === member.id : false,
        isSelf: p.predictor_id === rm.id,
      })),
    };
  }
  const eliminatedMembers = members.filter(
    (m) => m.eliminated_on_day !== null
  );

  // Get reactions for eliminated members
  const reactions = await db`
    SELECT subject_id, emoji, COUNT(*)::int as count
    FROM reactions WHERE group_id = ${group.id}
    GROUP BY subject_id, emoji
  `;
  const myReactions = member
    ? await db`
        SELECT subject_id, emoji FROM reactions
        WHERE reactor_id = ${member.id}
      `
    : [];

  // Achievements
  let earnedAchievements: string[] = [];
  if (member) {
    earnedAchievements = await getEarnedAchievements(
      member.id,
      group.id,
      currentDay
    );
  }

  const counting = members.filter((m) => m.eliminated_on_day === null);
  const stopped = members.filter((m) => m.eliminated_on_day !== null);

  return (
    <main className="relative min-h-screen pb-10">
      <Particles />
      <div className="relative z-10 mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <div className="text-center mb-1">
          <h1 className="font-display text-2xl text-gold-gradient">
            Sfira Madness 🔥
          </h1>
          <div className="text-[11px] text-cosmos-muted uppercase tracking-widest mt-0.5">
            {group.name}
          </div>
        </div>

        {/* Phase: During Omer */}
        {phase === "during" && currentDay && (
          <>
            <div className="mt-6">
              <DayCounter day={currentDay} />
            </div>

            {/* Stats bar */}
            <div className="flex justify-center gap-6 mt-5 p-3 rounded-2xl bg-white/5 backdrop-blur">
              <div className="text-center">
                <div className="text-2xl font-black text-counting">{counting.length}</div>
                <div className="text-[10px] text-cosmos-muted uppercase tracking-wider">Still In</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-stopped">{stopped.length}</div>
                <div className="text-[10px] text-cosmos-muted uppercase tracking-wider">Stopped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black">{members.length}</div>
                <div className="text-[10px] text-cosmos-muted uppercase tracking-wider">Players</div>
              </div>
            </div>
          </>
        )}

        {/* Phase: Pre-Omer */}
        {phase === "pre" && (
          <div className="mt-6 text-center">
            <div className="text-4xl mb-2">⏳</div>
            <div className="text-lg font-bold">
              Omer starts in {daysUntilOmer()} days
            </div>
            <div className="text-xs text-cosmos-muted mt-1">
              {members.filter((m) => m.predictions_locked).length} of{" "}
              {members.length} predictions submitted
            </div>
            {member && (
              <Link href={`/group/${code}/predict`}>
                <Button className="mt-4">
                  {member.predictions_locked ? "✏️ Edit My Predictions" : "Make My Predictions →"}
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Phase: Post-Omer */}
        {phase === "post" && (
          <div className="mt-6 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-lg font-bold text-gold">It&apos;s Over!</div>
            <div className="text-xs text-cosmos-muted mt-1">
              49 days complete. Final scores below.
            </div>
          </div>
        )}

        {/* Player list (during/post) */}
        {phase !== "pre" && (
          <>
            {counting.length > 0 && (
              <div className="mt-6">
                <SectionHeader>Still Counting</SectionHeader>
                <div className="space-y-2">
                  {counting.map((m) => (
                    <PlayerCard
                      key={m.id}
                      name={m.name}
                      avatarUrl={m.avatar_url}
                      isYou={member?.id === m.id}
                      isCounting
                      streak={currentDay ?? undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {stopped.length > 0 && (
              <div className="mt-6">
                <SectionHeader>Stopped Counting</SectionHeader>
                <div className="space-y-2">
                  {stopped.map((m) => (
                      <PlayerCard
                        key={m.id}
                        name={m.name}
                        avatarUrl={m.avatar_url}
                        isYou={member?.id === m.id}
                        isCounting={false}
                        eliminatedOnDay={m.eliminated_on_day}
                        yourPrediction={myPredictions[m.id]}
                        yourScore={
                          myPredictions[m.id] !== undefined
                            ? computeScore(myPredictions[m.id], m.eliminated_on_day)
                            : null
                        }
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Reveals — only for resolved players */}
        {resolvedMembers.length > 0 && (
          <div className="mt-6">
            <SectionHeader>Predictions Revealed</SectionHeader>
            <div className="space-y-3">
              {resolvedMembers.map((m) =>
                  reveals[m.id] && (
                    <RevealCard
                      key={m.id}
                      subjectName={m.name}
                      eliminatedOnDay={m.eliminated_on_day ?? 49}
                      predictions={reveals[m.id].predictions}
                      madeItAll={m.eliminated_on_day === null}
                    />
                  )
              )}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {scores.length > 0 && (
          <div className="mt-6">
            <SectionHeader>Leaderboard</SectionHeader>
            <Leaderboard
              entries={scores.map((s) => ({
                ...s,
                isYou: member?.id === s.memberId,
              }))}
              resolvedCount={resolvedMembers.length}
              totalMembers={members.length}
            />
          </div>
        )}

        {/* Achievements */}
        {member && (phase === "during" || phase === "post") && (
          <div className="mt-6">
            <SectionHeader>Achievements</SectionHeader>
            <div className="flex flex-wrap gap-2">
              {ACHIEVEMENTS.map((a) => (
                <AchievementBadge
                  key={a.id}
                  emoji={a.emoji}
                  name={a.name}
                  description={a.description}
                  earned={earnedAchievements.includes(a.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions (client component for self-report + reactions) */}
        {member && phase === "during" && !member.eliminated_on_day && (
          <DashboardActions inviteCode={code} />
        )}

        {/* How to Play */}
        {phase === "pre" && (
          <div className="mt-6">
            <SectionHeader>How to Play</SectionHeader>
            <div className="rounded-2xl bg-cosmos-card border border-cosmos-border p-4 space-y-3 text-sm">
              <div className="flex gap-2.5">
                <span className="text-lg leading-none">1️⃣</span>
                <div>
                  <span className="font-semibold text-gold">Predict</span>
                  <span className="text-cosmos-muted"> — Guess what day each friend will stop counting the Omer (days 1–49). Your prediction about yourself is locked at 49 — we believe in you going all the way and won&apos;t let you bet against yourself!</span>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="text-lg leading-none">2️⃣</span>
                <div>
                  <span className="font-semibold text-gold">Count</span>
                  <span className="text-cosmos-muted"> — Once the Omer begins, count each night. If you miss a day, report it honestly.</span>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="text-lg leading-none">3️⃣</span>
                <div>
                  <span className="font-semibold text-gold">Reveal</span>
                  <span className="text-cosmos-muted"> — When someone reports they missed a day, everyone&apos;s predictions about that person are revealed. Your score = how many days off your guess was. </span>
                  <span className="font-semibold text-white">Think golf — lowest score wins!</span>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="text-lg leading-none">🏆</span>
                <div>
                  <span className="font-semibold text-gold">Win</span>
                  <span className="text-cosmos-muted"> — After 49 days, all remaining predictions are revealed and the most accurate guesser wins. If you stop counting early, you also lose points since your own prediction was 49.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pre-omer: member list + invite */}
        {phase === "pre" && (
          <div className="mt-6">
            <SectionHeader>
              Joined ({members.length})
            </SectionHeader>
            <div className="space-y-1.5">
              {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 rounded-xl bg-cosmos-card p-2.5"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-cosmos-border flex-shrink-0">
                      {m.avatar_url ? (
                        <img
                          src={m.avatar_url}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-counting to-counting/60 flex items-center justify-center text-sm font-bold text-cosmos-deep">
                          {m.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-sm font-semibold">{m.name}</div>
                    {m.is_creator && (
                      <span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-lg">
                        Creator
                      </span>
                    )}
                    {m.predictions_locked && (
                      <span className="text-[11px] text-counting">✓</span>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Invite code + share */}
        <div className="mt-8">
          <InviteCode code={code} />
          <div className="mt-3">
            <ShareButton inviteCode={code} groupName={group.name} />
          </div>
        </div>

        {/* Reclaim prompt if no cookie */}
        {!member && (
          <div className="mt-6 text-center">
            <p className="text-xs text-cosmos-muted">
              Already a member?{" "}
              <Link href={`/join/${code}`} className="text-gold">
                Reclaim your account →
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="text-[11px] text-cosmos-muted uppercase tracking-widest">
        {children}
      </span>
      <span className="flex-1 h-px bg-gradient-to-r from-cosmos-muted/20 to-transparent" />
    </div>
  );
}
