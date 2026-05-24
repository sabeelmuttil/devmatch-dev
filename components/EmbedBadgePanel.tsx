"use client";

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
  /** Tighter layout for results page — codes in a row on large screens. */
  compact?: boolean;
}

function CodeBlock({
  label,
  code,
  onCopy,
  copied,
}: {
  label: string;
  code: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex h-full min-h-[9.5rem] flex-col rounded-xl border border-white/10 bg-black/50">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-200 transition hover:bg-violet-500/20"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto p-3 font-mono text-[10px] leading-relaxed text-zinc-400 whitespace-pre-wrap break-all">
        {code}
      </pre>
    </div>
  );
}

export function EmbedBadgePanel({
  username,
  persona,
  appUrl,
  compact = false,
}: EmbedBadgePanelProps) {
  const [copied, setCopied] = useState<SnippetKind | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const snippets = useMemo(
    () => ({
      iframe: buildIframeSnippet(appUrl, username),
      script: buildScriptSnippet(appUrl, username),
      readme: buildReadmeSnippet(appUrl, username, persona),
    }),
    [appUrl, username, persona],
  );

  const previewSrc = embedPageUrl(appUrl, username);

  const handleCopy = useCallback(async (kind: SnippetKind) => {
    const ok = await copyTextToClipboard(snippets[kind]);
    if (ok) {
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    }
  }, [snippets]);

  return (
    <div
      className="rounded-2xl border border-white/5 bg-[#0f0f16]/60 p-5 backdrop-blur-sm sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Embed on your site
          </p>
          <p
            className={`text-zinc-400 ${compact ? "mt-1 text-xs" : "mt-1 text-sm"}`}
          >
            Add your Tech Identity badge to a portfolio, Notion page, or GitHub
            README.
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
        <CodeBlock
          label="HTML (iframe)"
          code={snippets.iframe}
          onCopy={() => void handleCopy("iframe")}
          copied={copied === "iframe"}
        />
        <CodeBlock
          label="Script tag"
          code={snippets.script}
          onCopy={() => void handleCopy("script")}
          copied={copied === "script"}
        />
        <CodeBlock
          label="GitHub README"
          code={snippets.readme}
          onCopy={() => void handleCopy("readme")}
          copied={copied === "readme"}
        />
      </div>
    </div>
  );
}
