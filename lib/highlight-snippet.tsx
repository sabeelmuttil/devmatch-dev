import type { ReactNode } from "react";

export type SnippetLanguage = "html" | "markdown";

type Token = { text: string; className: string };

function pushText(tokens: Token[], text: string, className: string) {
  if (text) tokens.push({ text, className });
}

function highlightHtmlLine(line: string): Token[] {
  const tokens: Token[] = [];
  const re =
    /(<\/?[a-zA-Z][a-zA-Z0-9-]*|>|="[^"]*"|='[^']*'|="[^"]*|[^<>=]+)/g;
  let m: RegExpExecArray | null;
  let last = 0;

  while ((m = re.exec(line)) !== null) {
    if (m.index > last) {
      pushText(tokens, line.slice(last, m.index), "text-zinc-400");
    }
    const part = m[0];
    if (part.startsWith("</") || (part.startsWith("<") && !part.startsWith("<!"))) {
      pushText(tokens, part, "text-cyan-300");
    } else if (part === ">" || part === "/>") {
      pushText(tokens, part, "text-zinc-500");
    } else if (part.startsWith('="') || part.startsWith("='")) {
      pushText(tokens, part, "text-emerald-300");
    } else {
      pushText(tokens, part, "text-violet-300");
    }
    last = m.index + part.length;
  }
  if (last < line.length) {
    pushText(tokens, line.slice(last), "text-zinc-400");
  }
  return tokens.length ? tokens : [{ text: line, className: "text-zinc-400" }];
}

function highlightMarkdownLine(line: string): Token[] {
  const tokens: Token[] = [];
  const linkRe = /(\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = linkRe.exec(line)) !== null) {
    if (m.index > last) {
      pushText(tokens, line.slice(last, m.index), "text-zinc-400");
    }
    pushText(tokens, m[1], "text-cyan-300");
    last = m.index + m[1].length;
  }
  if (last < line.length) {
    const rest = line.slice(last);
    if (rest.startsWith("###")) {
      pushText(tokens, rest, "text-violet-300");
    } else if (rest.startsWith("**")) {
      pushText(tokens, rest, "text-zinc-200");
    } else {
      pushText(tokens, rest, "text-zinc-400");
    }
  }
  return tokens.length ? tokens : [{ text: line, className: "text-zinc-400" }];
}

function highlightLine(line: string, language: SnippetLanguage): Token[] {
  if (language === "markdown") return highlightMarkdownLine(line);
  return highlightHtmlLine(line);
}

export function snippetFilename(
  kind: "iframe" | "script" | "readme",
  username: string,
): string {
  if (kind === "readme") return "README.md";
  if (kind === "script") return `embed-${username}.html`;
  return `embed-${username}.html`;
}

export function snippetLanguage(
  kind: "iframe" | "script" | "readme",
): SnippetLanguage {
  return kind === "readme" ? "markdown" : "html";
}

export function renderHighlightedSnippet(
  code: string,
  language: SnippetLanguage,
): ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, lineIndex) => (
    <div
      key={`line-${lineIndex}`}
      className="flex min-h-[1.35rem] leading-[1.35rem]"
    >
      <span className="code-gutter w-8 shrink-0 select-none pr-3 text-right text-[10px] text-zinc-600">
        {lineIndex + 1}
      </span>
      <span className="min-w-0 flex-1 whitespace-pre-wrap break-all">
        {highlightLine(line, language).map((token, i) => (
          <span key={i} className={token.className}>
            {token.text}
          </span>
        ))}
        {line === "" ? "\u00a0" : null}
      </span>
    </div>
  ));
}
