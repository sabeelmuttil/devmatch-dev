import { NextResponse } from "next/server";
import {
  DailyDevApiError,
  fetchDailyDevProfile,
  fetchDailyDevStack,
  fetchDailyDevTags,
  stackItemLabel,
} from "@/lib/daily-dev";
import {
  analyzeDeveloperMatch,
  GeminiAnalysisError,
} from "@/lib/match-analysis";

export const runtime = "nodejs";

interface MatchRequestBody {
  username?: string;
}

function jsonError(
  message: string,
  status: number,
  code?: string,
): NextResponse {
  return NextResponse.json({ error: message, code }, { status });
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
    const [profile, stack, tags] = await Promise.all([
      fetchDailyDevProfile(),
      fetchDailyDevStack(),
      fetchDailyDevTags(),
    ]);

    const profileUsername = profile.username?.trim().toLowerCase();
    if (!profileUsername) {
      return jsonError(
        "Authenticated daily.dev profile has no username set",
        400,
        "profile_missing_username",
      );
    }

    if (profileUsername !== username) {
      return jsonError(
        `Username "${body.username}" does not match the authenticated profile (@${profile.username}). The daily.dev Public API returns data for the PAT owner only.`,
        400,
        "username_mismatch",
      );
    }

    const analysis = await analyzeDeveloperMatch(profile, stack, tags);

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
        title: stackItemLabel(item),
        icon: item.icon,
        startedAt: item.startedAt,
      })),
      tags: tags.map((t) => t.name),
      techPersonality: analysis.techPersonality,
      perfectMatches: analysis.perfectMatches,
    });
  } catch (error) {
    if (error instanceof DailyDevApiError) {
      const status =
        error.status === 401
          ? 401
          : error.status === 429
            ? 429
            : error.code === "missing_config"
              ? 500
              : 502;

      return jsonError(error.message, status, error.code ?? "daily_dev_error");
    }

    if (error instanceof GeminiAnalysisError) {
      const status = error.message.includes("not configured") ? 500 : 502;
      return jsonError(error.message, status, "gemini_error");
    }

    console.error("[match] Unexpected error:", error);
    return jsonError("Internal server error", 500, "internal_error");
  }
}

export async function GET() {
  return jsonError("Method not allowed. Use POST.", 405, "method_not_allowed");
}
