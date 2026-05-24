import type { ShareCardPayload } from "@/lib/export-card-image";

const TTL_SECONDS = 60 * 60 * 24;
const BLOB_PATH = (id: string) => `share/${id}.json`;

type UpstashRestCreds = { url: string; token: string };

/** REST credentials — `REDIS_URL` (TCP) is not supported; use Upstash REST vars from Vercel Storage. */
export function getUpstashRestCredentials(): UpstashRestCreds | null {
  const url = (
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.KV_REST_API_URL ??
    ""
  ).trim();
  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    ""
  ).trim();

  if (!url || !token) return null;
  if (!url.startsWith("https://")) {
    console.warn(
      "[share-remote-store] Redis URL must be HTTPS REST (UPSTASH_REDIS_REST_URL), not TCP REDIS_URL",
    );
    return null;
  }
  return { url, token };
}

function hasUpstash(): boolean {
  return getUpstashRestCredentials() !== null;
}

function hasBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN?.trim();
}

async function saveUpstash(
  id: string,
  payload: ShareCardPayload,
): Promise<boolean> {
  const creds = getUpstashRestCredentials();
  if (!creds) return false;
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url: creds.url, token: creds.token });
    await redis.set(`share:${id}`, payload, { ex: TTL_SECONDS });
    const check = await redis.get<ShareCardPayload>(`share:${id}`);
    return !!check;
  } catch (err) {
    console.error("[share-remote-store] Upstash save failed:", err);
    return false;
  }
}

async function loadUpstash(id: string): Promise<ShareCardPayload | null> {
  const creds = getUpstashRestCredentials();
  if (!creds) return null;
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url: creds.url, token: creds.token });
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

/** Safe for API responses — booleans only, no secrets. */
export function shareStorageEnvStatus(): {
  redis: boolean;
  blob: boolean;
} {
  return { redis: hasUpstash(), blob: hasBlob() };
}

export function shareStorageSetupMessage(): string {
  return (
    "Short share links need Upstash Redis REST on Vercel. Storage → Upstash Redis → " +
    "connect to Production — needs UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN " +
    "(REDIS_URL alone does not work). Then redeploy."
  );
}

export function shareStorageSaveFailedMessage(): string {
  return (
    "Storage env vars are set but saving failed. Check Vercel function logs, " +
    "confirm REST URL starts with https://, then redeploy."
  );
}
