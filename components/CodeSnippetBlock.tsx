"use client";

import {
  renderHighlightedSnippet,
  snippetFilename,
  snippetLanguage,
} from "@/lib/highlight-snippet";
import { useMemo } from "react";

export interface CodeSnippetBlockProps {
  kind: "iframe" | "script" | "readme";
  label: string;
  code: string;
  username: string;
  copied: boolean;
  onCopy: () => void;
}

export function CodeSnippetBlock({
  kind,
  label,
  code,
  username,
  copied,
  onCopy,
}: CodeSnippetBlockProps) {
  const language = snippetLanguage(kind);
  const filename = snippetFilename(kind, username);

  const lines = useMemo(
    () => renderHighlightedSnippet(code, language),
    [code, language],
  );

  return (
    <div className="code-editor flex h-full min-h-[10.5rem] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a12]/95 shadow-inner shadow-black/40">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#12121c]/90 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="truncate font-mono text-[10px] text-zinc-500">
            {filename}
          </span>
          <span className="hidden rounded bg-zinc-800/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-500 sm:inline">
            {label}
          </span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 rounded-md border border-violet-500/35 bg-violet-500/15 px-2.5 py-1 font-mono text-[10px] font-medium text-violet-200 transition hover:bg-violet-500/25"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="code-editor-body min-h-0 flex-1 overflow-auto p-2 font-mono text-[11px]">
        {lines}
      </div>
    </div>
  );
}
