import {
  renderShareCardImage,
  renderTwitterPreviewImage,
} from "@/lib/share-card-og";
import {
  getShareCardByShortId,
  isShortShareId,
} from "@/lib/share-publish-store";
import { decodeShareToken } from "@/lib/share-publish-token";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function originFromRequest(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    new URL(request.url).origin
  );
}

async function resolvePayload(id: string) {
  const raw = decodeURIComponent(id).trim();

  if (isShortShareId(raw)) {
    return getShareCardByShortId(raw);
  }

  return decodeShareToken(raw);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const origin = originFromRequest(request);
  const social = new URL(request.url).searchParams.get("social") === "1";
  const payload = await resolvePayload(id);

  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or expired card link" },
      { status: 404 },
    );
  }

  try {
    const response = social
      ? renderTwitterPreviewImage(payload, origin)
      : renderShareCardImage(payload, origin);
    response.headers.set("Cache-Control", "public, max-age=86400, immutable");
    response.headers.set("Content-Type", "image/png");
    return response;
  } catch (err) {
    console.error("[share-card-publish]", err);
    return NextResponse.json(
      { error: "Failed to render card image" },
      { status: 500 },
    );
  }
}
