"use client";

import { EmbedBadge } from "@/components/EmbedBadge";
import type { MatchResult } from "@/app/components/devmatch-ui";
import { profilePageUrl } from "@/lib/embed-snippet";
import { normalizeUsernameRoute } from "@/lib/username-route";
import { useClientOrigin } from "@/lib/use-client-origin";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://dailydevmatch.dev";

const EMBED_RESIZE = "devmatch-embed-resize";

function postEmbedHeight(root: HTMLElement | null) {
  if (!root || typeof window === "undefined") return;
  const height = Math.ceil(root.getBoundingClientRect().height + 8);
  window.parent.postMessage({ type: EMBED_RESIZE, height }, "*");
}

export default function EmbedBadgePage() {
  const params = useParams();
  const rootRef = useRef<HTMLDivElement>(null);
  const raw =
    typeof params.username === "string" ? decodeURIComponent(params.username) : "";
  const username = normalizeUsernameRoute(raw) ?? "";

  const origin = useClientOrigin(DEFAULT_APP_URL);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runMatch = useCallback(async () => {
    if (!username) return;
    setState("loading");
    setError(null);

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not load identity");
        setState("error");
        return;
      }
      setResult(data as MatchResult);
      setState("ready");
    } catch {
      setError("Network error");
      setState("error");
    }
  }, [username]);

  useEffect(() => {
    if (!username) return;
    void runMatch();
  }, [username, runMatch]);

  useEffect(() => {
    if (state !== "ready") return;
    const root = rootRef.current;
    postEmbedHeight(root);
    const ro = new ResizeObserver(() => postEmbedHeight(root));
    if (root) ro.observe(root);
    return () => ro.disconnect();
  }, [state, result]);

  if (!username) {
    return (
      <div ref={rootRef} className="p-4 text-center text-sm text-zinc-500">
        Invalid username
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div ref={rootRef} className="p-3">
        <div className="mx-auto max-w-[360px] animate-pulse rounded-2xl border border-white/10 bg-[#0f0f16] p-4">
          <div className="flex gap-3">
            <div className="h-12 w-12 rounded-xl bg-zinc-800" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-28 rounded bg-zinc-800" />
              <div className="h-2 w-20 rounded bg-zinc-800/80" />
              <div className="h-3 w-full rounded bg-zinc-800/60" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-2 rounded bg-zinc-800/80" />
            <div className="h-2 rounded bg-zinc-800/60" />
            <div className="h-2 rounded bg-zinc-800/40" />
          </div>
        </div>
      </div>
    );
  }

  if (state === "error" || !result) {
    return (
      <div ref={rootRef} className="p-4 text-center">
        <p className="text-sm text-zinc-400">{error ?? "Not found"}</p>
        <a
          href={profilePageUrl(origin, username)}
          className="mt-2 inline-block text-xs text-violet-400 hover:text-violet-300"
        >
          Try on dailydevmatch.dev →
        </a>
      </div>
    );
  }

  const { profile, techPersonality, tags } = result;
  const dnaEntries = Object.entries(techPersonality.techDna)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value }));

  return (
    <div ref={rootRef} className="p-2 sm:p-3">
      <EmbedBadge
        compact
        name={profile.name ?? profile.username ?? "Developer"}
        username={profile.username ?? username}
        avatar={profile.image}
        persona={techPersonality.title}
        techDna={dnaEntries}
        tags={tags}
        profileUrl={profilePageUrl(origin, profile.username ?? username)}
      />
    </div>
  );
}
