import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get("filename");
  if (!filename) {
    return NextResponse.json({ error: "Missing filename" }, { status: 400 });
  }

  const blob = await put(`avatars/${Date.now()}-${filename}`, request.body!, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
