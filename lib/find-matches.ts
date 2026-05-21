import { resolveAvatarUrl } from "@/lib/avatar";
import type { DailyDevReadTag, DailyDevStackItem } from "./daily-dev";
import { executeDailyDevGraphQL } from "./daily-dev";
import type { PerfectMatch } from "./match-analysis";

interface DailyDevUserSummary {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio?: string | null;
  reputation?: number;
}

interface FindMatchesQueryResult {
  similarCreators: DailyDevUserSummary[];
  tag0: DailyDevUserSummary[];
  tag1: DailyDevUserSummary[];
  tag2: DailyDevUserSummary[];
}

interface UserStackQueryResult {
  userStack: {
    edges: Array<{
      node: {
        title: string | null;
        tool: { title: string } | null;
      };
    }>;
  };
}

const FIND_MATCHES_QUERY = `
  query FindDeveloperMatches(
    $userId: ID!
    $tag0: String!
    $tag1: String!
    $tag2: String!
  ) {
    similarCreators(userId: $userId, limit: 5) {
      id
      name
      username
      image
      bio
      reputation
    }
    tag0: topCreatorsByTag(tag: $tag0, limit: 5) {
      id
      name
      username
      image
      bio
    }
    tag1: topCreatorsByTag(tag: $tag1, limit: 5) {
      id
      name
      username
      image
      bio
    }
    tag2: topCreatorsByTag(tag: $tag2, limit: 5) {
      id
      name
      username
      image
      bio
    }
  }
`;

const USER_STACK_QUERY = `
  query MatchUserStack($userId: ID!) {
    userStack(userId: $userId, first: 8) {
      edges {
        node {
          title
          tool {
            title
          }
        }
      }
    }
  }
`;

function normalizeTagSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 40);
}

function pickMatchTags(
  readTags: DailyDevReadTag[],
  stack: DailyDevStackItem[],
): [string, string, string] {
  const candidates = [
    ...readTags.map((t) => t.name),
    ...stack.map((s) => normalizeTagSlug(s.title)),
    "webdev",
    "javascript",
    "programming",
  ]
    .map((t) => normalizeTagSlug(t))
    .filter((t) => t.length > 0);

  const unique = [...new Set(candidates)];
  const padded = [...unique, "webdev", "javascript", "programming"].slice(0, 3);
  return [padded[0], padded[1], padded[2]];
}

async function fetchUserStackTitles(userId: string): Promise<string[]> {
  try {
    const data = await executeDailyDevGraphQL<UserStackQueryResult>(
      USER_STACK_QUERY,
      { userId },
    );
    const titles = data.userStack.edges
      .map((e) => e.node.tool?.title ?? e.node.title ?? "")
      .filter(Boolean);
    return [...new Set(titles)].slice(0, 6);
  } catch {
    return [];
  }
}

function buildMatchReason(
  creator: DailyDevUserSummary,
  sharedTags: string[],
  fromSimilar: boolean,
): string {
  if (fromSimilar) {
    return `daily.dev surfaces them as a creator with a similar audience to yours.`;
  }
  if (sharedTags.length > 0) {
    const tags = sharedTags.map((t) => `#${t}`).join(", ");
    return `Top reader in ${tags} — aligns with your Tech DNA.`;
  }
  return `Active creator in topics you read on daily.dev.`;
}

export async function findRealDeveloperMatches(
  userId: string,
  ownUsername: string | null,
  readTags: DailyDevReadTag[],
  stack: DailyDevStackItem[],
  limit = 3,
): Promise<PerfectMatch[]> {
  const [tag0, tag1, tag2] = pickMatchTags(readTags, stack);
  const own = ownUsername?.toLowerCase();

  const data = await executeDailyDevGraphQL<FindMatchesQueryResult>(
    FIND_MATCHES_QUERY,
    { userId, tag0, tag1, tag2 },
  );

  const tagKeys = [tag0, tag1, tag2] as const;
  const tagLists = [data.tag0, data.tag1, data.tag2] as const;

  type Scored = {
    user: DailyDevUserSummary;
    score: number;
    sharedTags: string[];
    fromSimilar: boolean;
  };

  const scored = new Map<string, Scored>();

  for (const user of data.similarCreators) {
    if (!user.username || user.username.toLowerCase() === own) continue;
    const existing = scored.get(user.id);
    const entry: Scored = {
      user,
      score: (existing?.score ?? 0) + 12,
      sharedTags: existing?.sharedTags ?? [],
      fromSimilar: true,
    };
    scored.set(user.id, entry);
  }

  tagLists.forEach((list, tagIndex) => {
    const tag = tagKeys[tagIndex];
    list.forEach((user, rank) => {
      if (!user.username || user.username.toLowerCase() === own) return;
      const points = 10 - rank;
      const existing = scored.get(user.id);
      const sharedTags = [...(existing?.sharedTags ?? []), tag];
      scored.set(user.id, {
        user,
        score: (existing?.score ?? 0) + points,
        sharedTags: [...new Set(sharedTags)],
        fromSimilar: existing?.fromSimilar ?? false,
      });
    });
  });

  const ranked = [...scored.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const matches: PerfectMatch[] = [];

  for (const { user, score, sharedTags, fromSimilar } of ranked) {
    const stackTitles = await fetchUserStackTitles(user.id);
    const displayStack =
      stackTitles.length > 0
        ? stackTitles
        : sharedTags
            .slice(0, 5)
            .map((t) => t.charAt(0).toUpperCase() + t.slice(1));

    const maxScore = 99;
    const minScore = 85;
    const normalized = Math.min(
      maxScore,
      Math.max(minScore, minScore + Math.round(score * 1.5)),
    );

    matches.push({
      username: user.username!,
      name: user.name ?? user.username!,
      avatar: resolveAvatarUrl(user.image, user.username!),
      stack: displayStack,
      matchScore: normalized,
      matchReason: buildMatchReason(user, sharedTags, fromSimilar),
      relationship: fromSimilar ? "similar" : "complement",
    });
  }

  return matches;
}
