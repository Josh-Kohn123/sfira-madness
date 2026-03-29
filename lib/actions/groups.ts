"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { hashPin, setAuthCookie, generateInviteCode } from "@/lib/auth";
import { OMER_START_DATE } from "@/lib/omer-date";

export async function createGroup(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const groupName = (formData.get("groupName") as string)?.trim();
  const pin = formData.get("pin") as string;
  const avatarUrl = (formData.get("avatarUrl") as string) || null;

  if (!name || !groupName || !pin || pin.length !== 4) {
    throw new Error("Missing required fields");
  }

  const db = getDb();
  const inviteCode = generateInviteCode();
  const pinHash = await hashPin(pin);

  const [group] = await db`
    INSERT INTO groups (name, invite_code, omer_start_date)
    VALUES (${groupName}, ${inviteCode}, ${OMER_START_DATE.toISOString().split("T")[0]})
    RETURNING id, invite_code
  `;

  const [member] = await db`
    INSERT INTO members (group_id, name, pin_hash, avatar_url, is_creator)
    VALUES (${group.id}, ${name}, ${pinHash}, ${avatarUrl}, true)
    RETURNING cookie_token
  `;

  await setAuthCookie(member.cookie_token);
  redirect(`/group/${group.invite_code}`);
}

export async function joinGroup(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const pin = formData.get("pin") as string;
  const inviteCode = (formData.get("inviteCode") as string)?.trim();
  const avatarUrl = (formData.get("avatarUrl") as string) || null;

  if (!name || !pin || pin.length !== 4 || !inviteCode) {
    throw new Error("Missing required fields");
  }

  const db = getDb();

  const [group] = await db`
    SELECT id, invite_code FROM groups WHERE invite_code = ${inviteCode}
  `;
  if (!group) throw new Error("Group not found");

  // Check for duplicate name in group
  const [existing] = await db`
    SELECT id FROM members WHERE group_id = ${group.id} AND name = ${name}
  `;
  if (existing) throw new Error("Name already taken in this group");

  const pinHash = await hashPin(pin);

  const [member] = await db`
    INSERT INTO members (group_id, name, pin_hash, avatar_url)
    VALUES (${group.id}, ${name}, ${pinHash}, ${avatarUrl})
    RETURNING cookie_token
  `;

  await setAuthCookie(member.cookie_token);
  redirect(`/group/${group.invite_code}`);
}
