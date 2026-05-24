import { SITE_NAME } from "@/lib/site-seo";

export const README_CARD_WIDTH = 360;

export interface ReadmeBadgeDnaEntry {
  label: string;
  value: number;
}

export interface ReadmeBadgeCardProps {
  name: string;
  username: string;
  persona: string;
  avatarUrl: string;
  techDna: ReadmeBadgeDnaEntry[];
  tags: string[];
}

const DNA_BAR_COLORS = ["#8b5cf6", "#22d3ee", "#d946ef"];

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function parseDnaParam(raw: string | null): ReadmeBadgeDnaEntry[] {
  if (!raw?.trim()) return [];
  return raw
    .split("|")
    .map((part) => {
      const idx = part.lastIndexOf(":");
      if (idx <= 0) return null;
      const label = decodeURIComponent(part.slice(0, idx).trim());
      const value = Number(part.slice(idx + 1));
      if (!label || Number.isNaN(value)) return null;
      return { label, value: Math.min(100, Math.max(0, value)) };
    })
    .filter((x): x is ReadmeBadgeDnaEntry => x !== null)
    .slice(0, 3);
}

export function parseTagsParam(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((t) => decodeURIComponent(t.trim()))
    .filter(Boolean)
    .slice(0, 3);
}

export function encodeDnaParam(entries: ReadmeBadgeDnaEntry[]): string {
  return entries
    .slice(0, 3)
    .map((e) => `${encodeURIComponent(e.label)}:${e.value}`)
    .join("|");
}

export function encodeTagsParam(tags: string[]): string {
  return tags
    .slice(0, 3)
    .map((t) => encodeURIComponent(t.trim()))
    .filter(Boolean)
    .join(",");
}

/** Card height for ImageResponse (matches embed card layout). */
export function readmeCardHeight(props: ReadmeBadgeCardProps): number {
  let h = 200;
  if (props.techDna.length > 0) h += props.techDna.length * 28 + 8;
  if (props.tags.length > 0) h += 28;
  return Math.min(320, h);
}

export function ReadmeBadgeCardImage(props: ReadmeBadgeCardProps) {
  const { name, username, persona, avatarUrl, techDna, tags } = props;
  const displayName = truncate(name, 24);
  const displayPersona = truncate(persona, 36);
  const handle = `@${username}`;

  return (
    <div
      style={{
        width: README_CARD_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#06060b",
        border: "2px solid rgba(139, 92, 246, 0.45)",
        borderRadius: 20,
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(139, 92, 246, 0.08)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              color: "white",
            }}
          >
            DD
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.9)",
              textTransform: "uppercase",
            }}
          >
            {SITE_NAME}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 8,
            fontWeight: 700,
            color: "#fde68a",
            border: "1px solid rgba(251, 191, 36, 0.4)",
            background: "rgba(251, 191, 36, 0.12)",
            borderRadius: 999,
            padding: "4px 8px",
            textTransform: "uppercase",
          }}
        >
          Verified
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "14px 16px 12px",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt=""
            width={48}
            height={48}
            style={{
              borderRadius: 12,
              border: "2px solid rgba(255,255,255,0.15)",
              objectFit: "cover",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              gap: 2,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 15,
                fontWeight: 800,
                color: "white",
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 11,
                color: "#67e8f9",
              }}
            >
              {handle}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 12,
                fontWeight: 600,
                color: "#c4b5fd",
                marginTop: 4,
              }}
            >
              {displayPersona}
            </div>
          </div>
        </div>

        {techDna.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 14,
            }}
          >
            {techDna.map((entry, i) => (
              <div
                key={`${entry.label}-${i}`}
                style={{ display: "flex", flexDirection: "column", gap: 4 }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", fontSize: 10, color: "#a1a1aa" }}>
                    {entry.label}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 10,
                      color: "#67e8f9",
                      fontWeight: 600,
                    }}
                  >
                    {entry.value}%
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    height: 6,
                    borderRadius: 999,
                    background: "rgba(39, 39, 42, 0.9)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: `${entry.value}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: DNA_BAR_COLORS[i % DNA_BAR_COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {tags.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              marginTop: 12,
            }}
          >
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  fontSize: 9,
                  color: "#67e8f9",
                  border: "1px solid rgba(34, 211, 238, 0.25)",
                  background: "rgba(34, 211, 238, 0.1)",
                  borderRadius: 999,
                  padding: "3px 8px",
                }}
              >
                #{tag}
              </div>
            ))}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            fontSize: 10,
            color: "#71717a",
            marginTop: 12,
            justifyContent: "center",
          }}
        >
          View full Tech DNA →
        </div>
      </div>
    </div>
  );
}
