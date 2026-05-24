import type { ShareCardPayload } from "@/lib/export-card-image";
import { shareUrlsFromToken } from "@/lib/share-url";

export interface PublishedShareUrls {
  /** Human-friendly page — card fills the viewport. */
  pageUrl: string;
  /** Direct PNG for X / crawlers. */
  pngUrl: string;
  /** `redis` / `local` = short link; `token` = long stateless link. */
  storage?: "redis" | "local" | "token";
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

/** Dedupes concurrent publishes (e.g. React Strict Mode double mount). */
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

/** Publish card and return short page + PNG URLs when Redis is configured. */
export async function publishShareCardImage(
  payload: ShareCardPayload,
): Promise<PublishedShareUrls> {
  const res = await fetch("/api/share-card-publish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `Publish failed (${res.status})`);
  }

  const data = (await res.json()) as {
    pageUrl?: string;
    pngUrl?: string;
    imageUrl?: string;
    imageUrlShort?: string;
    storage?: "redis" | "local" | "token";
  };

  const pageUrl = data.pageUrl ?? data.imageUrlShort;
  const pngUrl = data.pngUrl ?? data.imageUrl;
  if (!pageUrl || !pngUrl) throw new Error("No share URLs returned");
  return { pageUrl, pngUrl, storage: data.storage };
}

/** Fallback when POST publish fails — stateless compressed token (long URL). */
export function buildPublicShareUrls(
  payload: ShareCardPayload,
  origin: string,
): PublishedShareUrls {
  return { ...shareUrlsFromToken(payload, origin), storage: "token" };
}
