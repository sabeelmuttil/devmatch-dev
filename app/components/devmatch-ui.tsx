"use client";

import * as React from "react";
import Image from "next/image";

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

function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-60" />
      <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-cyan-500/15 blur-[100px]" />
      <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-[100px]" />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between px-4 py-5 sm:px-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 font-mono text-sm font-bold text-white shadow-lg shadow-violet-500/30">
          DM
        </div>
        <span className="font-semibold tracking-tight text-white">
          DevMatch<span className="text-cyan-400">.dev</span>
        </span>
      </div>
      <span className="hidden rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 sm:inline-block">
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
        <div className="mx-auto w-full max-w-2xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
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
            <div className="glow-border group flex items-center overflow-hidden rounded-2xl bg-[#0f0f16]/90 backdrop-blur-sm transition-all focus-within:shadow-[0_0_32px_-4px_rgba(139,92,246,0.6)]">
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
              className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-5 text-center backdrop-blur-sm"
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

export function LoadingView({ step }: { step: number }) {
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
          <div className="glow-border overflow-hidden rounded-2xl bg-[#0f0f16]/80 backdrop-blur-md">
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
                  style={{ animation: i === codeIndex ? "typing 1s ease infinite" : undefined }}
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
                className="animate-pulse-glow rounded-xl border border-white/5 bg-[#14141f]/80 p-5"
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
      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800/80">
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
  const { profile, techPersonality, perfectMatches, tags, stack } = data;
  const dnaEntries = Object.entries(techPersonality.techDna).sort(
    ([, a], [, b]) => b - a,
  );

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <SiteHeader />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={profile.name ?? profile.username ?? "Profile"}
                width={56}
                height={56}
                className="rounded-full ring-2 ring-violet-500/50"
                unoptimized
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 font-bold text-white">
                {(profile.name ?? profile.username ?? "?")[0]?.toUpperCase()}
              </div>
            )}
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
            className="self-start rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-violet-500/40 hover:text-white sm:self-center"
          >
            New match
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="glow-border lg:col-span-3 rounded-2xl bg-[#0f0f16]/90 p-6 backdrop-blur-sm sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Tech DNA</h3>
            </div>
            <div className="space-y-4">
              {dnaEntries.map(([label, value], i) => (
                <DnaBar
                  key={label}
                  label={label}
                  value={value}
                  colorClass={DNA_COLORS[i % DNA_COLORS.length]}
                  delay={i * 120}
                />
              ))}
            </div>
            {stack.length > 0 && (
              <div className="mt-8 border-t border-white/5 pt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Your stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {stack.slice(0, 12).map((item) => (
                    <span
                      key={item.id}
                      className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-200"
                    >
                      {item.title}
                    </span>
                  ))}
                  {stack.length > 12 && (
                    <span className="rounded-lg px-2 py-1 text-xs text-zinc-500">
                      +{stack.length - 12} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="glow-border-cyan lg:col-span-2 flex flex-col rounded-2xl bg-gradient-to-br from-violet-950/80 via-[#0f0f16] to-cyan-950/40 p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-wider text-cyan-400/80">
              Developer Persona
            </p>
            <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
              <div className="animate-float relative">
                <div className="absolute inset-0 rounded-full bg-violet-500/30 blur-2xl" />
                <div className="relative rounded-2xl border border-violet-400/40 bg-gradient-to-br from-violet-600/30 to-cyan-500/20 px-6 py-5 shadow-lg shadow-violet-500/20">
                  <span className="text-2xl font-bold text-gradient sm:text-3xl">
                    {techPersonality.title}
                  </span>
                </div>
              </div>
              <p className="mt-6 text-sm leading-relaxed text-zinc-400">
                {techPersonality.description}
              </p>
            </div>
            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                {tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white sm:text-2xl">
                Compatible Developers
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                AI-curated matches based on your Tech DNA
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {perfectMatches.map((match) => (
              <article
                key={match.username}
                className="group glow-border flex flex-col rounded-2xl bg-[#0f0f16]/90 p-5 backdrop-blur-sm transition-transform hover:-translate-y-1 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={match.avatar}
                      alt={match.name}
                      width={48}
                      height={48}
                      className="rounded-full ring-2 ring-white/10 transition-all group-hover:ring-violet-500/50"
                      unoptimized
                    />
                    <div>
                      <p className="font-semibold text-white">{match.name}</p>
                      <p className="font-mono text-xs text-zinc-500">
                        @{match.username}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-500/20 px-3 py-1.5 text-center">
                    <p className="text-lg font-bold text-cyan-300">
                      {match.matchScore}%
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                      Match
                    </p>
                  </div>
                </div>

                <span
                  className={`mt-4 inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    match.relationship === "similar"
                      ? "bg-violet-500/15 text-violet-300"
                      : "bg-cyan-500/15 text-cyan-300"
                  }`}
                >
                  {match.relationship === "similar"
                    ? "Similar stack"
                    : "Complements you"}
                </span>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
                  {match.matchReason}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {match.stack.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <a
                  href={`https://app.daily.dev/${match.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 py-3 text-sm font-semibold text-violet-200 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-200"
                >
                  Connect
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
