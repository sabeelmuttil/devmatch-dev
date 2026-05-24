"use client";

import { Avatar } from "@/components/Avatar";
import {
  captureCardBlob,
  downloadBlob,
  type DnaEntry,
  type ShareCardPayload,
  type TopMatchEntry,
} from "@/lib/export-card-image";
import { proxiedAvatarUrl } from "@/lib/avatar";
import {
  buildPublicShareUrls,
  publishShareCardImageCached,
  type PublishedShareUrls,
} from "@/lib/publish-share-card";
import { buildXIntentUrl, buildXTweetText } from "@/lib/share-card-text";
import { copyPngToClipboard, copyTextToClipboard } from "@/lib/share-clipboard";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "dev"
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
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
  const shareOnXLock = useRef(false);
  const [exporting, setExporting] = useState<"png" | "jpeg" | "x" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [shareHint, setShareHint] = useState<string | null>(null);

  const topSkills = normalizeSkills(skills);
  const shareAppUrl =
    appUrl ??
    (typeof window !== "undefined" ? window.location.origin : DEFAULT_APP_URL);
  const handle = username ? `@${username}` : null;
  const dnaBars = useMemo(() => techDna.slice(0, 6), [techDna]);
  const displayTags = useMemo(() => tags.filter(Boolean).slice(0, 6), [tags]);

  const techDnaKey = techDna
    .slice(0, 6)
    .map((d) => `${d.label}:${d.value}`)
    .join("|");
  const tagsKey = tags.filter(Boolean).slice(0, 6).join("|");

  const serverPayload = useMemo<ShareCardPayload>(
    () => ({
      name,
      username,
      avatar,
      persona,
      personaDescription,
      skills: topSkills.filter((s) => s !== "—"),
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
      topSkills[0],
      topSkills[1],
      topSkills[2],
      techDnaKey,
      tagsKey,
      topMatch?.name,
      topMatch?.username,
      topMatch?.matchScore,
      topMatch?.matchReason,
    ],
  );

  const [shareUrls, setShareUrls] = useState<PublishedShareUrls | null>(null);
  const [shareLinkLoading, setShareLinkLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const origin = window.location.origin;

    setShareLinkLoading(true);
    publishShareCardImageCached(serverPayload)
      .then((urls) => {
        if (!cancelled) setShareUrls(urls);
      })
      .catch(() => {
        if (!cancelled) {
          try {
            setShareUrls(buildPublicShareUrls(serverPayload, origin));
          } catch (err) {
            console.warn("[ShareCard] share URL build failed:", err);
            setShareUrls(null);
          }
        }
      })
      .finally(() => {
        if (!cancelled) setShareLinkLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [serverPayload]);

  const displayAvatarSrc = useMemo(() => {
    if (typeof window === "undefined") return avatar ?? undefined;
    return proxiedAvatarUrl(window.location.origin, avatar, username ?? name);
  }, [avatar, username, name]);

  const tweetInput = useMemo(
    () => ({
      name,
      username,
      persona,
      skills: topSkills.filter((s) => s !== "—"),
      appUrl: shareAppUrl,
    }),
    [name, username, persona, topSkills, shareAppUrl],
  );

  const handleShareOnX = useCallback(() => {
    const node = cardRef.current;
    if (!node || shareOnXLock.current) return;

    shareOnXLock.current = true;
    setExporting("x");
    setExportError(null);
    setShareHint(null);

    const filename = `tech-identity-${slugify(username ?? name)}.png`;
    const origin =
      typeof window !== "undefined" ? window.location.origin : shareAppUrl;
    let pageUrl = shareUrls?.pageUrl ?? "";
    if (!pageUrl) {
      try {
        pageUrl = buildPublicShareUrls(serverPayload, origin).pageUrl;
      } catch (encodeErr) {
        console.warn("[ShareCard] share page URL build failed:", encodeErr);
      }
    }
    const tweetText = buildXTweetText(tweetInput);
    const xUrl = buildXIntentUrl({
      text: tweetText,
      pageUrl: pageUrl || undefined,
      appUrl: shareAppUrl,
    });

    // Must open X in the same click tick — async window.open is blocked as a popup.
    const xWindow = window.open(
      xUrl,
      "_blank",
      "noopener,noreferrer",
    );

    if (!xWindow) {
      shareOnXLock.current = false;
      setExporting(null);
      setShareHint(
        "Could not open X. Allow pop-ups for this site, then try again.",
      );
      return;
    }

    void (async () => {
      try {
        const blob = await captureCardBlob(node, "png", serverPayload, {
          preferClient: true,
        });
        const copiedImage = await copyPngToClipboard(blob);
        if (!copiedImage) downloadBlob(blob, filename);

        setShareHint(
          copiedImage
            ? "X is open with your full card link attached. PNG copied — paste with ⌘V / Ctrl+V for the image."
            : "X is open with your full card link attached. Use the downloaded PNG or copy the link below.",
        );
      } catch (err) {
        console.error("[ShareCard] share prep failed:", err);
        setShareHint(
          "X is open. Card image copy failed — use the image link in your tweet.",
        );
      } finally {
        shareOnXLock.current = false;
        setExporting(null);
      }
    })();
  }, [username, name, serverPayload, tweetInput, shareAppUrl, shareUrls]);

  const downloadCard = useCallback(
    async (format: "png" | "jpeg") => {
      const node = cardRef.current;
      if (!node) return;

      setExporting(format);
      setExportError(null);
      setShareHint(null);

      try {
        const blob = await captureCardBlob(node, format, serverPayload, {
          preferClient: true,
        });
        downloadBlob(
          blob,
          `tech-identity-${slugify(username ?? name)}.${format}`,
        );
      } catch (err) {
        console.error("[ShareCard] export failed:", err);
        setExportError(
          err instanceof Error
            ? err.message
            : "Could not export image. Try again in a moment.",
        );
      } finally {
        setExporting(null);
      }
    },
    [name, username, serverPayload],
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
                  src={displayAvatarSrc}
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

      {exportError && (
        <p className="max-w-[360px] text-center text-xs text-red-300">
          {exportError}
        </p>
      )}
      {shareHint && !exportError && (
        <p className="max-w-[360px] text-center text-xs text-cyan-300/90">
          {shareHint}
        </p>
      )}

      <div className="flex w-full max-w-[360px] flex-col gap-2">
        <button
          type="button"
          disabled={!!exporting || shareLinkLoading || !shareUrls}
          onClick={handleShareOnX}
          className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-gradient-to-r from-zinc-900 to-zinc-800 px-5 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/25 hover:from-zinc-800 hover:to-zinc-700 active:scale-[0.98] disabled:opacity-50"
        >
          <XIcon className="h-4 w-4 text-zinc-300 group-hover:text-white" />
          {exporting === "x"
            ? "Preparing card…"
            : shareLinkLoading || !shareUrls
              ? "Preparing link…"
              : "Share on X"}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!!exporting}
            onClick={() => downloadCard("png")}
            className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-200 transition-all hover:bg-cyan-500/20 disabled:opacity-50"
          >
            <DownloadIcon className="h-4 w-4" />
            {exporting === "png" ? "Saving…" : "Download PNG"}
          </button>
          <button
            type="button"
            disabled={!!exporting}
            onClick={() => downloadCard("jpeg")}
            className="flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition-all hover:bg-violet-500/20 disabled:opacity-50"
          >
            <DownloadIcon className="h-4 w-4" />
            {exporting === "jpeg" ? "Saving…" : "Download JPEG"}
          </button>
        </div>

        {shareUrls ? (
          <div className="rounded-lg border border-white/10 bg-black/40 p-3">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Share link (opens full screen)
              {shareUrls.storage === "token"
                ? " · long URL (add Redis on Vercel for short links)"
                : ""}
            </p>
            <p className="break-all font-mono text-[11px] leading-relaxed text-cyan-300/90">
              {shareUrls.pageUrl}
            </p>
            <button
              type="button"
              onClick={() => {
                void copyTextToClipboard(shareUrls.pageUrl).then((ok) => {
                  setShareHint(
                    ok ? "Card link copied to clipboard." : "Could not copy link.",
                  );
                });
              }}
              className="mt-2 text-[10px] font-medium text-violet-300 hover:text-violet-200"
            >
              Copy link
            </button>
          </div>
        ) : null}

        <p className="text-center text-[10px] leading-relaxed text-zinc-600">
          Opens X with your share page link (preview image on X). PNG is copied
          so you can paste the full card into the composer.
        </p>
      </div>
    </div>
  );
}
