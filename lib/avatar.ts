export function avatarFallbackUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(seed)}`;
}

const PROXIABLE_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "avatars.githubusercontent.com",
  "media.daily.dev",
  "res.cloudinary.com",
  "api.dicebear.com",
]);

function canProxyImageUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && PROXIABLE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/** If `src` is already `/api/image-proxy?url=...`, return the inner target URL. */
function unwrapProxiedAvatarUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (!url.pathname.endsWith("/api/image-proxy")) return null;
    const inner = url.searchParams.get("url");
    return inner ? decodeURIComponent(inner) : null;
  } catch {
    return null;
  }
}

export function resolveAvatarUrl(
  image: string | null | undefined,
  seed: string,
): string {
  const trimmed = image?.trim();
  if (trimmed) {
    const unwrapped = unwrapProxiedAvatarUrl(trimmed);
    const candidate = unwrapped ?? trimmed;
    try {
      const url = new URL(candidate);
      if (url.protocol === "https:") return candidate;
    } catch {
      /* fall through to generated avatar */
    }
  }
  return avatarFallbackUrl(seed);
}

/** Same-origin proxy for allowlisted hosts; direct HTTPS URL otherwise (img display). */
export function proxiedAvatarUrl(
  origin: string,
  image: string | null | undefined,
  seed: string,
): string {
  const target = resolveAvatarUrl(image, seed);
  if (!canProxyImageUrl(target)) return target;
  return `${origin.replace(/\/$/, "")}/api/image-proxy?url=${encodeURIComponent(target)}`;
}
