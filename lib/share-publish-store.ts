import type { ShareCardPayload } from "@/lib/export-card-image";
import { loadShareFromTmp, saveShareToTmp } from "@/lib/share-tmp-store";

const TTL_MS = 60 * 60 * 1000;

const store = new Map<string, { payload: ShareCardPayload; expires: number }>();

function prune() {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expires < now) store.delete(id);
  }
}

export async function publishShareCardShort(
  payload: ShareCardPayload,
): Promise<string> {
  prune();
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  const entry = { payload, expires: Date.now() + TTL_MS };
  store.set(id, entry);
  await saveShareToTmp(id, payload);
  return id;
}

export async function getShareCardByShortId(
  id: string,
): Promise<ShareCardPayload | null> {
  const entry = store.get(id);
  if (entry) {
    if (entry.expires < Date.now()) {
      store.delete(id);
    } else {
      return entry.payload;
    }
  }

  return loadShareFromTmp(id);
}

/** Short ids are 10–12 hex chars from UUID (not lz `z.` tokens). */
export function isShortShareId(id: string): boolean {
  return /^[a-f0-9]{10,12}$/i.test(id);
}
