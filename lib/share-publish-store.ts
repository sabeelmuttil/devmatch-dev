import type { ShareCardPayload } from "@/lib/export-card-image";

const TTL_MS = 60 * 60 * 1000;

const store = new Map<string, { payload: ShareCardPayload; expires: number }>();

function prune() {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expires < now) store.delete(id);
  }
}

export function publishShareCardShort(payload: ShareCardPayload): string {
  prune();
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  store.set(id, { payload, expires: Date.now() + TTL_MS });
  return id;
}

export function getShareCardByShortId(id: string): ShareCardPayload | null {
  const entry = store.get(id);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    store.delete(id);
    return null;
  }
  return entry.payload;
}

/** Short ids are 12 hex chars from UUID. */
export function isShortShareId(id: string): boolean {
  return /^[a-f0-9]{12}$/i.test(id);
}
