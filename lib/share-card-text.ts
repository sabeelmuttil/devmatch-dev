/** X counts URLs as ~23 chars; keep total tweet body within limit. */
export const X_TWEET_MAX = 275;

export interface ShareTweetInput {
  name: string;
  username?: string;
  persona: string;
  skills: string[];
  appUrl: string;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
}

/**
 * Tweet body (no URL) — card link is passed via X intent `url` so the full link is not truncated.
 */
export function buildXTweetText(input: ShareTweetInput): string {
  const skills = input.skills.filter((s) => s && s !== "—").slice(0, 3);
  const skillPart = skills.length > 0 ? ` · ${skills.join(" · ")}` : "";
  const handle = input.username ? ` @${input.username}` : "";
  const hashtag = "#dailydevhackathon";
  const suffix = `\n\n${hashtag}`;
  const bodyBudget = X_TWEET_MAX - suffix.length;

  let body = `My Tech Identity: ${truncate(input.persona, 48)}${skillPart}${handle}`;
  if (body.length > bodyBudget) {
    body = truncate(
      `My Tech Identity: ${truncate(input.persona, 32)}${skillPart}`,
      bodyBudget,
    );
  }

  return (body + suffix).slice(0, X_TWEET_MAX);
}

export interface XIntentOptions {
  text: string;
  /** Full card image URL — X appends this via the `url` param (not the 275-char text cap). */
  cardImageUrl?: string;
  /** Fallback when no card URL is available. */
  appUrl?: string;
}

/** Opens X compose with body text + full card link in `url` (avoids cutting long links inside `text`). */
export function buildXIntentUrl(options: XIntentOptions): string {
  const params = new URLSearchParams({ text: options.text });
  const link = (options.cardImageUrl?.trim() || options.appUrl?.replace(/\/$/, "") || "").trim();
  if (link) params.set("url", link);
  return `https://x.com/intent/tweet?${params.toString()}`;
}
