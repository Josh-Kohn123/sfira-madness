import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sfira_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { subscription, timezone } = await request.json();
  const db = getDb();

  await db`
    UPDATE members
    SET push_subscription = ${JSON.stringify(subscription)},
        timezone = ${timezone},
        reminders_enabled = true
    WHERE cookie_token = ${token}
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sfira_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const db = getDb();
  await db`
    UPDATE members
    SET reminders_enabled = false, push_subscription = NULL
    WHERE cookie_token = ${token}
  `;

  return NextResponse.json({ ok: true });
}
