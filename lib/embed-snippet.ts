export function embedPageUrl(base: string, username: string): string {
  const origin = base.replace(/\/$/, "");
  return `${origin}/embed/${encodeURIComponent(username)}`;
}

export function profilePageUrl(base: string, username: string): string {
  const origin = base.replace(/\/$/, "");
  return `${origin}/${encodeURIComponent(username)}`;
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

export function buildReadmeSnippet(
  base: string,
  username: string,
  persona: string,
): string {
  const profile = profilePageUrl(base, username);
  return `### 🧬 My Tech Identity

**${persona}** — powered by [dailydevmatch.dev](${profile})

<!-- Paste into your README (HTML block) -->
${buildIframeSnippet(base, username)}`;
}
