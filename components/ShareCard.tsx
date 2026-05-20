"use client";

import Image from "next/image";

export interface ShareCardProps {
  name: string;
  avatar: string;
  persona: string;
  /** Top 3 skills — pass exactly 3 for best layout */
  skills: [string, string, string] | string[];
  /** App URL included in the X post (defaults to current origin) */
  appUrl?: string;
  className?: string;
}

const DEFAULT_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://devmatch.dev";

function normalizeSkills(skills: ShareCardProps["skills"]): [string, string, string] {
  const padded = [...skills, "—", "—", "—"].slice(0, 3);
  return [padded[0], padded[1], padded[2]];
}

function buildShareUrl(
  persona: string,
  skills: [string, string, string],
  appUrl: string,
): string {
  const text = [
    `Just unlocked my Tech Identity on DevMatch.dev`,
    ``,
    `Persona: ${persona}`,
    `Top skills: ${skills.filter((s) => s !== "—").join(" · ")}`,
    ``,
    `#dailydevhackathon`,
  ].join("\n");

  const params = new URLSearchParams({
    text,
    url: appUrl,
  });

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ShareCard({
  name,
  avatar,
  persona,
  skills,
  appUrl,
  className = "",
}: ShareCardProps) {
  const topSkills = normalizeSkills(skills);
  const shareAppUrl =
    appUrl ??
    (typeof window !== "undefined" ? window.location.origin : DEFAULT_APP_URL);

  const handleShareOnX = () => {
    const url = buildShareUrl(persona, topSkills, shareAppUrl);
    window.open(url, "_blank", "noopener,noreferrer,width=550,height=520");
  };

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`flex flex-col items-center gap-5 ${className}`}>
      {/* Tech Identity Card — premium dev pass */}
      <article
        className="relative w-full max-w-[340px] overflow-hidden rounded-2xl p-[1px] shadow-2xl shadow-violet-500/20"
        aria-label={`Tech Identity Card for ${name}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 opacity-90" />
        <div className="relative overflow-hidden rounded-2xl bg-[#0a0a12]/75 backdrop-blur-xl">
          {/* Holographic accents */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-violet-500/25 blur-2xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 4px,
                rgba(255,255,255,0.5) 4px,
                rgba(255,255,255,0.5) 5px
              )`,
            }}
          />

          <div className="relative border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 text-[10px] font-bold text-white">
                  DM
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
                    DevMatch.dev
                  </p>
                  <p className="text-[9px] text-zinc-500">Tech Identity Pass</p>
                </div>
              </div>
              <div className="rounded border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-amber-300">
                Verified
              </div>
            </div>
          </div>

          <div className="relative px-4 pb-4 pt-5">
            <div className="flex gap-4">
              <div className="relative shrink-0">
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-violet-400 to-cyan-400 opacity-80" />
                <div className="relative h-[72px] w-[72px] overflow-hidden rounded-[10px] bg-zinc-900 ring-2 ring-white/10">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={name}
                      width={72}
                      height={72}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-700 to-cyan-800 text-xl font-bold text-white">
                      {initials}
                    </div>
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="truncate text-base font-bold leading-tight text-white">
                  {name}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-zinc-400">
                  daily.dev developer
                </p>
                <div className="mt-2.5 inline-flex max-w-full rounded-lg border border-violet-400/30 bg-violet-500/15 px-2 py-1 backdrop-blur-sm">
                  <span className="truncate bg-gradient-to-r from-violet-200 to-cyan-200 bg-clip-text text-xs font-semibold text-transparent">
                    {persona}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
                Core Stack
              </p>
              <div className="grid grid-cols-3 gap-2">
                {topSkills.map((skill, i) => (
                  <div
                    key={`${skill}-${i}`}
                    className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-center backdrop-blur-sm"
                  >
                    <p className="truncate font-mono text-[10px] font-medium text-cyan-200">
                      {skill}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
              <p className="font-mono text-[9px] text-zinc-600">
                ID · {name.slice(0, 12).replace(/\s/g, "").toUpperCase() || "DEV"}
              </p>
              <div className="flex gap-0.5">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-6 w-0.5 rounded-sm ${
                      i % 3 === 0 ? "bg-violet-400/60" : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>

      <button
        type="button"
        onClick={handleShareOnX}
        className="group flex w-full max-w-[340px] items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 active:scale-[0.98]"
      >
        <XIcon className="h-4 w-4 text-zinc-300 transition-colors group-hover:text-white" />
        Share on X
      </button>
    </div>
  );
}
