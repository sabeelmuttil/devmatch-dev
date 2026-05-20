"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LandingView,
  LoadingView,
  ResultsView,
  type MatchResult,
} from "./components/devmatch-ui";

type AppState = "landing" | "loading" | "results";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<MatchResult | null>(null);

  useEffect(() => {
    if (appState !== "loading") return;

    const interval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 3));
    }, 1400);

    return () => clearInterval(interval);
  }, [appState]);

  const handleSubmit = useCallback(async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Enter your daily.dev username");
      return;
    }

    setError(null);
    setAppState("loading");
    setLoadingStep(0);
    setResult(null);

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setAppState("landing");
        return;
      }

      setResult(data as MatchResult);
      setAppState("results");
    } catch {
      setError("Network error — check your connection and try again.");
      setAppState("landing");
    }
  }, [username]);

  const handleReset = useCallback(() => {
    setAppState("landing");
    setError(null);
    setResult(null);
    setLoadingStep(0);
  }, []);

  if (appState === "loading") {
    return <LoadingView step={loadingStep} />;
  }

  if (appState === "results" && result) {
    return <ResultsView data={result} onReset={handleReset} />;
  }

  return (
    <LandingView
      username={username}
      error={error}
      onUsernameChange={(v) => {
        setUsername(v);
        if (error) setError(null);
      }}
      onSubmit={handleSubmit}
    />
  );
}
