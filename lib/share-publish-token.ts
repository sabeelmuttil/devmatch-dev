import type { ShareCardPayload } from "@/lib/export-card-image";

/** Compact JSON for URL token — keep encoded length small so X/tweets do not truncate. */
interface CompactCard {
  n: string;
  u?: string;
  p: string;
  d?: string;
  s?: string[];
  t?: { label: string; value: number }[];
  g?: string[];
  m?: { n: string; u: string; s: number; r: string };
}

function toCompact(payload: ShareCardPayload): CompactCard {
  const compact: CompactCard = {
    n: payload.name.slice(0, 40),
    p: payload.persona.slice(0, 48),
  };

  if (payload.username) compact.u = payload.username.slice(0, 24);

  // Never embed avatar URLs — they are long and break share links when truncated.
  const desc = payload.personaDescription?.trim();
  if (desc) compact.d = desc.slice(0, 60);

  const skills = (payload.skills ?? []).filter(Boolean).slice(0, 3);
  if (skills.length) compact.s = skills;

  const dna = (payload.techDna ?? []).filter((d) => d?.label).slice(0, 4);
  if (dna.length) compact.t = dna;

  const tags = (payload.tags ?? []).filter(Boolean).slice(0, 4);
  if (tags.length) compact.g = tags;

  if (payload.topMatch) {
    compact.m = {
      n: payload.topMatch.name.slice(0, 24),
      u: payload.topMatch.username.slice(0, 20),
      s: payload.topMatch.matchScore,
      r: payload.topMatch.matchReason.slice(0, 50),
    };
  }

  return compact;
}

function fromCompact(c: CompactCard): ShareCardPayload {
  return {
    name: c.n,
    username: c.u,
    avatar: null,
    persona: c.p,
    personaDescription: c.d,
    skills: c.s ?? [],
    techDna: c.t,
    tags: c.g,
    topMatch: c.m
      ? {
          name: c.m.n,
          username: c.m.u,
          matchScore: c.m.s,
          matchReason: c.m.r,
        }
      : undefined,
  };
}

function utf8ToBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(token: string): string {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShareToken(payload: ShareCardPayload): string {
  return utf8ToBase64Url(JSON.stringify(toCompact(payload)));
}

export function decodeShareToken(token: string): ShareCardPayload | null {
  try {
    let raw = token.trim();
    try {
      raw = decodeURIComponent(raw);
    } catch {
      /* use raw token */
    }
    const json = base64UrlToUtf8(raw);
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
  if (raw.length < 80) return true;
  if (raw.includes('{"n"') || raw.startsWith("eyJ")) {
    try {
      decodeShareToken(raw);
      return false;
    } catch {
      return true;
    }
  }
  return decodeShareToken(raw) === null && raw.length > 0;
}
