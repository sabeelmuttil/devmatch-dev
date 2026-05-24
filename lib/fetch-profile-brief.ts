import {
  DailyDevApiError,
  executeDailyDevGraphQL,
  type DailyDevProfile,
} from "@/lib/daily-dev";
import { cache } from "react";

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

interface UserProfileQueryResult {
  user: DailyDevProfile | null;
}

async function fetchProfileBriefUncached(
  username: string,
): Promise<DailyDevProfile | null> {
  try {
    const result = await executeDailyDevGraphQL<UserProfileQueryResult>(
      USER_PROFILE_QUERY,
      { username },
    );
    const user = result.user;
    if (!user?.username) return null;
    return user;
  } catch (error) {
    if (error instanceof DailyDevApiError) return null;
    console.warn("[fetchProfileBrief]", error);
    return null;
  }
}

/** Lightweight profile fetch for SEO metadata (deduped per request). */
export const fetchProfileBrief = cache(fetchProfileBriefUncached);
