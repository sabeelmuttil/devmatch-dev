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
