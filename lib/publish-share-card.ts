import type { ShareCardPayload } from "@/lib/export-card-image";
import { encodeShareToken } from "@/lib/share-publish-token";

export interface PublishedShareUrls {
  /** Human-friendly page — card fills the viewport. */
  pageUrl: string;
  /** Direct PNG for X / crawlers. */
  pngUrl: string;
}

/** Publish card and return short page + PNG URLs. */
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
  };

  const pageUrl = data.pageUrl ?? data.imageUrlShort;
  const pngUrl = data.pngUrl ?? data.imageUrl;
  if (!pageUrl || !pngUrl) throw new Error("No share URLs returned");
  return { pageUrl, pngUrl };
}

function sharePaths(origin: string, id: string) {
  const base = origin.replace(/\/$/, "");
  const encoded = encodeURIComponent(id);
  return {
    pageUrl: `${base}/s/${encoded}`,
    pngUrl: `${base}/api/share-card-publish/${encoded}`,
  };
}

/** Fallback when POST publish fails — stateless compressed token. */
export function buildPublicShareUrls(
  payload: ShareCardPayload,
  origin: string,
): PublishedShareUrls {
  const token = encodeShareToken(payload, { forPublicUrl: true });
  return sharePaths(origin, token);
}
