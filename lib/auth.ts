import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { queryOne } from "./db";

const COOKIE_NAME = "sfira_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60;

interface MemberRow {
  id: string;
  group_id: string;
  name: string;
  cookie_token: string;
  avatar_url: string | null;
  is_creator: boolean;
  eliminated_on_day: number | null;
  predictions_locked: boolean;
  reminders_enabled: boolean;
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export async function setAuthCookie(cookieToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, cookieToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function getCurrentMember(): Promise<MemberRow | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return queryOne<MemberRow>`
    SELECT id, group_id, name, cookie_token, avatar_url,
           is_creator, eliminated_on_day, predictions_locked, reminders_enabled
    FROM members
    WHERE cookie_token = ${token}
  `;
}

export async function getCurrentMemberForGroup(
  groupId: string
): Promise<MemberRow | null> {
  const member = await getCurrentMember();
  if (!member || member.group_id !== groupId) return null;
  return member;
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 2) code += "-";
  }
  return code;
}
