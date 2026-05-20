const DAILY_DEV_API_BASE = "https://api.daily.dev/public/v1";

export interface DailyDevProfile {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  image: string | null;
  reputation: number;
  permalink: string;
  experienceLevel: string | null;
}

export interface DailyDevStackItem {
  id: string;
  section: string;
  title: string;
  icon?: string | null;
  startedAt?: string | null;
  tool?: { id: string; title: string; faviconUrl?: string | null };
}

export interface DailyDevTag {
  name: string;
}

type PaginatedStackResponse = {
  data: DailyDevStackItem[];
  pagination?: { hasNextPage: boolean; cursor: string | null };
};

type TagsResponse = {
  data: DailyDevTag[];
};

export class DailyDevApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "DailyDevApiError";
  }
}

function getPat(): string {
  const pat = process.env.DAILY_DEV_PAT;
  if (!pat) {
    throw new DailyDevApiError(
      "DAILY_DEV_PAT is not configured",
      500,
      "missing_config",
    );
  }
  return pat;
}

async function dailyDevFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const pat = getPat();
  const url = `${DAILY_DEV_API_BASE}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: "application/json",
      ...init?.headers,
    },
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const err = body as { message?: string; error?: string } | null;
    throw new DailyDevApiError(
      err?.message ?? `daily.dev API error (${response.status})`,
      response.status,
      err?.error,
    );
  }

  return body as T;
}

export async function fetchDailyDevProfile(): Promise<DailyDevProfile> {
  return dailyDevFetch<DailyDevProfile>("/profile/");
}

export async function fetchDailyDevStack(): Promise<DailyDevStackItem[]> {
  const items: DailyDevStackItem[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ limit: "100" });
    if (cursor) params.set("cursor", cursor);

    const page = await dailyDevFetch<PaginatedStackResponse>(
      `/profile/stack/?${params}`,
    );
    items.push(...page.data);

    if (page.pagination?.hasNextPage && page.pagination.cursor) {
      cursor = page.pagination.cursor;
    } else {
      cursor = undefined;
    }
  } while (cursor);

  return items;
}

export async function fetchDailyDevTags(): Promise<DailyDevTag[]> {
  const result = await dailyDevFetch<TagsResponse>("/tags/");
  return result.data;
}

export function stackItemLabel(item: DailyDevStackItem): string {
  return item.tool?.title ?? item.title;
}
