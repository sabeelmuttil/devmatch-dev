/** X/Twitter post limit */
export const X_TWEET_MAX = 280;

export interface ShareTweetInput {
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

/**
 * Tweet with identity copy and card link in the body (plus `url` param for X preview).
 */
export function buildXTweetText(input: ShareTweetInput): string {
  const skills = input.skills.filter((s) => s && s !== "—").slice(0, 3);
  const skillLine = skills.length > 0 ? `\n${skills.join(" · ")}` : "";
  const handle = input.username ? ` @${input.username}` : "";
  const desc = input.personaDescription?.trim();
  const descPart = desc
    ? `\n${truncate(desc.replace(/\s+/g, " "), 100)}`
    : "";
  const link = (
    input.pageUrl?.trim() || input.appUrl.replace(/\/$/, "")
  ).trim();
  const hashtag = "\n\n#dailydevhackathon";
  const linkPart = link ? `\n\n${link}` : "";
  const suffix = `${linkPart}${hashtag}`;

  let body = `My Tech Identity: ${truncate(input.persona, 48)}${handle}${descPart}${skillLine}`;
  const maxBody = X_TWEET_MAX - suffix.length;
  if (body.length > maxBody) {
    body = truncate(
      `My Tech Identity: ${truncate(input.persona, 36)}${handle}${skillLine}`,
      maxBody,
    );
  }

  return (body + suffix).slice(0, X_TWEET_MAX);
}

export interface XIntentOptions {
  text: string;
  /** Share page with Twitter Card meta — required for X link preview. */
  pageUrl?: string;
  appUrl?: string;
}

/** Opens X compose; `url` must be the HTML page (not raw PNG) so X can read twitter:card meta. */
export function buildXIntentUrl(options: XIntentOptions): string {
  const params = new URLSearchParams({ text: options.text });
  const link = (
    options.pageUrl?.trim() ||
    options.appUrl?.replace(/\/$/, "") ||
    ""
  ).trim();
  if (link) params.set("url", link);
  return `https://x.com/intent/tweet?${params.toString()}`;
}
