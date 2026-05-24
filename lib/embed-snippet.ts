export function embedPageUrl(base: string, username: string): string {
  const origin = base.replace(/\/$/, "");
  return `${origin}/embed/${encodeURIComponent(username)}`;
}

export function profilePageUrl(base: string, username: string): string {
  const origin = base.replace(/\/$/, "");
  return `${origin}/${encodeURIComponent(username)}`;
}

/** PNG badge image — works in GitHub README (iframes do not). */
export function readmeBadgeImageUrl(
  base: string,
  username: string,
  persona?: string,
): string {
  const origin = base.replace(/\/$/, "");
  const path = `${origin}/api/readme-badge/${encodeURIComponent(username)}`;
  if (!persona?.trim()) return path;
  return `${path}?persona=${encodeURIComponent(persona.trim())}`;
}

export function buildIframeSnippet(base: string, username: string): string {
  const src = embedPageUrl(base, username);
  return `<iframe
  src="${src}"
  title="Tech Identity — dailydevmatch.dev"
  width="360"
  height="200"
  style="border:0;max-width:100%;border-radius:16px;overflow:hidden;"
  loading="lazy"
></iframe>`;
}

export function buildScriptSnippet(base: string, username: string): string {
  const origin = base.replace(/\/$/, "");
  return `<script
  src="${origin}/embed.js"
  data-username="${username}"
  async
></script>`;
}

/** Markdown for GitHub README — image badge + link (GitHub strips iframes). */
export function buildReadmeSnippet(
  base: string,
  username: string,
  persona: string,
): string {
  const profile = profilePageUrl(base, username);
  const badge = readmeBadgeImageUrl(base, username, persona);
  const label = persona.trim() || "Tech Identity";

  return `[![${label}](${badge})](${profile})`;
}
