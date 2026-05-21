import {
  DailyDevApiError,
  executeDailyDevGraphQL,
  type DailyDevStackItem,
  type DailyDevUserData,
} from "@/lib/daily-dev";
import { findRealDeveloperMatches } from "@/lib/find-matches";
import {
  analyzeDeveloperPersona,
  buildFallbackPersona,
} from "@/lib/match-analysis";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Fetch profile by daily.dev username (handle). */
const USER_PROFILE_QUERY = `
  query UserProfileByUsername($username: ID!) {
    user(id: $username) {
      id
      name
      username
      bio
      image
      reputation
      permalink
      experienceLevel
    }
  }
`;

/** Fetch stack + top read tags/categories using the user's internal ID. */
const USER_ENGAGEMENT_QUERY = `
  query UserEngagementById($userId: ID!) {
    userStack(userId: $userId, first: 100) {
      edges {
        node {
          id
          section
          title
          icon
          startedAt
          tool {
            title
          }
        }
      }
    }
    userMostReadTags(id: $userId, limit: 10) {
      value
      count
    }
  }
`;

interface MatchRequestBody {
  username?: string;
}

interface UserProfileQueryResult {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    bio: string | null;
    image: string | null;
    reputation: number;
    permalink: string;
    experienceLevel: string | null;
  } | null;
}

interface UserEngagementQueryResult {
  userStack: {
    edges: Array<{
      node: {
        id: string;
        section: string;
        title: string | null;
        icon: string | null;
        startedAt: string | null;
        tool: { title: string } | null;
      };
    }>;
  };
  userMostReadTags: Array<{ value: string; count: number }>;
}

function jsonError(
  message: string,
  status: number,
  code?: string,
): NextResponse {
  return NextResponse.json({ error: message, code }, { status });
}

async function fetchUserByUsername(
  username: string,
): Promise<DailyDevUserData> {
  const profileResult = await executeDailyDevGraphQL<UserProfileQueryResult>(
    USER_PROFILE_QUERY,
    { username },
  );

  const user = profileResult.user;
  if (!user?.id) {
    throw new DailyDevApiError(
      `No daily.dev user found with username "@${username}"`,
      404,
      "user_not_found",
    );
  }

  const engagement = await executeDailyDevGraphQL<UserEngagementQueryResult>(
    USER_ENGAGEMENT_QUERY,
    { userId: user.id },
  );

  const stack: DailyDevStackItem[] = engagement.userStack.edges.map(
    ({ node }) => ({
      id: node.id,
      section: node.section,
      title: node.tool?.title ?? node.title ?? "Unknown",
      icon: node.icon,
      startedAt: node.startedAt,
    }),
  );

  const readTags = engagement.userMostReadTags.map((tag) => ({
    name: tag.value,
    count: tag.count,
  }));

  return {
    profile: {
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      image: user.image,
      reputation: user.reputation,
      permalink: user.permalink,
      experienceLevel: user.experienceLevel,
    },
    stack,
    readTags,
  };
}

export async function POST(request: Request) {
  let body: MatchRequestBody;

  try {
    body = (await request.json()) as MatchRequestBody;
  } catch {
    return jsonError("Invalid JSON body", 400, "invalid_json");
  }

  const username = body.username?.trim().toLowerCase();
  if (!username) {
    return jsonError("username is required", 400, "missing_username");
  }

  try {
    const { profile, stack, readTags } = await fetchUserByUsername(username);

    const perfectMatches = await findRealDeveloperMatches(
      profile.id,
      profile.username,
      readTags,
      stack,
      3,
    );

    let techPersonality;
    let personaSource: "gemini" | "fallback" = "gemini";

    try {
      const persona = await analyzeDeveloperPersona(profile, stack, readTags);
      techPersonality = persona.techPersonality;
    } catch (geminiError) {
      console.warn(
        "[match] Gemini persona failed, using fallback:",
        geminiError,
      );
      techPersonality = buildFallbackPersona(
        profile,
        stack,
        readTags,
      ).techPersonality;
      personaSource = "fallback";
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        bio: profile.bio,
        image: profile.image,
        reputation: profile.reputation,
        permalink: profile.permalink,
        experienceLevel: profile.experienceLevel,
      },
      stack: stack.map((item) => ({
        id: item.id,
        section: item.section,
        title: item.title,
        icon: item.icon,
        startedAt: item.startedAt,
      })),
      tags: readTags.map((t) => t.name),
      readTags,
      techPersonality,
      personaSource,
      perfectMatches,
    });
  } catch (error) {
    if (error instanceof DailyDevApiError) {
      const status =
        error.status === 401
          ? 401
          : error.status === 404
            ? 404
            : error.status === 429
              ? 429
              : error.code === "missing_config"
                ? 500
                : 502;

      return jsonError(error.message, status, error.code ?? "daily_dev_error");
    }

    console.error("[match] Unexpected error:", error);
    return jsonError("Internal server error", 500, "internal_error");
  }
}

export async function GET() {
  return jsonError("Method not allowed. Use POST.", 405, "method_not_allowed");
}
