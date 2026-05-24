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

export function resolveAvatarUrl(
  image: string | null | undefined,
  seed: string,
): string {
  const trimmed = image?.trim();
  if (trimmed) {
    try {
      if (canProxyImageUrl(trimmed)) return trimmed;
    } catch {
      /* fall through to generated avatar */
    }
  }
  return avatarFallbackUrl(seed);
}

/** Same-origin proxy so allowed avatars load without CORS issues. */
export function proxiedAvatarUrl(
  origin: string,
  image: string | null | undefined,
  seed: string,
): string {
  const target = resolveAvatarUrl(image, seed);
  return `${origin.replace(/\/$/, "")}/api/image-proxy?url=${encodeURIComponent(target)}`;
}
