import type { ShareCardPayload } from "@/lib/export-card-image";
import { encodeShareToken } from "@/lib/share-publish-token";

/** lz tokens are already URL-safe — encoding only makes URLs longer. */
export function sharePathId(id: string): string {
  if (id.startsWith("z.")) return id;
  return encodeURIComponent(id);
}

export function shareUrlsForId(origin: string, id: string) {
  const base = origin.replace(/\/$/, "");
  const path = sharePathId(id);
  return {
    pageUrl: `${base}/s/${path}`,
    pngUrl: `${base}/api/share-card-publish/${path}`,
  };
}

export function shareUrlsFromToken(
  payload: ShareCardPayload,
  origin: string,
) {
  const token = encodeShareToken(payload, { forPublicUrl: true });
  return shareUrlsForId(origin, token);
}
