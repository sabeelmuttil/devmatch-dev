import type { ShareCardPayload } from "@/lib/export-card-image";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

const DIR = join("/tmp", "devmatch-shares");

export async function saveShareToTmp(
  id: string,
  payload: ShareCardPayload,
): Promise<void> {
  try {
    await mkdir(DIR, { recursive: true });
    await writeFile(join(DIR, `${id}.json`), JSON.stringify(payload), "utf8");
  } catch {
    /* /tmp may be unavailable locally in some setups */
  }
}

export async function loadShareFromTmp(
  id: string,
): Promise<ShareCardPayload | null> {
  try {
    const raw = await readFile(join(DIR, `${id}.json`), "utf8");
    return JSON.parse(raw) as ShareCardPayload;
  } catch {
    return null;
  }
}
