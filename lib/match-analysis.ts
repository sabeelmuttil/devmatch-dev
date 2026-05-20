import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DailyDevProfile, DailyDevStackItem, DailyDevTag } from "./daily-dev";
import { stackItemLabel } from "./daily-dev";

export interface TechDna {
  [category: string]: number;
}

export interface TechPersonality {
  title: string;
  techDna: TechDna;
  description: string;
}

export interface PerfectMatch {
  username: string;
  name: string;
  avatar: string;
  stack: string[];
  matchScore: number;
  matchReason: string;
  relationship: "similar" | "complement";
}

export interface MatchAnalysis {
  techPersonality: TechPersonality;
  perfectMatches: PerfectMatch[];
}

export class GeminiAnalysisError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "GeminiAnalysisError";
  }
}

const ANALYSIS_SCHEMA = `{
  "techPersonality": {
    "title": "string — a catchy 2-4 word label like Flutter Evangelist or UI Wizard",
    "techDna": { "CategoryName": number — percentages that sum to 100, e.g. Frontend, Mobile, Backend, DevOps, AI/ML, Data },
    "description": "string — 2-3 fun sentences about their dev vibe"
  },
  "perfectMatches": [
    {
      "username": "string — plausible daily.dev style handle",
      "name": "string — display name",
      "avatar": "string — URL to a random avatar from https://api.dicebear.com/7.x/avataaars/svg?seed=USERNAME",
      "stack": ["string — 4-6 technologies"],
      "matchScore": number — 75-99,
      "matchReason": "string — one sentence why they match",
      "relationship": "similar" | "complement"
    }
  ]
}`;

function buildPrompt(
  profile: DailyDevProfile,
  stack: DailyDevStackItem[],
  tags: DailyDevTag[],
): string {
  const stackLines = stack.map(
    (item) => `- ${stackItemLabel(item)} (${item.section})`,
  );
  const tagNames = tags.map((t) => t.name);

  return `You are the DevStack Matchmaker for daily.dev developers.

Analyze this developer and respond with ONLY valid JSON matching this schema (no markdown):
${ANALYSIS_SCHEMA}

Rules:
- techDna values must be integers that sum to exactly 100
- perfectMatches must contain exactly 3 fictional developer profiles (mock data, not real people)
- Mix similar-stack matches and complementary-stack matches
- Base techDna and personality on their stack sections (primary = strongest signal) and read tags
- Keep tone playful and encouraging

Developer profile:
- Name: ${profile.name ?? "Unknown"}
- Username: @${profile.username ?? "unknown"}
- Bio: ${profile.bio ?? "(none)"}
- Experience: ${profile.experienceLevel ?? "unspecified"}
- Reputation: ${profile.reputation}

Tech stack (${stack.length} items):
${stackLines.length > 0 ? stackLines.join("\n") : "- (empty stack)"}

Read / followed tags (${tagNames.length}):
${tagNames.length > 0 ? tagNames.join(", ") : "(none)"}`;
}

function parseAnalysis(raw: string): MatchAnalysis {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new GeminiAnalysisError("Gemini returned invalid JSON");
  }

  const data = parsed as MatchAnalysis;
  if (
    !data?.techPersonality?.title ||
    !data?.techPersonality?.description ||
    typeof data.techPersonality.techDna !== "object" ||
    !Array.isArray(data.perfectMatches) ||
    data.perfectMatches.length < 2
  ) {
    throw new GeminiAnalysisError("Gemini response missing required fields");
  }

  const dnaSum = Object.values(data.techPersonality.techDna).reduce(
    (a, b) => a + b,
    0,
  );
  if (dnaSum < 95 || dnaSum > 105) {
    const scale = 100 / dnaSum;
    for (const key of Object.keys(data.techPersonality.techDna)) {
      data.techPersonality.techDna[key] = Math.round(
        data.techPersonality.techDna[key] * scale,
      );
    }
  }

  data.perfectMatches = data.perfectMatches.slice(0, 3).map((match) => ({
    ...match,
    avatar:
      match.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(match.username)}`,
    matchScore: Math.min(99, Math.max(75, Math.round(match.matchScore))),
  }));

  return data;
}

export async function analyzeDeveloperMatch(
  profile: DailyDevProfile,
  stack: DailyDevStackItem[],
  tags: DailyDevTag[],
): Promise<MatchAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiAnalysisError("GEMINI_API_KEY is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.9,
    },
  });

  try {
    const result = await model.generateContent(buildPrompt(profile, stack, tags));
    const text = result.response.text();
    if (!text) {
      throw new GeminiAnalysisError("Gemini returned an empty response");
    }
    return parseAnalysis(text);
  } catch (error) {
    if (error instanceof GeminiAnalysisError) throw error;
    throw new GeminiAnalysisError(
      "Failed to analyze developer profile with Gemini",
      error,
    );
  }
}
