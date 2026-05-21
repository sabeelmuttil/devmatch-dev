import type { ShareCardPayload } from "@/lib/export-card-image";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

/** Compact JSON for URL token — keep encoded length small so X/tweets do not truncate. */
interface CompactCard {
  n: string;
  u?: string;
  p: string;
  d?: string;
  s?: string[];
  /** Legacy object form or dense [label, value][] tuples for public URLs. */
  t?: { label: string; value: number }[] | [string, number][];
  g?: string[];
  /** Legacy object form or dense [name, user, score, reason] tuple. */
  m?:
    | { n: string; u: string; s: number; r: string }
    | [string, string, number, string];
}

/** Full card in share links — truncated only where needed for URL size. */
function toCompact(payload: ShareCardPayload, forPublicUrl: boolean): CompactCard {
  const compact: CompactCard = {
    n: payload.name.slice(0, forPublicUrl ? 32 : 40),
    p: payload.persona.slice(0, forPublicUrl ? 48 : 48),
  };

  if (payload.username) {
    compact.u = payload.username.slice(0, forPublicUrl ? 24 : 24);
  }

  const desc = payload.personaDescription?.trim();
  if (desc && !forPublicUrl) compact.d = desc.slice(0, 60);
  if (desc && forPublicUrl) compact.d = desc.slice(0, 72);

  const skills = (payload.skills ?? [])
    .filter(Boolean)
    .slice(0, 3)
    .map((s) => s.slice(0, forPublicUrl ? 22 : 999));
  if (skills.length) compact.s = skills;

  const dna = (payload.techDna ?? [])
    .filter((d) => d?.label)
    .slice(0, forPublicUrl ? 6 : 4)
    .map((d) => [
      d.label.slice(0, forPublicUrl ? 14 : 32),
      Math.round(Math.min(100, Math.max(0, d.value))),
    ] as [string, number]);
  if (dna.length) compact.t = forPublicUrl ? dna : dna.map(([label, value]) => ({ label, value }));

  const tags = (payload.tags ?? [])
    .filter(Boolean)
    .slice(0, forPublicUrl ? 6 : 4)
    .map((t) => (forPublicUrl ? t.replace(/^#/, "").slice(0, 16) : t));
  if (tags.length) compact.g = tags;

  if (payload.topMatch) {
    if (forPublicUrl) {
      compact.m = [
        payload.topMatch.name.slice(0, 22),
        payload.topMatch.username.slice(0, 20),
        payload.topMatch.matchScore,
        payload.topMatch.matchReason.slice(0, 60),
      ];
    } else {
      compact.m = {
        n: payload.topMatch.name.slice(0, 24),
        u: payload.topMatch.username.slice(0, 20),
        s: payload.topMatch.matchScore,
        r: payload.topMatch.matchReason.slice(0, 50),
      };
    }
  }

  return compact;
}

function parseDna(
  t: CompactCard["t"],
): { label: string; value: number }[] | undefined {
  if (!t?.length) return undefined;
  const first = t[0];
  if (Array.isArray(first)) {
    return (t as [string, number][]).map(([label, value]) => ({
      label: String(label),
      value: Number(value),
    }));
  }
  return t as { label: string; value: number }[];
}

function parseTopMatch(
  m: CompactCard["m"],
): ShareCardPayload["topMatch"] | undefined {
  if (!m) return undefined;
  if (Array.isArray(m)) {
    const [n, u, s, r] = m;
    return {
      name: String(n),
      username: String(u),
      matchScore: Number(s),
      matchReason: String(r ?? ""),
    };
  }
  return {
    name: m.n,
    username: m.u,
    matchScore: m.s,
    matchReason: m.r,
  };
}

function fromCompact(c: CompactCard): ShareCardPayload {
  return {
    name: c.n,
    username: c.u,
    avatar: null,
    persona: c.p,
    personaDescription: c.d,
    skills: c.s ?? [],
    techDna: parseDna(c.t),
    tags: c.g,
    topMatch: parseTopMatch(c.m),
  };
}

function utf8ToBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlToUtf8(token: string): string {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/");
  const pad =
    padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

const LZ_PREFIX = "z.";

export function encodeShareToken(
  payload: ShareCardPayload,
  options?: { forPublicUrl?: boolean },
): string {
  const forPublicUrl = options?.forPublicUrl ?? false;
  const json = JSON.stringify(toCompact(payload, forPublicUrl));

  if (forPublicUrl) {
    return LZ_PREFIX + compressToEncodedURIComponent(json);
  }

  return utf8ToBase64Url(json);
}

/** Max encoded token length safe inside an X intent tweet body. */
export const SHARE_TOKEN_URL_MAX = 220;

export function decodeShareToken(token: string): ShareCardPayload | null {
  try {
    let raw = token.trim();
    try {
      raw = decodeURIComponent(raw);
    } catch {
      /* use raw token */
    }

    let json: string;
    if (raw.startsWith(LZ_PREFIX)) {
      const decompressed = decompressFromEncodedURIComponent(
        raw.slice(LZ_PREFIX.length),
      );
      if (!decompressed) return null;
      json = decompressed;
    } else {
      json = base64UrlToUtf8(raw);
    }

    const compact = JSON.parse(json) as CompactCard;
    if (!compact?.n || !compact?.p) return null;
    return fromCompact(compact);
  } catch {
    return null;
  }
}

/** True if token looks cut off (common when a long URL is pasted from X). */
export function isLikelyTruncatedToken(token: string): boolean {
  const raw = token.trim();
  if (raw.length < 40) return true;
  if (raw.startsWith(LZ_PREFIX) || raw.includes('{"n"') || raw.startsWith("eyJ")) {
    try {
      return decodeShareToken(raw) === null;
    } catch {
      return true;
    }
  }
  return decodeShareToken(raw) === null && raw.length > 0;
}
