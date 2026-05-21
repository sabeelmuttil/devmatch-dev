const DAILY_DEV_GRAPHQL_URL =
  process.env.DAILY_DEV_GRAPHQL_URL ?? "https://api.daily.dev/graphql";

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
}

export interface DailyDevReadTag {
  name: string;
  count: number;
}

export interface DailyDevUserData {
  profile: DailyDevProfile;
  stack: DailyDevStackItem[];
  readTags: DailyDevReadTag[];
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
}

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

export async function executeDailyDevGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const pat = getPat();

  const response = await fetch(DAILY_DEV_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  let body: GraphQLResponse<T>;
  try {
    body = (await response.json()) as GraphQLResponse<T>;
  } catch {
    throw new DailyDevApiError(
      "Invalid response from daily.dev GraphQL API",
      502,
      "invalid_response",
    );
  }

  if (body.errors?.length) {
    const message = body.errors[0]?.message ?? "GraphQL request failed";
    const code = body.errors[0]?.extensions?.code;

    if (
      message.toLowerCase().includes("user not found") ||
      code === "FORBIDDEN"
    ) {
      throw new DailyDevApiError(
        "No daily.dev user found with that username",
        404,
        "user_not_found",
      );
    }

    if (
      message.toLowerCase().includes("unauthenticated") ||
      code === "UNAUTHENTICATED"
    ) {
      throw new DailyDevApiError(
        "Invalid or expired daily.dev API token",
        401,
        "unauthorized",
      );
    }

    throw new DailyDevApiError(message, 502, "graphql_error");
  }

  if (!response.ok) {
    throw new DailyDevApiError(
      `daily.dev API error (${response.status})`,
      response.status === 401 ? 401 : 502,
      "http_error",
    );
  }

  if (!body.data) {
    throw new DailyDevApiError(
      "Empty response from daily.dev GraphQL API",
      502,
      "empty_response",
    );
  }

  return body.data;
}

export function stackItemTitle(item: DailyDevStackItem): string {
  return item.title;
}
