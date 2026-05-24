import type { ShareCardPayload } from "@/lib/export-card-image";

const TTL_SECONDS = 60 * 60 * 24;
const BLOB_PATH = (id: string) => `share/${id}.json`;
const SHARE_KEY = (id: string) => `share:${id}`;

type UpstashRestCreds = { url: string; token: string };

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

  if (!url || !token || !url.startsWith("https://")) return null;
  return { url, token };
}

function getRedisUrl(): string | null {
  const url = process.env.REDIS_URL?.trim();
  return url && (url.startsWith("redis://") || url.startsWith("rediss://"))
    ? url
    : null;
}

function hasUpstashRest(): boolean {
  return getUpstashRestCredentials() !== null;
}

function hasRedisTcp(): boolean {
  return getRedisUrl() !== null;
}

function hasBlob(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN?.trim();
}

async function saveUpstashRest(
  id: string,
  payload: ShareCardPayload,
): Promise<boolean> {
  const creds = getUpstashRestCredentials();
  if (!creds) return false;
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url: creds.url, token: creds.token });
    await redis.set(SHARE_KEY(id), payload, { ex: TTL_SECONDS });
    return !!(await redis.get<ShareCardPayload>(SHARE_KEY(id)));
  } catch (err) {
    console.error("[share-remote-store] Upstash REST save failed:", err);
    return false;
  }
}

async function loadUpstashRest(id: string): Promise<ShareCardPayload | null> {
  const creds = getUpstashRestCredentials();
  if (!creds) return null;
  try {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({ url: creds.url, token: creds.token });
    return (await redis.get<ShareCardPayload>(SHARE_KEY(id))) ?? null;
  } catch (err) {
    console.error("[share-remote-store] Upstash REST load failed:", err);
    return null;
  }
}

async function saveRedisTcp(
  id: string,
  payload: ShareCardPayload,
): Promise<boolean> {
  const url = getRedisUrl();
  if (!url) return false;
  try {
    const { createClient } = await import("redis");
    const client = createClient({
      url,
      socket: {
        connectTimeout: 10_000,
        reconnectStrategy: false,
      },
    });
    client.on("error", (err) => {
      console.error("[share-remote-store] REDIS_URL client error:", err);
    });
    await client.connect();
    try {
      await client.setEx(SHARE_KEY(id), TTL_SECONDS, JSON.stringify(payload));
      const check = await client.get(SHARE_KEY(id));
      return !!check;
    } finally {
      await client.disconnect();
    }
  } catch (err) {
    console.error("[share-remote-store] REDIS_URL save failed:", err);
    return false;
  }
}

async function loadRedisTcp(id: string): Promise<ShareCardPayload | null> {
  const url = getRedisUrl();
  if (!url) return null;
  try {
    const { createClient } = await import("redis");
    const client = createClient({ url });
    await client.connect();
    try {
      const raw = await client.get(SHARE_KEY(id));
      if (!raw) return null;
      return JSON.parse(raw) as ShareCardPayload;
    } finally {
      await client.disconnect();
    }
  } catch (err) {
    console.error("[share-remote-store] REDIS_URL load failed:", err);
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
    const blobUrl = blobs[0]?.url;
    if (!blobUrl) return null;
    const res = await fetch(blobUrl, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ShareCardPayload;
  } catch (err) {
    console.error("[share-remote-store] Blob load failed:", err);
    return null;
  }
}

export type ShareStorageBackend = "redis" | "blob" | "local" | null;

export async function saveShareRemote(
  id: string,
  payload: ShareCardPayload,
): Promise<ShareStorageBackend> {
  if (await saveUpstashRest(id, payload)) return "redis";
  if (await saveRedisTcp(id, payload)) return "redis";
  if (await saveBlob(id, payload)) return "blob";
  return null;
}

export async function loadShareRemote(
  id: string,
): Promise<ShareCardPayload | null> {
  const fromRest = await loadUpstashRest(id);
  if (fromRest) return fromRest;
  const fromTcp = await loadRedisTcp(id);
  if (fromTcp) return fromTcp;
  return loadBlob(id);
}

export function isRemoteShareConfigured(): boolean {
  return hasUpstashRest() || hasRedisTcp() || hasBlob();
}

export function shareStorageEnvStatus(): {
  redisRest: boolean;
  redisUrl: boolean;
  blob: boolean;
} {
  return {
    redisRest: hasUpstashRest(),
    redisUrl: hasRedisTcp(),
    blob: hasBlob(),
  };
}

export function shareStorageSetupMessage(): string {
  return (
    "Short share links need Redis on Vercel Production. Connect Upstash Redis in Storage " +
    "(UPSTASH_REDIS_REST_URL + TOKEN, or REDIS_URL from the integration), then redeploy."
  );
}

export function shareStorageSaveFailedMessage(): string {
  return (
    "REDIS_URL is set but saving failed. Open /api/share-storage?test=1 on your site to debug, " +
    "or add UPSTASH_REDIS_REST_URL + TOKEN from Vercel Storage → your Redis → .env tab."
  );
}

/** Smoke test for /api/share-storage?test=1 */
export async function testShareStorageWrite(): Promise<{
  ok: boolean;
  backend: ShareStorageBackend;
}> {
  const id = `health${Date.now().toString(36).slice(-8)}`;
  const payload = {
    name: "Health Check",
    persona: "Test",
    skills: ["test"],
  } as import("@/lib/export-card-image").ShareCardPayload;
  const backend = await saveShareRemote(id, payload);
  if (!backend) return { ok: false, backend: null };
  const loaded = await loadShareRemote(id);
  return { ok: !!loaded, backend };
}
