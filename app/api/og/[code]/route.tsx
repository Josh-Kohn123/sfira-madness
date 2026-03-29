import { ImageResponse } from "@vercel/og";
import { getDb } from "@/lib/db";
import { getCurrentOmerDay } from "@/lib/omer-date";
import { getDaySefirot } from "@/lib/sefirot";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const db = getDb();

  const [group] = await db`
    SELECT id, name FROM groups WHERE invite_code = ${code}
  `;
  if (!group) return new Response("Not found", { status: 404 });

  const members = await db`
    SELECT eliminated_on_day FROM members WHERE group_id = ${group.id}
  `;
  const counting = members.filter(
    (m: { eliminated_on_day: number | null }) => m.eliminated_on_day === null
  ).length;
  const currentDay = getCurrentOmerDay();
  const sefirot = currentDay ? getDaySefirot(currentDay) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1040, #2d1b69, #1a1040)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 24, color: "#f6d365", marginBottom: 16 }}>
          Sfira Madness 🔥
        </div>
        {currentDay && (
          <>
            <div style={{ fontSize: 14, color: "#9b8ec4", textTransform: "uppercase" as const }}>
              Day
            </div>
            <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1 }}>
              {currentDay}
            </div>
            {sefirot && (
              <div style={{ fontSize: 20, color: "#f6d365", marginTop: 8 }}>
                {sefirot.hebrew}
              </div>
            )}
          </>
        )}
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 24,
          }}
        >
          <div style={{ textAlign: "center" as const }}>
            <div style={{ fontSize: 36, fontWeight: 900 }}>{counting}</div>
            <div style={{ fontSize: 12, color: "#9b8ec4" }}>Still In</div>
          </div>
          <div style={{ textAlign: "center" as const }}>
            <div style={{ fontSize: 36, fontWeight: 900 }}>
              {members.length}
            </div>
            <div style={{ fontSize: 12, color: "#9b8ec4" }}>Players</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#9b8ec466", marginTop: 24 }}>
          sfira-madness.vercel.app
        </div>
      </div>
    ),
    { width: 600, height: 400 }
  );
}
