"use client";

import { Avatar } from "@/components/Avatar";

const DNA_COLORS = [
  "from-violet-500 to-purple-600",
  "from-cyan-400 to-blue-500",
  "from-fuchsia-500 to-pink-500",
];

export interface EmbedBadgeProps {
  name: string;
  username: string;
  avatar?: string | null;
  persona: string;
  techDna: { label: string; value: number }[];
  tags?: string[];
  profileUrl: string;
  compact?: boolean;
}

export function EmbedBadge({
  name,
  username,
  avatar,
  persona,
  techDna,
  tags = [],
  profileUrl,
  compact = false,
}: EmbedBadgeProps) {
  const dnaBars = techDna.slice(0, compact ? 3 : 4);
  const displayTags = tags.filter(Boolean).slice(0, 3);
  const handle = `@${username}`;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full max-w-[360px] no-underline"
      style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
    >
      <article className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-[#06060b] shadow-lg shadow-violet-950/40 transition hover:border-violet-400/50">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/10" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 text-[10px] font-bold text-white">
              DD
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/90">
              dailydevmatch.dev
            </span>
          </div>
          <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-200">
            Verified
          </span>
        </div>

        <div className="relative px-4 pb-3 pt-3">
          <div className="flex items-start gap-3">
            <Avatar
              src={avatar}
              name={name}
              username={username}
              size={compact ? 48 : 52}
              shape="rounded"
              className="!rounded-xl"
              ringClassName="ring-2 ring-white/15"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{name}</p>
              <p className="font-mono text-[11px] text-cyan-400/90">{handle}</p>
              <p
                className="mt-1.5 text-xs font-semibold leading-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #c4b5fd, #67e8f9 60%, #f9a8d4)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {persona}
              </p>
            </div>
          </div>

          {dnaBars.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {dnaBars.map(({ label, value }, i) => (
                <div key={label} className="space-y-0.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-400">{label}</span>
                    <span className="font-mono text-cyan-400/90">{value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800/90">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${DNA_COLORS[i % DNA_COLORS.length]}`}
                      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {displayTags.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.5 text-[9px] text-cyan-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <p className="mt-3 text-center text-[10px] font-medium text-zinc-500 transition group-hover:text-violet-300">
            View full Tech DNA →
          </p>
        </div>
      </article>
    </a>
  );
}
