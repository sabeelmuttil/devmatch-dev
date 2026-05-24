"use client";

import {
  LoadingView,
  ResultsView,
  type MatchResult,
} from "@/app/components/devmatch-ui";
import { normalizeUsernameRoute } from "@/lib/username-route";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type PageState = "loading" | "results" | "error";

export default function UserResultsPage() {
  const params = useParams();
  const router = useRouter();
  const fetchKeyRef = useRef<string | null>(null);

  const rawParam =
    typeof params.username === "string" ? decodeURIComponent(params.username) : "";
  const username = normalizeUsernameRoute(rawParam) ?? "";

  const [pageState, setPageState] = useState<PageState>("loading");
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      router.replace("/");
      return;
    }
  }, [username, router]);

  useEffect(() => {
    if (pageState !== "loading") return;

    const interval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 3));
    }, 1400);

    return () => clearInterval(interval);
  }, [pageState]);

  const runMatch = useCallback(async () => {
    if (!username) return;

    setPageState("loading");
    setLoadingStep(0);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setPageState("error");
        return;
      }

      setResult(data as MatchResult);
      setPageState("results");
    } catch {
      setError("Network error — check your connection and try again.");
      setPageState("error");
    }
  }, [username]);

  useEffect(() => {
    if (!username) return;
    if (fetchKeyRef.current === username) return;
    fetchKeyRef.current = username;
    void runMatch();
  }, [username, runMatch]);

  const handleReset = useCallback(() => {
    router.push("/");
  }, [router]);

  if (!username) {
    return null;
  }

  if (pageState === "loading") {
    return <LoadingView step={loadingStep} username={username} />;
  }

  if (pageState === "results" && result) {
    return <ResultsView data={result} onReset={handleReset} />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <div className="glow-border max-w-md rounded-2xl bg-[#0f0f16]/90 p-8 text-center backdrop-blur-sm">
        <p className="text-lg font-semibold text-white">Could not load match</p>
        <p className="mt-2 text-sm text-zinc-400">
          {error ?? "Unknown error"}
        </p>
        <p className="mt-1 font-mono text-sm text-cyan-400">@{username}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => void runMatch()}
            className="rounded-xl border border-violet-500/40 bg-violet-500/15 px-5 py-2.5 text-sm font-semibold text-violet-200 hover:bg-violet-500/25"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-zinc-300 hover:text-white"
          >
            Back home
          </button>
        </div>
      </div>
    </div>
  );
}
