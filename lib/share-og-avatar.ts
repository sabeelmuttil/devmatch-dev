import { avatarFallbackUrl } from "@/lib/avatar";
import type { ShareCardPayload } from "@/lib/export-card-image";

/** Absolute URL for Satori — always via image-proxy (PNG, allowed hosts). */
export function resolveOgAvatarUrl(
  origin: string,
  body: ShareCardPayload,
): string {
  const base = origin.replace(/\/$/, "");
  const seed = body.username?.trim() || body.name?.trim() || "developer";
  let target = body.avatar?.trim() || avatarFallbackUrl(seed);

  if (target.includes("dicebear.com") && target.includes("/svg")) {
    target = target.replace("/svg", "/png");
  }

  return `${base}/api/image-proxy?url=${encodeURIComponent(target)}`;
}
