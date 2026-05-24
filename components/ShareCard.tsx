"use client";

import { Avatar } from "@/components/Avatar";
import {
  type DnaEntry,
  type ShareCardPayload,
  type TopMatchEntry,
} from "@/lib/export-card-image";
import {
  publishShareCardImageCached,
  type PublishedShareUrls,
} from "@/lib/publish-share-card";
import { shareUrlsFromToken } from "@/lib/share-url";
import { ShareModal } from "@/components/ShareModal";
import { useClientOrigin } from "@/lib/use-client-origin";
import { useEffect, useMemo, useRef, useState } from "react";

export interface ShareCardProps {
  name: string;
  username?: string;
  avatar?: string | null;
  persona: string;
  personaDescription?: string;
  skills: [string, string, string] | string[];
  techDna?: DnaEntry[];
  tags?: string[];
  topMatch?: TopMatchEntry;
  appUrl?: string;
  className?: string;
}

const DEFAULT_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://dailydevmatch.dev";

const SKILL_ACCENTS = [
  "from-violet-500/30 to-violet-600/10 border-violet-400/40 text-violet-100",
  "from-cyan-500/30 to-cyan-600/10 border-cyan-400/40 text-cyan-100",
  "from-fuchsia-500/30 to-fuchsia-600/10 border-fuchsia-400/40 text-fuchsia-100",
];

const DNA_BAR_COLORS = [
  "from-violet-500 to-purple-600",
  "from-cyan-400 to-blue-500",
  "from-fuchsia-500 to-pink-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
];

function normalizeSkills(
  skills: ShareCardProps["skills"],
): [string, string, string] {
  const padded = [...skills, "—", "—", "—"].slice(0, 3);
  return [padded[0], padded[1], padded[2]];
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  );
}

export function ShareCard({
  name,
  username,
  avatar,
  persona,
  personaDescription,
  skills,
  techDna = [],
  tags = [],
  topMatch,
  appUrl,
  className = "",
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const clientOrigin = useClientOrigin(DEFAULT_APP_URL);

  const topSkills = normalizeSkills(skills);
  const shareAppUrl = appUrl ?? clientOrigin;
  const handle = username ? `@${username}` : null;
  const dnaBars = useMemo(() => techDna.slice(0, 6), [techDna]);
  const displayTags = useMemo(() => tags.filter(Boolean).slice(0, 6), [tags]);

  const skillsForPayload = useMemo(
    () => normalizeSkills(skills).filter((s) => s !== "—"),
    [skills],
  );

  const serverPayload = useMemo<ShareCardPayload>(
    () => ({
      name,
      username,
      avatar,
      persona,
      personaDescription,
      skills: skillsForPayload,
      techDna: dnaBars,
      tags: displayTags,
      topMatch,
    }),
    [
      name,
      username,
      avatar,
      persona,
      personaDescription,
      skillsForPayload,
      dnaBars,
      displayTags,
      topMatch,
    ],
  );

  const publishKey = useMemo(
    () => JSON.stringify(serverPayload),
    [serverPayload],
  );

  const [shareUrls, setShareUrls] = useState<PublishedShareUrls | null>(null);
  const [loadedPublishKey, setLoadedPublishKey] = useState<string | null>(null);

  const shareLinkLoading = loadedPublishKey !== publishKey;
  const activeShareUrls =
    loadedPublishKey === publishKey ? shareUrls : null;

  useEffect(() => {
    let cancelled = false;
    const origin = clientOrigin;
    const key = publishKey;

    void publishShareCardImageCached(serverPayload)
      .then((urls) => {
        if (!cancelled) {
          setShareUrls(urls);
          setLoadedPublishKey(key);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("[ShareCard] share URL build failed:", err);
          if (process.env.NODE_ENV === "development") {
            try {
              setShareUrls({
                ...shareUrlsFromToken(serverPayload, origin),
                storage: "token",
              });
            } catch {
              setShareUrls(null);
            }
          } else {
            setShareUrls(null);
          }
          setLoadedPublishKey(key);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [serverPayload, publishKey, clientOrigin]);

  const tweetInput = useMemo(
    () => ({
      name,
      username,
      persona,
      personaDescription,
      skills: skillsForPayload,
      appUrl: shareAppUrl,
      pageUrl: activeShareUrls?.pageUrl,
    }),
    [
      name,
      username,
      persona,
      personaDescription,
      skillsForPayload,
      shareAppUrl,
      activeShareUrls?.pageUrl,
    ],
  );

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div
        ref={cardRef}
        className="relative w-[360px] shrink-0 overflow-hidden rounded-[20px]"
        style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
      >
        <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400" />
        <div className="absolute inset-[2px] rounded-[18px] bg-[#06060b]" />

        <div className="relative overflow-hidden rounded-[18px]">
          <div className="absolute inset-0 bg-[#08080f]" />
          <div
            data-export-hide="true"
            className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-violet-600/35 blur-3xl"
          />
          <div
            data-export-hide="true"
            className="pointer-events-none absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-cyan-500/25 blur-3xl"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-xs font-bold text-white">
                DD
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                  dailydevmatch.dev
                </p>
                <p className="text-[10px] text-zinc-500">Tech Identity Card</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/15 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-200">
                Verified
              </span>
            </div>
          </div>

          <div className="relative px-5 pb-2 pt-5">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0 overflow-hidden rounded-2xl ring-2 ring-white/20">
                <Avatar
                  src={avatar}
                  name={name}
                  username={username}
                  size={72}
                  shape="rounded"
                  className="!rounded-2xl"
                />
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-base font-bold leading-tight text-white">
                  {name}
                </p>
                {handle && (
                  <p className="mt-0.5 font-mono text-xs text-cyan-400/90">
                    {handle}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-zinc-500">
                  daily.dev developer
                </p>
              </div>
            </div>

            <div className="relative mt-4 overflow-hidden rounded-xl border border-violet-400/25 bg-gradient-to-r from-violet-950/80 via-[#12121a] to-cyan-950/80 px-4 py-3 text-center">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Developer Persona
              </p>
              <p
                className="mt-1.5 text-lg font-bold leading-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #c4b5fd 0%, #67e8f9 50%, #f9a8d4 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {persona}
              </p>
              {personaDescription && (
                <p className="mt-2 text-left text-[11px] leading-relaxed text-zinc-400">
                  {personaDescription}
                </p>
              )}
            </div>
          </div>

          {dnaBars.length > 0 && (
            <div className="relative px-5 py-3">
              <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Tech DNA
              </p>
              <div className="space-y-2">
                {dnaBars.map((entry, i) => (
                  <div key={`dna-${i}-${entry.label}`} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-zinc-300">{entry.label}</span>
                      <span className="font-mono font-medium text-cyan-400">
                        {entry.value}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800/80">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${DNA_BAR_COLORS[i % DNA_BAR_COLORS.length]}`}
                        style={{
                          width: `${Math.min(100, Math.max(0, entry.value))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="relative px-5 py-3">
            <p className="mb-2.5 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Core Stack
            </p>
            <div className="grid grid-cols-3 gap-2">
              {topSkills.map((skill, i) => (
                <div
                  key={`skill-${i}-${skill}`}
                  className={`rounded-xl border bg-gradient-to-b px-2 py-2.5 text-center ${SKILL_ACCENTS[i % SKILL_ACCENTS.length]}`}
                >
                  <p className="text-[11px] font-semibold leading-tight">
                    {skill}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {displayTags.length > 0 && (
            <div className="relative px-5 pb-3">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Most Read Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {displayTags.map((tag, i) => (
                  <span
                    key={`tag-${i}-${tag}`}
                    className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300"
                  >
                    #{tag.replace(/^#/, "")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {topMatch && (
            <div className="relative mx-5 mb-3 rounded-xl border border-violet-500/25 bg-violet-950/40 px-3.5 py-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Top Match
              </p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {topMatch.name}
                  </p>
                  <p className="font-mono text-[10px] text-zinc-500">
                    @{topMatch.username}
                  </p>
                </div>
                <div className="shrink-0 rounded-lg bg-cyan-500/15 px-2 py-1 text-center">
                  <p className="text-sm font-bold text-cyan-300">
                    {topMatch.matchScore}%
                  </p>
                  <p className="text-[8px] uppercase text-zinc-500">match</p>
                </div>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-zinc-400 line-clamp-2">
                {topMatch.matchReason}
              </p>
            </div>
          )}

          <div className="relative flex items-center justify-between border-t border-white/10 bg-black/30 px-5 py-3.5">
            <div>
              <p className="font-mono text-[9px] text-zinc-600">
                ID · {(username ?? name).slice(0, 14).toUpperCase()}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-zinc-500">
                #dailydevhackathon
              </p>
            </div>
            <div className="flex items-end gap-0.5">
              {[...Array(10)].map((_, i) => (
                <div
                  key={`bar-${i}`}
                  className="w-1 rounded-sm"
                  style={{
                    height: `${12 + (i % 5) * 4}px`,
                    background:
                      i % 3 === 0
                        ? "linear-gradient(to top, #8b5cf6, #22d3ee)"
                        : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShareOpen(true)}
        className="group flex w-full max-w-[360px] items-center justify-center gap-2.5 rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-600/25 to-cyan-600/20 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition-all hover:border-violet-400/50 hover:from-violet-600/35 hover:to-cyan-600/30 active:scale-[0.98]"
      >
        <ShareIcon className="h-4 w-4 text-violet-200 group-hover:text-white" />
        {shareLinkLoading ? "Preparing share…" : "Share"}
      </button>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        cardRef={cardRef}
        serverPayload={serverPayload}
        name={name}
        username={username}
        persona={persona}
        personaDescription={personaDescription}
        skills={topSkills.filter((s) => s !== "—")}
        appUrl={shareAppUrl}
        shareUrls={activeShareUrls}
        shareLinkLoading={shareLinkLoading}
        tweetInput={tweetInput}
      />
    </div>
  );
}
