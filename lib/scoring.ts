import { queryMany } from "./db";
import { getOmerPhase } from "./omer-date";

interface PredictionRow {
  predictor_id: string;
  predictor_name: string;
  subject_id: string;
  subject_name: string;
  predicted_day: number;
  eliminated_on_day: number | null;
}

export async function getGroupScores(groupId: string) {
  const phase = getOmerPhase();

  const predictions = await queryMany<PredictionRow>`
    SELECT
      p.predictor_id,
      pm.name as predictor_name,
      p.subject_id,
      sm.name as subject_name,
      p.predicted_day,
      sm.eliminated_on_day
    FROM predictions p
    JOIN members pm ON p.predictor_id = pm.id
    JOIN members sm ON p.subject_id = sm.id
    WHERE p.group_id = ${groupId}
  `;

  const members = await queryMany<{
    id: string;
    name: string;
    eliminated_on_day: number | null;
  }>`SELECT id, name, eliminated_on_day FROM members WHERE group_id = ${groupId}`;

  const byPredictor = new Map<
    string,
    { name: string; scores: number[]; eliminatedOnDay: number | null }
  >();

  for (const m of members) {
    byPredictor.set(m.id, {
      name: m.name,
      scores: [],
      eliminatedOnDay: m.eliminated_on_day,
    });
  }

  for (const p of predictions) {
    // Only score predictions for subjects who have been eliminated,
    // or for all subjects once the game is over (post phase).
    const isResolved = p.eliminated_on_day !== null || phase === "post";
    if (!isResolved) continue;

    const actual = p.eliminated_on_day ?? 49;
    const score = Math.abs(actual - p.predicted_day);
    const entry = byPredictor.get(p.predictor_id);
    if (entry) entry.scores.push(score);
  }

  return Array.from(byPredictor.entries())
    .map(([id, data]) => ({
      memberId: id,
      memberName: data.name,
      totalScore: data.scores.reduce((a, b) => a + b, 0),
      resolvedCount: data.scores.length,
      eliminatedOnDay: data.eliminatedOnDay,
    }))
    .sort((a, b) => a.totalScore - b.totalScore);
}

export function computeScore(
  predictedDay: number,
  eliminatedOnDay: number | null
): number {
  const actual = eliminatedOnDay ?? 49;
  return Math.abs(actual - predictedDay);
}
