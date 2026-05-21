import type { ShareCardPayload } from "@/lib/export-card-image";
import { renderShareCardImage } from "@/lib/share-card-og";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
  let body: ShareCardPayload;
  try {
    body = (await request.json()) as ShareCardPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    new URL(request.url).origin;

  try {
    return renderShareCardImage(body, origin);
  } catch (err) {
    console.error("[share-card-image]", err);
    return NextResponse.json(
      { error: "Failed to generate card image" },
      { status: 500 },
    );
  }
}
