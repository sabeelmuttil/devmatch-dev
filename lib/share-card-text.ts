/** X counts URLs as ~23 chars; keep total tweet body within limit. */
export const X_TWEET_MAX = 275;

export interface ShareTweetInput {
  name: string;
  username?: string;
  persona: string;
  skills: string[];
  appUrl: string;
  /** Public PNG URL — X embeds direct image links in the timeline. */
  imageUrl?: string;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
}

/**
 * Compact tweet for X intent (max 275 chars). Full details stay on the card image.
 */
export function buildXTweetText(input: ShareTweetInput): string {
  const skills = input.skills.filter((s) => s && s !== "—").slice(0, 3);
  const skillPart = skills.length > 0 ? ` · ${skills.join(" · ")}` : "";
  const handle = input.username ? ` @${input.username}` : "";
  const hashtag = "#dailydevhackathon";

  const link = (input.imageUrl?.trim() || input.appUrl.replace(/\/$/, "")).trim();
  const suffix = `\n\n${link}\n\n${hashtag}`;
  /** X treats any http(s) link as 23 characters in the 280 limit. */
  const suffixLen = 2 + 23 + 2 + hashtag.length;
  const bodyBudget = X_TWEET_MAX - suffixLen;

  let body = `My Tech Identity: ${truncate(input.persona, 48)}${skillPart}${handle}`;
  if (body.length > bodyBudget) {
    body = truncate(
      `My Tech Identity: ${truncate(input.persona, 32)}${skillPart}`,
      bodyBudget,
    );
  }

  return (body + suffix).slice(0, X_TWEET_MAX);
}

/** Single `text` param — avoids double URL + length issues with separate `url` param. */
export function buildXIntentUrl(text: string): string {
  return `https://x.com/intent/tweet?${new URLSearchParams({ text }).toString()}`;
}
