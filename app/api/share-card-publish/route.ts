import type { ShareCardPayload } from "@/lib/export-card-image";
import { renderShareCardImage } from "@/lib/share-card-og";
import { publishShareCardShort } from "@/lib/share-publish-store";
import {
  decodeShareToken,
  encodeShareToken,
  isLikelyTruncatedToken,
} from "@/lib/share-publish-token";
import {
  isRemoteShareConfigured,
  saveShareRemote,
  shareStorageEnvStatus,
  shareStorageSaveFailedMessage,
  shareStorageSetupMessage,
} from "@/lib/share-remote-store";
import { shareUrlsForId } from "@/lib/share-url";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function originFromRequest(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    new URL(request.url).origin
  );
}

/** POST — short link when storage exists; otherwise stateless token (always works). */
export async function POST(request: Request) {
  let body: ShareCardPayload;
  try {
    body = (await request.json()) as ShareCardPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const origin = originFromRequest(request);
  const shortId = await publishShareCardShort(body);
  const remoteStorage = await saveShareRemote(shortId, body);
  const useLocalShortId =
    !remoteStorage && process.env.NODE_ENV === "development";

  if (remoteStorage || useLocalShortId) {
    const urls = shareUrlsForId(origin, shortId);
    return NextResponse.json({
      id: shortId,
      storage: remoteStorage ?? "local",
      pngUrl: urls.pngUrl,
      pageUrl: urls.pageUrl,
      imageUrl: urls.pngUrl,
      imageUrlShort: urls.pageUrl,
    });
  }

  const token = encodeShareToken(body, { forPublicUrl: true });
  const urls = shareUrlsForId(origin, token);

  const env = shareStorageEnvStatus();
  return NextResponse.json({
    id: null,
    storage: "token",
    storageEnv: env,
    storageHint: isRemoteShareConfigured()
      ? shareStorageSaveFailedMessage()
      : shareStorageSetupMessage(),
    pngUrl: urls.pngUrl,
    pageUrl: urls.pageUrl,
    imageUrl: urls.pngUrl,
    imageUrlShort: urls.pageUrl,
  });
}

/** GET ?t= — legacy stateless query (kept for old links only). */
export async function GET(request: Request) {
  const origin = originFromRequest(request);
  const token = new URL(request.url).searchParams.get("t");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const decoded = decodeShareToken(token);
  if (!decoded) {
    const hint = isLikelyTruncatedToken(token)
      ? "Card link was cut off (too long). Run a new match and share again."
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
