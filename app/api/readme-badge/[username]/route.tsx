import { avatarFallbackUrl, resolveAvatarUrl } from "@/lib/avatar";
import { fetchProfileBrief } from "@/lib/fetch-profile-brief";
import {
  encodeDnaParam,
  encodeTagsParam,
  parseDnaParam,
  parseTagsParam,
  ReadmeBadgeCardImage,
  readmeCardHeight,
  README_CARD_WIDTH,
} from "@/lib/readme-badge-card";
import { getSiteUrl } from "@/lib/site-seo";
import { normalizeUsernameRoute } from "@/lib/username-route";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ username: string }> };

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function resolveAvatarForOg(
  origin: string,
  image: string | null | undefined,
  seed: string,
): string {
  const target = resolveAvatarUrl(image, seed);
  if (target.includes("dicebear.com") && target.includes("/svg")) {
    return target.replace("/svg", "/png");
  }
  return `${origin.replace(/\/$/, "")}/api/image-proxy?url=${encodeURIComponent(target)}`;
}

export async function GET(request: Request, context: RouteContext) {
  const { username: raw } = await context.params;
  const username = normalizeUsernameRoute(decodeURIComponent(raw));
  if (!username) {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const persona = truncate(
    url.searchParams.get("persona")?.trim() || "Developer Tech Identity",
    48,
  );
  const techDna = parseDnaParam(url.searchParams.get("dna"));
  const tags = parseTagsParam(url.searchParams.get("tags"));

  const profile = await fetchProfileBrief(username);
  const displayName = profile?.name?.trim() || username;
  const origin = getSiteUrl();
  const avatarUrl = profile?.image
    ? resolveAvatarForOg(origin, profile.image, username)
    : resolveAvatarForOg(origin, avatarFallbackUrl(username), username);

  const cardProps = {
    name: displayName,
    username,
    persona,
    avatarUrl,
    techDna,
    tags,
  };

  const height = readmeCardHeight(cardProps);

  try {
    return new ImageResponse(ReadmeBadgeCardImage(cardProps), {
      width: README_CARD_WIDTH,
      height,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "Content-Type": "image/png",
      },
    });
  } catch (err) {
    console.error("[readme-badge]", err);
    return new Response("Failed to generate badge", { status: 500 });
  }
}
