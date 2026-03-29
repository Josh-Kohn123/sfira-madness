import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { getDb } from "@/lib/db";
import { getCurrentOmerDay } from "@/lib/omer-date";
import { getDaySefirot } from "@/lib/sefirot";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
  }
  webpush.setVapidDetails(
    "mailto:sfira-madness@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const currentDay = getCurrentOmerDay();
  if (!currentDay) {
    return NextResponse.json({ message: "Omer not active" });
  }

  const sefirot = getDaySefirot(currentDay);
  const db = getDb();

  // Find members who should get a reminder now (8:30pm in their timezone)
  // We check where the current UTC time = 20:30 in their timezone
  const members = await db`
    SELECT id, push_subscription, timezone FROM members
    WHERE reminders_enabled = true
      AND eliminated_on_day IS NULL
      AND push_subscription IS NOT NULL
      AND timezone IS NOT NULL
      AND EXTRACT(HOUR FROM now() AT TIME ZONE timezone) = 20
      AND EXTRACT(MINUTE FROM now() AT TIME ZONE timezone) BETWEEN 15 AND 44
  `;

  let sent = 0;
  for (const m of members) {
    try {
      await webpush.sendNotification(
        m.push_subscription as webpush.PushSubscription,
        JSON.stringify({
          title: `Sfira Madness 🔥 Day ${currentDay}`,
          body: `Don't forget to count! ${sefirot.hebrew} · ${sefirot.english}`,
        })
      );
      sent++;
    } catch {
      // Subscription expired — disable
      await db`
        UPDATE members SET reminders_enabled = false, push_subscription = NULL
        WHERE id = ${m.id}
      `;
    }
  }

  return NextResponse.json({ sent, total: members.length });
}
