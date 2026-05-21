import type { ShareCardPayload } from "@/lib/export-card-image";
import { encodeShareToken } from "@/lib/share-publish-token";

/** Short public PNG URL via server (preferred — survives X link limits). */
export async function publishShareCardImage(
  payload: ShareCardPayload,
): Promise<string> {
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
    imageUrl?: string;
    imageUrlShort?: string;
  };
  // Prefer stateless URL so X / crawlers can load the image after deploy.
  if (data.imageUrl) return data.imageUrl;
  if (data.imageUrlShort) return data.imageUrlShort;
  throw new Error("No image URL returned");
}

/** Fallback: long query token (can break if URL is truncated). */
export function buildPublicShareImageUrl(
  payload: ShareCardPayload,
  origin: string,
): string {
  const token = encodeShareToken(payload);
  return `${origin.replace(/\/$/, "")}/api/share-card-publish?t=${encodeURIComponent(token)}`;
}
