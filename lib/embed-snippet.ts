import type { ReadmeBadgeDnaEntry } from "@/lib/readme-badge-card";
import { encodeDnaParam, encodeTagsParam } from "@/lib/readme-badge-card";

export function embedPageUrl(base: string, username: string): string {
  const origin = base.replace(/\/$/, "");
  return `${origin}/embed/${encodeURIComponent(username)}`;
}

export function profilePageUrl(base: string, username: string): string {
  const origin = base.replace(/\/$/, "");
  return `${origin}/${encodeURIComponent(username)}`;
}

export interface ReadmeBadgeOptions {
  persona?: string;
  techDna?: ReadmeBadgeDnaEntry[];
  tags?: string[];
}

/** PNG card image — same layout as embed (works in GitHub README). */
export function readmeBadgeImageUrl(
  base: string,
  username: string,
  options?: ReadmeBadgeOptions,
): string {
  const origin = base.replace(/\/$/, "");
  const path = `${origin}/api/readme-badge/${encodeURIComponent(username)}`;
  const params = new URLSearchParams();

  if (options?.persona?.trim()) {
    params.set("persona", options.persona.trim());
  }
  if (options?.techDna?.length) {
    params.set("dna", encodeDnaParam(options.techDna));
  }
  if (options?.tags?.length) {
    params.set("tags", encodeTagsParam(options.tags));
  }

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
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
  return `<div
  class="dailydevmatch-embed"
  data-dailydevmatch-username="${username}"
  data-dailydevmatch-base="${origin}"
></div>
<script src="${origin}/embed.js" defer></script>`;
}

/** Markdown for GitHub README — embed-style card image + link. */
export function buildReadmeSnippet(
  base: string,
  username: string,
  persona: string,
  options?: Omit<ReadmeBadgeOptions, "persona">,
): string {
  const profile = profilePageUrl(base, username);
  const badge = readmeBadgeImageUrl(base, username, {
    persona,
    techDna: options?.techDna,
    tags: options?.tags,
  });
  const label = persona.trim() || "Tech Identity";

  return `[![${label}](${badge})](${profile})`;
}
