import { NextResponse } from "next/server";
import type { ShareCardPayload } from "@/lib/export-card-image";
import { renderShareCardImage } from "@/lib/share-card-og";

export const runtime = "edge";

export async function POST(request: Request) {
  let body: ShareCardPayload;
  try {
    body = (await request.json()) as ShareCardPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    return renderShareCardImage(body);
  } catch (err) {
    console.error("[share-card-image]", err);
    return NextResponse.json(
      { error: "Failed to generate card image" },
      { status: 500 },
    );
  }
}
