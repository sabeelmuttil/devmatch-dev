export function avatarFallbackUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export function resolveAvatarUrl(
  image: string | null | undefined,
  seed: string,
): string {
  const trimmed = image?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : avatarFallbackUrl(seed);
}

/** Same-origin proxy so daily.dev / Google avatars load reliably in the browser and OG. */
export function proxiedAvatarUrl(
  origin: string,
  image: string | null | undefined,
  seed: string,
): string {
  const target = resolveAvatarUrl(image, seed);
  let url = target;
  if (url.includes("dicebear.com") && url.includes("/svg")) {
    url = url.replace("/svg", "/png");
  }
  return `${origin.replace(/\/$/, "")}/api/image-proxy?url=${encodeURIComponent(url)}`;
}
