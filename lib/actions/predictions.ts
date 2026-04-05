"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";
import { getOmerPhase, getCurrentOmerDay } from "@/lib/omer-date";

export async function submitPredictions(formData: FormData) {
  const phase = getOmerPhase();
  if (phase === "post") {
    throw new Error("Predictions are locked — Omer is over");
  }

  const member = await getCurrentMember();
  if (!member) throw new Error("Not authenticated");

  const db = getDb();
  const currentDay = getCurrentOmerDay();
  const isDuring = phase === "during" && currentDay !== null;

  // Parse predictions from form: "pred_<memberId>" = day number
  const predictions: { subjectId: string; day: number }[] = [];

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("pred_")) {
      const subjectId = key.replace("pred_", "");
      const day = Number(value);
      if (day < 1 || day > 49) throw new Error(`Invalid day: ${day}`);
      // Self-prediction must be 49
      if (subjectId === member.id && day !== 49) {
        throw new Error("Self-prediction must be 49");
      }
      predictions.push({ subjectId, day });
    }
  }

  if (predictions.length === 0) throw new Error("No predictions submitted");

  if (isDuring) {
    // During omer: existing predictions are frozen, only insert for new members
    const existingPreds = await db`
      SELECT subject_id FROM predictions WHERE predictor_id = ${member.id}
    `;
    const alreadyPredicted = new Set(existingPreds.map((r) => r.subject_id as string));

    for (const p of predictions) {
      if (!alreadyPredicted.has(p.subjectId)) {
        // Only validate day range for new predictions that will actually be inserted
        if (p.subjectId !== member.id && currentDay !== null && p.day <= currentDay) {
          throw new Error(`Day ${p.day} has already passed (current day: ${currentDay})`);
        }
        await db`
          INSERT INTO predictions (group_id, predictor_id, subject_id, predicted_day)
          VALUES (${member.group_id}, ${member.id}, ${p.subjectId}, ${p.day})
        `;
      }
    }
  } else {
    // Pre-omer: replace all predictions freely
    await db`DELETE FROM predictions WHERE predictor_id = ${member.id}`;

    for (const p of predictions) {
      await db`
        INSERT INTO predictions (group_id, predictor_id, subject_id, predicted_day)
        VALUES (${member.group_id}, ${member.id}, ${p.subjectId}, ${p.day})
        ON CONFLICT (predictor_id, subject_id) DO UPDATE SET predicted_day = ${p.day}
      `;
    }
  }

  // Mark predictions as locked
  await db`
    UPDATE members SET predictions_locked = true WHERE id = ${member.id}
  `;

  redirect(`/group/${formData.get("inviteCode")}`);
}
