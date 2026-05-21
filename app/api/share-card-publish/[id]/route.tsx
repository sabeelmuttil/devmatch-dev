import { NextResponse } from "next/server";
import {
  getShareCardByShortId,
  isShortShareId,
} from "@/lib/share-publish-store";
import { decodeShareToken } from "@/lib/share-publish-token";
import { renderShareCardImage } from "@/lib/share-card-og";

export const runtime = "nodejs";

function resolvePayload(id: string) {
  const raw = decodeURIComponent(id).trim();

  if (isShortShareId(raw)) {
    return getShareCardByShortId(raw);
  }

  return decodeShareToken(raw);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const payload = resolvePayload(id);

  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or expired card link" },
      { status: 404 },
    );
  }

  try {
    const response = renderShareCardImage(payload);
    response.headers.set("Cache-Control", "public, max-age=86400, immutable");
    return response;
  } catch (err) {
    console.error("[share-card-publish]", err);
    return NextResponse.json(
      { error: "Failed to render card image" },
      { status: 500 },
    );
  }
}
