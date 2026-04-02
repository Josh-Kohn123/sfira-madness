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
      // During omer: can only predict future days
      if (isDuring && subjectId !== member.id && day <= currentDay) {
        throw new Error(`Day ${day} has already passed (current day: ${currentDay})`);
      }
      predictions.push({ subjectId, day });
    }
  }

  if (predictions.length === 0) throw new Error("No predictions submitted");

  if (isDuring) {
    // During omer: only delete predictions for future days, preserve frozen past-day predictions
    await db`
      DELETE FROM predictions
      WHERE predictor_id = ${member.id}
        AND predicted_day > ${currentDay}
    `;
  } else {
    // Pre-omer: replace all predictions freely
    await db`DELETE FROM predictions WHERE predictor_id = ${member.id}`;
  }

  for (const p of predictions) {
    await db`
      INSERT INTO predictions (group_id, predictor_id, subject_id, predicted_day)
      VALUES (${member.group_id}, ${member.id}, ${p.subjectId}, ${p.day})
      ON CONFLICT (predictor_id, subject_id) DO UPDATE SET predicted_day = ${p.day}
    `;
  }

  // Mark predictions as locked
  await db`
    UPDATE members SET predictions_locked = true WHERE id = ${member.id}
  `;

  redirect(`/group/${formData.get("inviteCode")}`);
}
