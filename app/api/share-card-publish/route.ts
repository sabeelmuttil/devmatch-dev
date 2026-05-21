import { NextResponse } from "next/server";
import type { ShareCardPayload } from "@/lib/export-card-image";
import { publishShareCardShort } from "@/lib/share-publish-store";
import { encodeShareToken, decodeShareToken } from "@/lib/share-publish-token";
import { renderShareCardImage } from "@/lib/share-card-og";

export const runtime = "nodejs";

function originFromRequest(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    new URL(request.url).origin
  );
}

/** POST — return a stable public image URL for tweets. */
export async function POST(request: Request) {
  let body: ShareCardPayload;
  try {
    body = (await request.json()) as ShareCardPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const origin = originFromRequest(request);
  const token = encodeShareToken(body);
  const imageUrl = `${origin}/api/share-card-publish?t=${encodeURIComponent(token)}`;

  // Short id for faster local renders (same Node process only).
  const shortId = publishShareCardShort(body);
  const imageUrlShort = `${origin}/api/share-card-publish/${shortId}`;

  return NextResponse.json({ id: shortId, imageUrl, imageUrlShort });
}

/** GET ?t= — stateless card image (works across serverless instances). */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const decoded = decodeShareToken(token);
  if (!decoded) {
    return NextResponse.json(
      { error: "Invalid or expired card link" },
      { status: 404 },
    );
  }

  try {
    const response = renderShareCardImage(decoded);
    response.headers.set("Cache-Control", "public, max-age=86400, immutable");
    return response;
  } catch (err) {
    console.error("[share-card-publish] query render:", err);
    return NextResponse.json(
      { error: "Failed to render card image" },
      { status: 500 },
    );
  }
}
