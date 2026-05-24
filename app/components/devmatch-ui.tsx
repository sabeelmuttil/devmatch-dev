"use client";

import { Avatar } from "@/components/Avatar";
import { EmbedBadgePanel } from "@/components/EmbedBadgePanel";
import { ShareCard } from "@/components/ShareCard";
import { useClientOrigin } from "@/lib/use-client-origin";
import * as React from "react";

const DEFAULT_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://dailydevmatch.dev";

export interface MatchProfile {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  image: string | null;
  reputation: number;
  permalink: string;
  experienceLevel: string | null;
}

export interface TechPersonality {
  title: string;
  techDna: Record<string, number>;
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

export interface MatchResult {
  profile: MatchProfile;
  stack: { id: string; section: string; title: string }[];
  tags: string[];
  techPersonality: TechPersonality;
  personaSource?: "gemini" | "fallback";
  perfectMatches: PerfectMatch[];
}

const DNA_COLORS = [
  "from-violet-500 to-purple-600",
  "from-cyan-400 to-blue-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
];

const LOADING_STEPS = [
  "Connecting to daily.dev",
  "Scanning your tech stack",
  "Analyzing Tech DNA",
  "Finding compatible devs",
];

const CODE_SNIPPETS = [
  "const match = await findSoulmate(username);",
  "if (stack.includes('flutter')) vibe++;",
  "return perfectMatches.filter(m => m.score > 90);",
  "// AI is cooking your persona...",
  "export type DevMatch = { dna: TechDNA; vibe: string };",
];

export function AmbientBackground() {
  return (
    <div className="ambient-root pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div className="ambient-grid" />
      <div className="ambient-aurora" />
      <div className="ambient-blob ambient-blob--violet" />
      <div className="ambient-blob ambient-blob--cyan" />
      <div className="ambient-blob ambient-blob--pink" />
      <div className="ambient-scanline" />
      <div className="ambient-noise" />
      <div className="ambient-vignette" />
    </div>
  );
}

function dailyDevProfileUrl(username: string): string {
  return `https://app.daily.dev/${username}`;
}

function SiteHeader() {
  return (
    <header className="glass-header relative z-10 flex items-center justify-between px-4 py-4 sm:px-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 font-mono text-sm font-bold text-white shadow-lg shadow-violet-500/40 ring-1 ring-white/20">
          DD
        </div>
        <span className="font-semibold tracking-tight text-white">
          dailydevmatch<span className="text-cyan-400">.dev</span>
        </span>
      </div>
      <span className="glass-chip hidden rounded-full px-3 py-1 text-xs font-medium text-violet-200 sm:inline-block">
        daily.dev Hackathon
      </span>
    </header>
  );
}

export function LandingView({
  username,
  error,
  onUsernameChange,
  onSubmit,
}: {
  username: string;
  error: string | null;
  onUsernameChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientBackground />
      <SiteHeader />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-8 sm:px-8">
        <div className="animate-fade-up mx-auto w-full max-w-2xl text-center">
          <p className="glass-chip mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-cyan-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            Powered by daily.dev + Gemini AI
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-gradient">Find Your</span>
            <br />
            <span className="text-white">Tech Soulmate</span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
            Drop your daily.dev username. We&apos;ll decode your Tech DNA,
            reveal your developer persona, and surface devs you&apos;re meant to
            vibe with.
          </p>

          <form
            className="mx-auto mt-10 w-full max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <label htmlFor="username" className="sr-only">
              daily.dev username
            </label>
            <div className="glass-panel group flex items-center overflow-hidden rounded-2xl transition-all focus-within:shadow-[0_0_40px_-6px_rgba(139,92,246,0.55)]">
              <span className="pl-5 font-mono text-zinc-500">@</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value)}
                placeholder="your-username"
                autoComplete="username"
                className="w-full bg-transparent py-4 pl-1 pr-4 font-mono text-base text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-left text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="group relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 p-[1px] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600/90 via-purple-600/90 to-cyan-600/90 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all group-hover:shadow-violet-500/40">
                <span className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                Find My Tech Match
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            </button>
          </form>

          <p className="mt-6 text-xs text-zinc-600">
            Uses your daily.dev PAT — username must match your account
          </p>
        </div>

        <div className="mx-auto mt-16 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Tech DNA", desc: "Visual stack breakdown" },
            { label: "Dev Persona", desc: "AI-generated identity" },
            { label: "Perfect Matches", desc: "Compatible developers" },
          ].map((item) => (
            <div
              key={item.label}
              className="glass-card rounded-xl px-4 py-5 text-center transition hover:border-violet-500/25 hover:bg-white/[0.04]"
            >
              <p className="font-medium text-violet-300">{item.label}</p>
              <p className="mt-1 text-sm text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function LoadingView({
  step,
  username,
}: {
  step: number;
  username?: string;
}) {
  const [codeIndex, setCodeIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setCodeIndex((i) => (i + 1) % CODE_SNIPPETS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientBackground />
      <SiteHeader />

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-2xl">
          <div className="glass-panel overflow-hidden rounded-2xl">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-zinc-500">
                match-engine.ts
              </span>
            </div>
            <div className="space-y-2 p-5 font-mono text-sm">
              {CODE_SNIPPETS.map((line, i) => (
                <p
                  key={line}
                  className={`transition-opacity duration-500 ${
                    i === codeIndex ? "text-cyan-300" : "text-zinc-600"
                  }`}
                  style={{
                    animation:
                      i === codeIndex ? "typing 1s ease infinite" : undefined,
                  }}
                >
                  <span className="text-violet-500/80 mr-2 select-none">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {line}
                  {i === codeIndex && (
                    <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-cyan-400" />
                  )}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="glass-card animate-pulse-glow rounded-xl p-5"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-violet-600/40 to-cyan-500/40" />
                <div className="mt-4 space-y-2">
                  <div className="mx-auto h-3 w-24 rounded bg-zinc-700/80" />
                  <div className="mx-auto h-2 w-32 rounded bg-zinc-800/80" />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-1000"
                    style={{ width: step > i ? "100%" : "30%" }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            {username ? (
              <p className="mb-2 font-mono text-sm text-cyan-400/90">
                @{username}
              </p>
            ) : null}
            <p className="text-lg font-medium text-white">
              {LOADING_STEPS[Math.min(step, LOADING_STEPS.length - 1)]}
              <span className="inline-block w-8 text-left text-cyan-400">
                {".".repeat((step % 3) + 1)}
              </span>
            </p>
            <div className="mx-auto mt-4 flex max-w-xs justify-center gap-1.5">
              {LOADING_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    i <= step
                      ? "bg-gradient-to-r from-violet-500 to-cyan-400"
                      : "bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DnaBar({
  label,
  value,
  colorClass,
  delay,
}: {
  label: string;
  value: number;
  colorClass: string;
  delay: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="font-mono font-medium text-cyan-400">{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border border-white/5 bg-zinc-900/50 backdrop-blur-sm">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} animate-bar-grow shadow-sm`}
          style={{
            width: `${value}%`,
            animationDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

export function ResultsView({
  data,
  onReset,
}: {
  data: MatchResult;
  onReset: () => void;
}) {
  const {
    profile,
    techPersonality,
    perfectMatches,
    tags,
    stack,
    personaSource,
  } = data;
  const dnaEntries = Object.entries(techPersonality.techDna).sort(
    ([, a], [, b]) => b - a,
  );
  const appOrigin = useClientOrigin(DEFAULT_APP_URL);
  const embedUsername = profile.username ?? "";

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <SiteHeader />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-12 pt-4 sm:px-8">
        <div className="animate-fade-up glass-panel mb-5 flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.image}
              name={profile.name ?? profile.username ?? "Developer"}
              username={profile.username}
              size={56}
              ringClassName="ring-2 ring-violet-500/50"
            />
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">
                {profile.name ?? profile.username}
              </h2>
              <p className="font-mono text-sm text-cyan-400">
                @{profile.username}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="glass-chip self-start rounded-xl px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-violet-500/40 hover:text-white sm:self-center"
          >
            New search
          </button>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="glass-panel glass-panel--cyan rounded-2xl bg-gradient-to-br from-violet-950/40 via-transparent to-cyan-950/30 p-4 sm:p-5">
              <p className="text-xs font-medium uppercase tracking-wider text-cyan-400/80">
                Developer Persona
              </p>
              {personaSource === "fallback" && (
                <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  Gemini unavailable — showing a local estimate. Add a valid{" "}
                  <code className="text-amber-100">GEMINI_API_KEY</code> in{" "}
                  <code className="text-amber-100">.env</code> for AI personas.
                </p>
              )}
              <div className="mt-3">
                <div className="relative inline-block">
                  <div className="glass-chip relative rounded-xl border border-violet-400/40 bg-gradient-to-br from-violet-600/25 to-cyan-500/15 px-4 py-2.5 shadow-lg shadow-violet-500/10">
                    <span className="text-lg font-bold text-gradient sm:text-xl">
                      {techPersonality.title}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {techPersonality.description}
                </p>
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">Tech DNA</h3>
                </div>
                <div className="space-y-2.5">
                  {dnaEntries.map(([label, value], i) => (
                    <DnaBar
                      key={`dna-${i}-${label}`}
                      label={label}
                      value={value}
                      colorClass={DNA_COLORS[i % DNA_COLORS.length]}
                      delay={i * 120}
                    />
                  ))}
                </div>
              </div>

              {tags.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Top read topics
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.slice(0, 8).map((tag, i) => (
                      <span
                        key={`tag-${i}-${tag}`}
                        className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {stack.length > 0 && (
                <div className="mt-4 border-t border-white/10 pt-3">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                    Your stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {stack.slice(0, 12).map((item, i) => (
                      <span
                        key={item.id || `stack-${i}`}
                        className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[11px] text-violet-200"
                      >
                        {item.title}
                      </span>
                    ))}
                    {stack.length > 12 && (
                      <span className="px-1 py-0.5 text-[11px] text-zinc-500">
                        +{stack.length - 12}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {perfectMatches[0] && (
              <div className="glass-panel rounded-xl border-violet-500/25 p-3.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Top match
                </p>
                <a
                  href={dailyDevProfileUrl(perfectMatches[0].username)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2.5 rounded-lg transition hover:bg-white/5"
                >
                  <Avatar
                    src={perfectMatches[0].avatar}
                    name={perfectMatches[0].name}
                    username={perfectMatches[0].username}
                    size={40}
                    ringClassName="ring-2 ring-violet-500/40"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {perfectMatches[0].name}
                    </p>
                    <p className="font-mono text-[11px] text-zinc-500">
                      @{perfectMatches[0].username}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-cyan-500/15 px-2 py-0.5 text-xs font-bold text-cyan-300">
                    {perfectMatches[0].matchScore}%
                  </span>
                </a>
                <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-zinc-400">
                  {perfectMatches[0].matchReason}
                </p>
              </div>
            )}

            {perfectMatches.length > 1 && (
              <div className="glass-card rounded-xl p-3.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Compatible developers
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {perfectMatches.map((match) => (
                    <a
                      key={match.username}
                      href={dailyDevProfileUrl(match.username)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-tile group flex min-w-0 flex-col items-center rounded-xl px-2 py-3 text-center"
                    >
                      <Avatar
                        src={match.avatar}
                        name={match.name}
                        username={match.username}
                        size={40}
                        ringClassName="ring-2 ring-white/10 group-hover:ring-violet-500/50"
                      />
                      <p className="mt-2 w-full truncate text-[11px] font-semibold text-white">
                        {match.name}
                      </p>
                      <p className="w-full truncate font-mono text-[10px] text-zinc-500">
                        @{match.username}
                      </p>
                      <p className="mt-1.5 text-sm font-bold text-cyan-300">
                        {match.matchScore}%
                      </p>
                      <span
                        className={`mt-1 rounded-full px-2 py-0.5 text-[8px] font-medium uppercase tracking-wide ${
                          match.relationship === "similar"
                            ? "bg-violet-500/20 text-violet-300"
                            : "bg-cyan-500/15 text-cyan-400"
                        }`}
                      >
                        {match.relationship === "similar" ? "Similar" : "Fit"}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 lg:sticky lg:top-4 lg:self-start">
            <div className="glass-panel rounded-2xl px-4 py-4 sm:px-5">
              <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
                Share your Tech Identity
              </p>
              <div className="flex justify-center">
                <ShareCard
                  name={profile.name ?? profile.username ?? "Developer"}
                  username={profile.username ?? undefined}
                  avatar={profile.image ?? undefined}
                  persona={techPersonality.title}
                  personaDescription={techPersonality.description}
                  techDna={dnaEntries.map(([label, value]) => ({
                    label,
                    value,
                  }))}
                  tags={tags}
                  topMatch={
                    perfectMatches[0]
                      ? {
                          name: perfectMatches[0].name,
                          username: perfectMatches[0].username,
                          matchScore: perfectMatches[0].matchScore,
                          matchReason: perfectMatches[0].matchReason,
                        }
                      : undefined
                  }
                  skills={
                    [
                      ...new Set(
                        stack.length >= 3
                          ? stack.map((s) => s.title)
                          : [
                              ...stack.map((s) => s.title),
                              ...dnaEntries.map(([label]) => label),
                            ],
                      ),
                    ].slice(0, 3) as [string, string, string] | string[]
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {embedUsername ? (
          <div className="mt-4">
            <EmbedBadgePanel
              compact
              username={embedUsername}
              persona={techPersonality.title}
              appUrl={appOrigin}
              techDna={dnaEntries.map(([label, value]) => ({ label, value }))}
              tags={tags}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}
