"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getCurrentMember } from "@/lib/auth";
import { getCurrentOmerDay } from "@/lib/omer-date";

export async function reportMissed(groupInviteCode: string) {
  const member = await getCurrentMember();
  if (!member) throw new Error("Not authenticated");
  if (member.eliminated_on_day !== null) throw new Error("Already eliminated");

  const currentDay = getCurrentOmerDay();
  if (!currentDay) throw new Error("Omer is not active");

  // Eliminated on the previous day (they missed counting, so their last successful day is yesterday)
  const eliminatedDay = currentDay - 1;

  const db = getDb();
  await db`
    UPDATE members SET eliminated_on_day = ${Math.max(eliminatedDay, 1)}
    WHERE id = ${member.id}
  `;

  revalidatePath(`/group/${groupInviteCode}`);
}

export async function toggleReaction(
  groupInviteCode: string,
  subjectId: string,
  emoji: string
) {
  const member = await getCurrentMember();
  if (!member) throw new Error("Not authenticated");

  const db = getDb();

  // Check if reaction exists
  const [existing] = await db`
    SELECT id FROM reactions
    WHERE reactor_id = ${member.id}
      AND subject_id = ${subjectId}
      AND emoji = ${emoji}
  `;

  if (existing) {
    await db`DELETE FROM reactions WHERE id = ${existing.id}`;
  } else {
    await db`
      INSERT INTO reactions (group_id, reactor_id, subject_id, emoji)
      VALUES (${member.group_id}, ${member.id}, ${subjectId}, ${emoji})
    `;
  }

  revalidatePath(`/group/${groupInviteCode}`);
}
