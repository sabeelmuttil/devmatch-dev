import {
  buildXIntentUrl,
  buildXTweetText,
  type ShareTweetInput,
} from "@/lib/share-card-text";

export interface ShareIdentityInput {
  name: string;
  username?: string;
  persona: string;
  personaDescription?: string;
  skills: string[];
  appUrl: string;
  pageUrl?: string;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
}

export function shareCardUrl(input: ShareIdentityInput): string {
  return (input.pageUrl?.trim() || input.appUrl.replace(/\/$/, "")).trim();
}

/** Full identity blurb for copy, WhatsApp, email, native share (includes link). */
export function buildShareIdentityText(input: ShareIdentityInput): string {
  const skills = input.skills.filter((s) => s && s !== "—").slice(0, 3);
  const skillLine =
    skills.length > 0 ? `\n\nStack: ${skills.join(" · ")}` : "";
  const desc = input.personaDescription?.trim();
  const descPart = desc
    ? `\n\n${truncate(desc.replace(/\s+/g, " "), 200)}`
    : "";
  const handle = input.username ? ` @${input.username}` : "";
  const link = shareCardUrl(input);
  const hashtag = "#dailydevhackathon";

  return (
    `My Tech Identity: ${input.persona} ⚡ ${input.name}${handle}${descPart}${skillLine}\n\n${link}\n\n${hashtag}`
  ).trim();
}

export function buildLinkedInShareUrl(pageUrl: string, text: string): string {
  const url = pageUrl.trim();
  const params = new URLSearchParams({
    shareActive: "true",
    text,
  });
  if (url) params.set("url", url);
  return `https://www.linkedin.com/feed/?${params.toString()}`;
}

export function buildWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function buildRedditShareUrl(pageUrl: string, text: string): string {
  const params = new URLSearchParams({
    url: pageUrl.trim(),
    title: truncate(text.replace(/\n+/g, " ").trim(), 300),
  });
  return `https://www.reddit.com/submit?${params.toString()}`;
}

export function buildEmailShareUrl(subject: string, body: string): string {
  const params = new URLSearchParams({
    subject: truncate(subject, 120),
    body,
  });
  return `mailto:?${params.toString()}`;
}

export function openXShare(input: ShareTweetInput): Window | null {
  const pageUrl = input.pageUrl?.trim() || "";
  const text = buildXTweetText({
    ...input,
    pageUrl: pageUrl || undefined,
  });
  const url = buildXIntentUrl({
    text,
    pageUrl: pageUrl || undefined,
    appUrl: input.appUrl,
  });
  return window.open(url, "_blank", "noopener,noreferrer");
}

export async function nativeShare(options: {
  title: string;
  text: string;
  url: string;
}): Promise<"shared" | "unsupported" | "cancelled" | "failed"> {
  if (!navigator.share) return "unsupported";
  try {
    await navigator.share({
      title: options.title,
      text: options.text,
      url: options.url,
    });
    return "shared";
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return "cancelled";
    return "failed";
  }
}
