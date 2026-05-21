import type { ShareCardPayload } from "@/lib/export-card-image";

/** Compact JSON for URL token (keeps encoded id under ~900 chars). */
interface CompactCard {
  n: string;
  u?: string;
  a?: string | null;
  p: string;
  d?: string;
  s?: string[];
  t?: { label: string; value: number }[];
  g?: string[];
  m?: { n: string; u: string; s: number; r: string };
}

function toCompact(payload: ShareCardPayload): CompactCard {
  const avatar =
    payload.avatar && payload.avatar.length < 100 ? payload.avatar : null;
  return {
    n: payload.name.slice(0, 48),
    u: payload.username?.slice(0, 32),
    a: avatar,
    p: payload.persona.slice(0, 64),
    d: payload.personaDescription?.slice(0, 90),
    s: payload.skills?.slice(0, 3),
    t: payload.techDna?.slice(0, 6),
    g: payload.tags?.slice(0, 6),
    m: payload.topMatch
      ? {
          n: payload.topMatch.name,
          u: payload.topMatch.username,
          s: payload.topMatch.matchScore,
          r: payload.topMatch.matchReason.slice(0, 100),
        }
      : undefined,
  };
}

function fromCompact(c: CompactCard): ShareCardPayload {
  return {
    name: c.n,
    username: c.u,
    avatar: c.a,
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

/** Works in browser and Node (no Buffer base64url — unsupported in browser polyfills). */
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
