"use server";

import { getDb } from "@/lib/db";
import { verifyPin, setAuthCookie } from "@/lib/auth";

export async function reclaimAccount(formData: FormData) {
  const memberId = formData.get("memberId") as string;
  const pin = formData.get("pin") as string;

  if (!memberId || !pin) throw new Error("Missing fields");

  const db = getDb();
  const [member] = await db`
    SELECT id, cookie_token, pin_hash, group_id FROM members WHERE id = ${memberId}
  `;

  if (!member) throw new Error("Member not found");

  const valid = await verifyPin(pin, member.pin_hash);
  if (!valid) throw new Error("Incorrect PIN");

  // Generate new cookie token
  const [updated] = await db`
    UPDATE members
    SET cookie_token = encode(gen_random_bytes(32), 'hex')
    WHERE id = ${memberId}
    RETURNING cookie_token
  `;

  await setAuthCookie(updated.cookie_token);
}
