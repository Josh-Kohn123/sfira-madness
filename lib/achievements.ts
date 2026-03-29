import { queryMany } from "./db";

export interface Achievement {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "week-one", emoji: "🔥", name: "Week One", description: "Survived first 7 days" },
  { id: "halfway", emoji: "🌅", name: "Halfway", description: "Still counting on day 25" },
  { id: "lag-baomer", emoji: "🏹", name: "Lag BaOmer", description: "Still counting on day 33" },
  { id: "iron-will", emoji: "👑", name: "Iron Will", description: "Made it all 49 days" },
  { id: "prophet", emoji: "🎯", name: "Prophet", description: "Predicted within 1 day of actual" },
  { id: "mastermind", emoji: "🧠", name: "Mastermind", description: "Lowest total score (winner)" },
  { id: "way-off", emoji: "🫢", name: "Way Off", description: "Missed a prediction by 20+" },
  { id: "underdog", emoji: "💪", name: "Underdog", description: "Outlasted everyone's prediction for you" },
];

export async function getEarnedAchievements(
  memberId: string,
  groupId: string,
  currentDay: number | null
): Promise<string[]> {
  const earned: string[] = [];

  const member = await queryMany<{ eliminated_on_day: number | null }>`
    SELECT eliminated_on_day FROM members WHERE id = ${memberId}
  `;
  const elim = member[0]?.eliminated_on_day;
  const effectiveDay = elim ?? (currentDay ?? 0);

  if (effectiveDay >= 7 && elim === null) earned.push("week-one");
  if (effectiveDay >= 25 && elim === null) earned.push("halfway");
  if (effectiveDay >= 33 && elim === null) earned.push("lag-baomer");
  if (currentDay === null && elim === null) earned.push("iron-will");

  const predictions = await queryMany<{
    predicted_day: number;
    eliminated_on_day: number | null;
  }>`
    SELECT p.predicted_day, sm.eliminated_on_day
    FROM predictions p
    JOIN members sm ON p.subject_id = sm.id
    WHERE p.predictor_id = ${memberId}
      AND sm.eliminated_on_day IS NOT NULL
  `;

  for (const p of predictions) {
    const diff = Math.abs(p.eliminated_on_day! - p.predicted_day);
    if (diff <= 1) earned.push("prophet");
    if (diff >= 20) earned.push("way-off");
  }

  const aboutMe = await queryMany<{ predicted_day: number }>`
    SELECT predicted_day FROM predictions
    WHERE subject_id = ${memberId} AND predictor_id != ${memberId}
  `;
  if (
    aboutMe.length > 0 &&
    elim === null &&
    aboutMe.every((p) => p.predicted_day < (currentDay ?? 49))
  ) {
    earned.push("underdog");
  }

  return [...new Set(earned)];
}
