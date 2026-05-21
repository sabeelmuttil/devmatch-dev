import type { ShareCardPayload } from "@/lib/export-card-image";
import { renderShareCardImage } from "@/lib/share-card-og";
import { publishShareCardShort } from "@/lib/share-publish-store";
import {
  decodeShareToken,
  encodeShareToken,
  isLikelyTruncatedToken,
} from "@/lib/share-publish-token";
import { NextResponse } from "next/server";

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
  const token = encodeShareToken(body, { forPublicUrl: true });
  const shortId = await publishShareCardShort(body);

  const pngUrl = (id: string) =>
    `${origin}/api/share-card-publish/${encodeURIComponent(id)}`;
  const pageUrl = (id: string) => `${origin}/s/${encodeURIComponent(id)}`;

  return NextResponse.json({
    id: shortId,
    pngUrl: pngUrl(shortId),
    pageUrl: pageUrl(shortId),
    imageUrl: pngUrl(shortId),
    imageUrlShort: pageUrl(shortId),
  });
}

/** GET ?t= — stateless card image (works across serverless instances). */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const decoded = decodeShareToken(token);
  if (!decoded) {
    const hint = isLikelyTruncatedToken(token)
      ? "Card link was cut off (too long). Open dailydevmatch.dev, run your match again, and use Share on X for a fresh link."
      : "Invalid card link.";
    return NextResponse.json({ error: hint }, { status: 404 });
  }

  try {
    const response = renderShareCardImage(decoded, origin);
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
