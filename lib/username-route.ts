const RESERVED_USERNAMES = new Set(["s", "api"]);

/** daily.dev-style username for URL segment `/username` */
export function normalizeUsernameRoute(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed || RESERVED_USERNAMES.has(trimmed)) return null;
  if (!/^[a-z0-9_-]{1,39}$/.test(trimmed)) return null;
  return trimmed;
}

export function usernameResultsPath(username: string): string {
  const normalized = normalizeUsernameRoute(username);
  if (!normalized) return "/";
  return `/${encodeURIComponent(normalized)}`;
}
