"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";
import { getOmerPhase } from "@/lib/omer-date";

export async function submitPredictions(formData: FormData) {
  if (getOmerPhase() !== "pre") {
    throw new Error("Predictions are locked — Omer has started");
  }

  const member = await getCurrentMember();
  if (!member) throw new Error("Not authenticated");

  const db = getDb();

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

  // Delete existing predictions and insert new ones
  await db`DELETE FROM predictions WHERE predictor_id = ${member.id}`;

  for (const p of predictions) {
    await db`
      INSERT INTO predictions (group_id, predictor_id, subject_id, predicted_day)
      VALUES (${member.group_id}, ${member.id}, ${p.subjectId}, ${p.day})
    `;
  }

  // Mark predictions as locked
  await db`
    UPDATE members SET predictions_locked = true WHERE id = ${member.id}
  `;

  redirect(`/group/${formData.get("inviteCode")}`);
}
