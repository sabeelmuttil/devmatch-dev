import type { ShareCardPayload } from "@/lib/export-card-image";

const TTL_SECONDS = 60 * 60 * 24;
const BLOB_PATH = (id: string) => `share/${id}.json`;

function hasUpstash(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function hasBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function isProductionEnv(): boolean {
  return process.env.NODE_ENV === "production";
}

async function saveUpstash(
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
    console.error("[share-remote-store] Upstash save failed:", err);
    return false;
  }
}

async function loadUpstash(id: string): Promise<ShareCardPayload | null> {
  if (!hasUpstash()) return null;
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = Redis.fromEnv();
    return (await redis.get<ShareCardPayload>(`share:${id}`)) ?? null;
  } catch (err) {
    console.error("[share-remote-store] Upstash load failed:", err);
    return null;
  }
}

async function saveBlob(id: string, payload: ShareCardPayload): Promise<boolean> {
  if (!hasBlob()) return false;
  try {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH(id), JSON.stringify(payload), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return true;
  } catch (err) {
    console.error("[share-remote-store] Blob save failed:", err);
    return false;
  }
}

async function loadBlob(id: string): Promise<ShareCardPayload | null> {
  if (!hasBlob()) return null;
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: BLOB_PATH(id), limit: 1 });
    const url = blobs[0]?.url;
    if (!url) return null;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ShareCardPayload;
  } catch (err) {
    console.error("[share-remote-store] Blob load failed:", err);
    return null;
  }
}

export type ShareStorageBackend = "redis" | "blob" | "local" | null;

/** Persist share payload for short `/s/{id}` links (Vercel serverless). */
export async function saveShareRemote(
  id: string,
  payload: ShareCardPayload,
): Promise<ShareStorageBackend> {
  if (await saveUpstash(id, payload)) return "redis";
  if (await saveBlob(id, payload)) return "blob";
  return null;
}

export async function loadShareRemote(
  id: string,
): Promise<ShareCardPayload | null> {
  const fromRedis = await loadUpstash(id);
  if (fromRedis) return fromRedis;
  return loadBlob(id);
}

export function isRemoteShareConfigured(): boolean {
  return hasUpstash() || hasBlob();
}

export function shareStorageSetupMessage(): string {
  return (
    "Short share links need storage on Vercel. In your project go to Storage → " +
    "add Upstash Redis or Vercel Blob, connect to Production, then redeploy."
  );
}

export function mustUseShortShareLinks(): boolean {
  return isProductionEnv();
}
