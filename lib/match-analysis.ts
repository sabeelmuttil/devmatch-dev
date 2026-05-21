import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  DailyDevProfile,
  DailyDevReadTag,
  DailyDevStackItem,
} from "./daily-dev";
import { stackItemTitle } from "./daily-dev";

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

export interface PersonaAnalysis {
  techPersonality: TechPersonality;
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

const DEFAULT_MODEL_FALLBACKS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
  "gemini-3.5-flash",
] as const;

const PERSONA_SCHEMA = `{
  "techPersonality": {
    "title": "string — catchy 2-4 word label e.g. Flutter Evangelist, Production Breaker, UI Wizard",
    "techDna": { "CategoryName": number — integer percentages summing to 100, e.g. Mobile, Frontend, Backend, DevOps, AI/ML },
    "description": "string — 2-3 fun sentences about their dev vibe"
  }
}`;

function getModelCandidates(): string[] {
  const preferred = process.env.GEMINI_MODEL?.trim();
  if (preferred) {
    return [
      preferred,
      ...DEFAULT_MODEL_FALLBACKS.filter((m) => m !== preferred),
    ];
  }
  return [...DEFAULT_MODEL_FALLBACKS];
}

function formatGeminiError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");

  if (message.includes("429") || message.toLowerCase().includes("quota")) {
    return "Gemini API quota exceeded. Wait a minute and retry, or use a different API key / model (set GEMINI_MODEL=gemini-2.5-flash in .env).";
  }
  if (
    message.toLowerCase().includes("denied access") ||
    message.toLowerCase().includes("permission denied")
  ) {
    return "Gemini API access denied for this project. Create a new key at https://aistudio.google.com/apikey and update GEMINI_API_KEY in .env.";
  }
  if (message.includes("403") && message.toLowerCase().includes("api key")) {
    return "Invalid Gemini API key. Create a new key at https://aistudio.google.com/apikey and update GEMINI_API_KEY in .env.";
  }
  if (message.includes("403")) {
    return "Gemini API returned 403 Forbidden. Verify your key at https://aistudio.google.com/apikey and that the Generative Language API is enabled.";
  }
  if (message.includes("503")) {
    return "Gemini model is temporarily unavailable. Please try again shortly.";
  }

  const apiMatch = message.match(/\] (.+)$/);
  return apiMatch?.[1] ?? message.slice(0, 200);
}

function buildPrompt(
  profile: DailyDevProfile,
  stack: DailyDevStackItem[],
  readTags: DailyDevReadTag[],
): string {
  const stackLines = stack.map(
    (item) => `- ${stackItemTitle(item)} (${item.section})`,
  );
  const tagLines = readTags.map((t) => `- ${t.name} (${t.count} reads)`);

  return `You are the DevStack Matchmaker for daily.dev developers.

Analyze this developer and respond with ONLY valid JSON matching this schema (no markdown):
${PERSONA_SCHEMA}

Rules:
- techDna values must be integers that sum to exactly 100
- Weight techDna heavily on read tags/categories and stack; read tags signal real interests
- Keep tone playful and encouraging

Developer profile:
- Name: ${profile.name ?? "Unknown"}
- Username: @${profile.username ?? "unknown"}
- Bio: ${profile.bio ?? "(none)"}
- Experience: ${profile.experienceLevel ?? "unspecified"}
- Reputation: ${profile.reputation}

Tech stack (${stack.length} items):
${stackLines.length > 0 ? stackLines.join("\n") : "- (empty stack)"}

Top read tags / categories (${readTags.length}):
${tagLines.length > 0 ? tagLines.join("\n") : "- (none)"}`;
}

function parsePersona(raw: string): PersonaAnalysis {
  let parsed: unknown;
  const trimmed = raw.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "");

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new GeminiAnalysisError("Gemini returned invalid JSON");
  }

  const data = parsed as PersonaAnalysis;
  if (
    !data?.techPersonality?.title ||
    !data?.techPersonality?.description ||
    typeof data.techPersonality.techDna !== "object"
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

  return data;
}

async function generateWithModel(
  apiKey: string,
  modelName: string,
  prompt: string,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.9,
    },
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}

const TAG_TO_DNA: Record<string, string> = {
  flutter: "Mobile",
  react: "Frontend",
  javascript: "Frontend",
  typescript: "Frontend",
  vue: "Frontend",
  node: "Backend",
  python: "Backend",
  rust: "Backend",
  go: "Backend",
  ai: "AI/ML",
  machinelearning: "AI/ML",
  devops: "DevOps",
  kubernetes: "DevOps",
  webdev: "Frontend",
  android: "Mobile",
  ios: "Mobile",
};

function inferDnaCategory(tagOrTech: string): string {
  const slug = tagOrTech
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (TAG_TO_DNA[slug]) return TAG_TO_DNA[slug];
  if (slug.includes("flutter") || slug.includes("mobile")) return "Mobile";
  if (slug.includes("react") || slug.includes("front")) return "Frontend";
  if (slug.includes("ai") || slug.includes("ml")) return "AI/ML";
  if (slug.includes("devops") || slug.includes("cloud")) return "DevOps";
  return "Generalist";
}

/** Local persona when Gemini is unavailable (quota, denied access, etc.). */
export function buildFallbackPersona(
  profile: DailyDevProfile,
  stack: DailyDevStackItem[],
  readTags: DailyDevReadTag[],
): PersonaAnalysis {
  const weights = new Map<string, number>();

  for (const tag of readTags) {
    const cat = inferDnaCategory(tag.name);
    weights.set(cat, (weights.get(cat) ?? 0) + tag.count);
  }
  for (const item of stack) {
    const cat = inferDnaCategory(stackItemTitle(item));
    weights.set(cat, (weights.get(cat) ?? 0) + 5);
  }

  if (weights.size === 0) {
    weights.set("Frontend", 40);
    weights.set("Backend", 35);
    weights.set("Generalist", 25);
  }

  const total = [...weights.values()].reduce((a, b) => a + b, 0);
  const techDna: TechDna = {};
  for (const [cat, w] of weights) {
    techDna[cat] = Math.round((w / total) * 100);
  }
  const dnaSum = Object.values(techDna).reduce((a, b) => a + b, 0);
  if (dnaSum !== 100) {
    const top = Object.entries(techDna).sort(([, a], [, b]) => b - a)[0]?.[0];
    if (top) techDna[top] += 100 - dnaSum;
  }

  const topTag = readTags[0]?.name ?? stack[0]?.title ?? "dev";
  const label = topTag.charAt(0).toUpperCase() + topTag.slice(1);

  return {
    techPersonality: {
      title: `${label} Explorer`,
      techDna,
      description: `${profile.name ?? profile.username ?? "This dev"} is deep in the daily.dev ${readTags.slice(0, 3).map((t) => `#${t.name}`).join(", ") || "community"} — a builder who follows the pulse of the ecosystem.`,
    },
  };
}

export async function analyzeDeveloperPersona(
  profile: DailyDevProfile,
  stack: DailyDevStackItem[],
  readTags: DailyDevReadTag[],
): Promise<PersonaAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiAnalysisError("GEMINI_API_KEY is not configured");
  }

  const prompt = buildPrompt(profile, stack, readTags);
  const models = getModelCandidates();
  const errors: string[] = [];

  for (const modelName of models) {
    try {
      const text = await generateWithModel(apiKey, modelName, prompt);
      return parsePersona(text);
    } catch (error) {
      if (error instanceof GeminiAnalysisError) throw error;

      const detail = formatGeminiError(error);
      errors.push(`${modelName}: ${detail}`);
      console.warn(`[match] Gemini model ${modelName} failed:`, detail);

      if (detail.includes("Invalid Gemini API key")) {
        throw new GeminiAnalysisError(detail, error);
      }
    }
  }

  throw new GeminiAnalysisError(
    errors[0] ??
      "All Gemini models failed. Set GEMINI_MODEL=gemini-2.5-flash in .env and check your API quota.",
    errors,
  );
}
