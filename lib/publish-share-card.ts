import type { ShareCardPayload } from "@/lib/export-card-image";
import { shareUrlsFromToken } from "@/lib/share-url";

export interface PublishedShareUrls {
  pageUrl: string;
  pngUrl: string;
  storage?: "redis" | "blob" | "local" | "token";
  storageHint?: string;
}

function publishKey(payload: ShareCardPayload): string {
  return [
    payload.name,
    payload.username ?? "",
    payload.persona,
    payload.personaDescription ?? "",
    (payload.skills ?? []).join(","),
    (payload.techDna ?? []).map((d) => `${d.label}:${d.value}`).join(","),
    (payload.tags ?? []).join(","),
    payload.topMatch
      ? `${payload.topMatch.username}:${payload.topMatch.matchScore}`
      : "",
  ].join("|");
}

const publishInFlight = new Map<string, Promise<PublishedShareUrls>>();

export function publishShareCardImageCached(
  payload: ShareCardPayload,
): Promise<PublishedShareUrls> {
  const key = publishKey(payload);
  const existing = publishInFlight.get(key);
  if (existing) return existing;

  const promise = publishShareCardImage(payload).finally(() => {
    publishInFlight.delete(key);
  });
  publishInFlight.set(key, promise);
  return promise;
}

export async function publishShareCardImage(
  payload: ShareCardPayload,
): Promise<PublishedShareUrls> {
  const res = await fetch("/api/share-card-publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as {
    pageUrl?: string;
    pngUrl?: string;
    imageUrl?: string;
    imageUrlShort?: string;
    storage?: "redis" | "blob" | "local" | "token";
    storageHint?: string;
    error?: string;
  };

  if (!res.ok) {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    if (origin) {
      return {
        ...shareUrlsFromToken(payload, origin),
        storage: "token",
        storageHint: data.error,
      };
    }
    throw new Error(data.error ?? `Publish failed (${res.status})`);
  }

  const pageUrl = data.pageUrl ?? data.imageUrlShort;
  const pngUrl = data.pngUrl ?? data.imageUrl;
  if (!pageUrl || !pngUrl) throw new Error("No share URLs returned");
  return {
    pageUrl,
    pngUrl,
    storage: data.storage,
    storageHint: data.storageHint,
  };
}
