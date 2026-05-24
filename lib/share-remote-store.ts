import type { ShareCardPayload } from "@/lib/export-card-image";

const TTL_SECONDS = 60 * 60 * 24;

function hasUpstash(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/** Persist share payload for short `/s/{id}` links (works across Vercel serverless). */
export async function saveShareRemote(
  id: string,
  payload: ShareCardPayload,
): Promise<boolean> {
  if (!hasUpstash()) return false;

  try {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    await redis.set(`share:${id}`, payload, { ex: TTL_SECONDS });
    return true;
  } catch (err) {
    console.error("[share-remote-store] save failed:", err);
    return false;
  }
}

export async function loadShareRemote(
  id: string,
): Promise<ShareCardPayload | null> {
  if (!hasUpstash()) return null;

  try {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    const data = await redis.get<ShareCardPayload>(`share:${id}`);
    return data ?? null;
  } catch (err) {
    console.error("[share-remote-store] load failed:", err);
    return null;
  }
}

export function isUpstashConfigured(): boolean {
  return hasUpstash();
}
