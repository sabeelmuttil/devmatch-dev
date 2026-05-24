"use client";

import { CodeSnippetBlock } from "@/components/CodeSnippetBlock";
import {
  buildIframeSnippet,
  buildReadmeSnippet,
  buildScriptSnippet,
  embedPageUrl,
} from "@/lib/embed-snippet";
import { copyTextToClipboard } from "@/lib/share-clipboard";
import { useCallback, useMemo, useState } from "react";

type SnippetKind = "iframe" | "script" | "readme";

export interface EmbedBadgePanelProps {
  username: string;
  persona: string;
  appUrl: string;
  techDna?: { label: string; value: number }[];
  tags?: string[];
  /** Tighter layout for results page — codes in a row on large screens. */
  compact?: boolean;
}

export function EmbedBadgePanel({
  username,
  persona,
  appUrl,
  techDna = [],
  tags = [],
  compact = false,
}: EmbedBadgePanelProps) {
  const [copied, setCopied] = useState<SnippetKind | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const snippets = useMemo(
    () => ({
      iframe: buildIframeSnippet(appUrl, username),
      script: buildScriptSnippet(appUrl, username),
      readme: buildReadmeSnippet(appUrl, username, persona, {
        techDna: techDna.slice(0, 3),
        tags: tags.filter(Boolean).slice(0, 3),
      }),
    }),
    [appUrl, username, persona, techDna, tags],
  );

  const previewSrc = embedPageUrl(appUrl, username);

  const handleCopy = useCallback(
    async (kind: SnippetKind) => {
      const ok = await copyTextToClipboard(snippets[kind]);
      if (ok) {
        setCopied(kind);
        window.setTimeout(() => setCopied(null), 2000);
      }
    },
    [snippets],
  );

  const blocks: {
    kind: SnippetKind;
    label: string;
  }[] = [
    { kind: "iframe", label: "HTML" },
    { kind: "script", label: "Script" },
    { kind: "readme", label: "README" },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Embed on your site
          </p>
          <p
            className={`text-zinc-400 ${compact ? "mt-1 text-xs" : "mt-1 text-sm"}`}
          >
            Use <strong className="text-zinc-300">iframe</strong> or{" "}
            <strong className="text-zinc-300">script (defer)</strong> on your
            site. GitHub README only supports the image badge (no
            iframe/script).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPreviewOpen((v) => !v)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
        >
          {previewOpen ? "Hide preview" : "Preview"}
        </button>
      </div>

      {previewOpen && (
        <div
          className={`flex justify-center rounded-xl border border-violet-500/20 bg-[#06060b] ${compact ? "mt-4 p-3" : "mb-4 mt-4 p-4"}`}
        >
          <iframe
            src={previewSrc}
            title="Embed preview"
            width={360}
            height={220}
            className="max-w-full rounded-xl border-0"
            loading="lazy"
          />
        </div>
      )}

      <div
        className={
          compact
            ? "mt-4 grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3"
            : "mt-4 space-y-3"
        }
      >
        {blocks.map(({ kind, label }) => (
          <CodeSnippetBlock
            key={kind}
            kind={kind}
            label={label}
            code={snippets[kind]}
            username={username}
            copied={copied === kind}
            onCopy={() => void handleCopy(kind)}
          />
        ))}
      </div>
    </div>
  );
}
