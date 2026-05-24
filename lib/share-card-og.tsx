import type { ShareCardPayload } from "@/lib/export-card-image";
import { resolveOgAvatarUrl } from "@/lib/share-og-avatar";
import { sharePathId } from "@/lib/share-url";
import { ImageResponse } from "next/og";

/** Matches in-app ShareCard width (360px × 3). */
const CARD_WIDTH = 1080;
const S = 3;

const flex = (extra: Record<string, string | number> = {}) => ({
  display: "flex",
  ...extra,
});

const DNA_GRADIENTS = [
  "linear-gradient(90deg, #8b5cf6, #9333ea)",
  "linear-gradient(90deg, #22d3ee, #3b82f6)",
  "linear-gradient(90deg, #d946ef, #ec4899)",
  "linear-gradient(90deg, #34d399, #14b8a6)",
  "linear-gradient(90deg, #fbbf24, #f97316)",
  "linear-gradient(90deg, #fb7185, #ef4444)",
];

const SKILL_STYLES = [
  {
    bg: "linear-gradient(180deg, rgba(139,92,246,0.3), rgba(139,92,246,0.1))",
    border: "rgba(167,139,250,0.4)",
    color: "#ede9fe",
  },
  {
    bg: "linear-gradient(180deg, rgba(34,211,238,0.25), rgba(34,211,238,0.08))",
    border: "rgba(34,211,238,0.4)",
    color: "#a5f3fc",
  },
  {
    bg: "linear-gradient(180deg, rgba(217,70,239,0.25), rgba(217,70,239,0.08))",
    border: "rgba(232,121,249,0.4)",
    color: "#f5d0fe",
  },
];

function normalizeSkills(
  skills: string[] | undefined,
): [string, string, string] {
  const list = (skills ?? []).filter(Boolean).slice(0, 3);
  while (list.length < 3) list.push("—");
  return [list[0], list[1], list[2]];
}

/** Canvas height for Satori — tight fit to avoid empty space below the footer. */
function computeShareCardHeight(input: {
  descriptionLen: number;
  dnaCount: number;
  tagCount: number;
  hasTopMatch: boolean;
  matchReasonLen: number;
}): number {
  const border = S * 6;
  const header = S * 68;
  const profileRow = S * 92;

  const descChars = Math.min(input.descriptionLen, 280);
  const descLines = descChars > 0 ? Math.max(1, Math.ceil(descChars / 48)) : 0;
  const personaBlock = S * (descLines > 0 ? 80 : 68) + descLines * S * 17;

  const dna = input.dnaCount > 0 ? S * (32 + input.dnaCount * 34) : 0;
  const stack = S * 96;
  const tagRows =
    input.tagCount > 0 ? Math.max(1, Math.ceil(input.tagCount / 3)) : 0;
  const tags = tagRows > 0 ? S * (40 + tagRows * 30) : 0;

  const reasonChars = input.hasTopMatch
    ? Math.min(input.matchReasonLen, 120)
    : 0;
  const reasonLines =
    reasonChars > 0 ? Math.max(1, Math.ceil(reasonChars / 52)) : 0;
  const topMatch = input.hasTopMatch ? S * (84 + reasonLines * 16) : 0;

  const footer = S * 52;
  const safety = S * 8;

  return (
    border * 2 +
    header +
    profileRow +
    personaBlock +
    dna +
    stack +
    tags +
    topMatch +
    footer +
    safety
  );
}

type DnaEntry = { label: string; value: number };
type TopMatchEntry = NonNullable<ShareCardPayload["topMatch"]>;

interface CardElementProps {
  name: string;
  handle: string;
  id: string;
  persona: string;
  personaDescription: string;
  skills: [string, string, string];
  avatar: string;
  techDna: DnaEntry[];
  tags: string[];
  topMatch?: TopMatchEntry;
}

function buildShareCardElement(props: CardElementProps) {
  const {
    name,
    handle,
    id,
    persona,
    personaDescription,
    skills,
    avatar,
    techDna,
    tags,
    topMatch,
  } = props;

  const pad = S * 20;

  return (
    <div
      style={flex({
        width: CARD_WIDTH,
        flexDirection: "column",
        padding: S * 2,
        background:
          "linear-gradient(135deg, #8b5cf6 0%, #d946ef 50%, #22d3ee 100%)",
        borderRadius: S * 20,
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      })}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderRadius: S * 18,
          background: "#06060b",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            background: "#08080f",
          }}
        >
          {/* Grid */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.04,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: `${S * 24}px ${S * 24}px`,
            }}
          />
          {/* Violet glow */}
          <div
            style={{
              position: "absolute",
              top: -S * 64,
              left: -S * 64,
              width: S * 192,
              height: S * 192,
              borderRadius: "50%",
              background: "rgba(124,58,237,0.35)",
            }}
          />
          {/* Cyan glow */}
          <div
            style={{
              position: "absolute",
              bottom: -S * 32,
              right: -S * 48,
              width: S * 224,
              height: S * 224,
              borderRadius: "50%",
              background: "rgba(34,211,238,0.25)",
            }}
          />

          {/* Header */}
          <div
            style={flex({
              position: "relative",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `${S * 16}px ${pad}px`,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            })}
          >
            <div style={flex({ alignItems: "center", gap: S * 12 })}>
              <div
                style={flex({
                  width: S * 36,
                  height: S * 36,
                  borderRadius: S * 12,
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: S * 12,
                  fontWeight: 700,
                })}
              >
                DD
              </div>
              <div style={flex({ flexDirection: "column" })}>
                <div
                  style={flex({
                    fontSize: S * 11,
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  })}
                >
                  dailydevmatch.dev
                </div>
                <div
                  style={flex({
                    fontSize: S * 10,
                    color: "#71717a",
                    marginTop: S * 2,
                  })}
                >
                  Tech Identity Card
                </div>
              </div>
            </div>
            <div
              style={flex({
                alignItems: "center",
                gap: S * 6,
                padding: `${S * 4}px ${S * 10}px`,
                borderRadius: 999,
                border: "1px solid rgba(251,191,36,0.5)",
                background: "rgba(251,191,36,0.15)",
              })}
            >
              <div
                style={{
                  display: "flex",
                  width: S * 6,
                  height: S * 6,
                  borderRadius: "50%",
                  background: "#fbbf24",
                }}
              />
              <div
                style={flex({
                  fontSize: S * 9,
                  fontWeight: 700,
                  color: "#fde68a",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                })}
              >
                Verified
              </div>
            </div>
          </div>

          {/* Profile + persona */}
          <div
            style={flex({
              position: "relative",
              flexDirection: "column",
              padding: `${S * 20}px ${pad}px ${S * 8}px`,
            })}
          >
            <div style={flex({ alignItems: "flex-start", gap: S * 16 })}>
              <div
                style={{
                  display: "flex",
                  width: S * 72,
                  height: S * 72,
                  padding: S * 2,
                  borderRadius: S * 16,
                  border: "2px solid rgba(255,255,255,0.2)",
                  overflow: "hidden",
                  background: "#12121a",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatar}
                  width={S * 68}
                  height={S * 68}
                  alt={name}
                  style={{
                    borderRadius: S * 12,
                    objectFit: "contain",
                    maxWidth: "100%",
                    maxHeight: "100%",
                  }}
                />
              </div>
              <div
                style={flex({
                  flexDirection: "column",
                  flex: 1,
                  paddingTop: S * 4,
                })}
              >
                <div
                  style={flex({
                    fontSize: S * 16,
                    fontWeight: 700,
                    color: "white",
                    lineHeight: 1.2,
                  })}
                >
                  {name}
                </div>
                <div
                  style={flex({
                    fontSize: S * 12,
                    color: "rgba(34,211,238,0.9)",
                    marginTop: S * 2,
                    fontFamily: "monospace",
                  })}
                >
                  {handle}
                </div>
                <div
                  style={flex({
                    fontSize: S * 11,
                    color: "#71717a",
                    marginTop: S * 4,
                  })}
                >
                  daily.dev developer
                </div>
              </div>
            </div>

            <div
              style={flex({
                marginTop: S * 16,
                flexDirection: "column",
                alignItems: "center",
                padding: `${S * 12}px ${S * 16}px`,
                borderRadius: S * 12,
                border: "1px solid rgba(139,92,246,0.25)",
                background:
                  "linear-gradient(90deg, rgba(46,16,78,0.8) 0%, #12121a 50%, rgba(8,51,68,0.8) 100%)",
              })}
            >
              <div
                style={flex({
                  fontSize: S * 9,
                  fontWeight: 600,
                  color: "#71717a",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                })}
              >
                Developer Persona
              </div>
              <div
                style={flex({
                  fontSize: S * 18,
                  fontWeight: 700,
                  color: "#c4b5fd",
                  marginTop: S * 6,
                  textAlign: "center",
                  lineHeight: 1.2,
                })}
              >
                {persona}
              </div>
              {personaDescription ? (
                <div
                  style={flex({
                    fontSize: S * 11,
                    color: "#a1a1aa",
                    marginTop: S * 8,
                    lineHeight: 1.5,
                    textAlign: "left",
                    width: "100%",
                  })}
                >
                  {personaDescription}
                </div>
              ) : null}
            </div>
          </div>

          {/* Tech DNA */}
          {techDna.length > 0 ? (
            <div
              style={flex({
                position: "relative",
                flexDirection: "column",
                padding: `${S * 12}px ${pad}px`,
                gap: S * 8,
              })}
            >
              <div
                style={flex({
                  fontSize: S * 9,
                  fontWeight: 600,
                  color: "#71717a",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: S * 2,
                })}
              >
                Tech DNA
              </div>
              {techDna.map((entry, i) => (
                <div
                  key={`dna-${i}`}
                  style={flex({ flexDirection: "column", gap: S * 4 })}
                >
                  <div
                    style={flex({
                      justifyContent: "space-between",
                      fontSize: S * 11,
                    })}
                  >
                    <div style={flex({ color: "#d4d4d8" })}>{entry.label}</div>
                    <div
                      style={flex({
                        color: "#22d3ee",
                        fontWeight: 600,
                        fontFamily: "monospace",
                      })}
                    >
                      {entry.value}%
                    </div>
                  </div>
                  <div
                    style={flex({
                      height: S * 8,
                      borderRadius: 999,
                      background: "rgba(39,39,42,0.8)",
                      overflow: "hidden",
                      width: "100%",
                    })}
                  >
                    <div
                      style={{
                        display: "flex",
                        height: S * 8,
                        width: `${Math.min(100, Math.max(0, entry.value))}%`,
                        background: DNA_GRADIENTS[i % DNA_GRADIENTS.length],
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Core stack */}
          <div
            style={flex({
              position: "relative",
              flexDirection: "column",
              padding: `${S * 12}px ${pad}px`,
            })}
          >
            <div
              style={flex({
                fontSize: S * 9,
                fontWeight: 600,
                color: "#71717a",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                justifyContent: "center",
                marginBottom: S * 10,
              })}
            >
              Core Stack
            </div>
            <div style={flex({ gap: S * 8 })}>
              {skills.map((skill, i) => (
                <div
                  key={`skill-${i}`}
                  style={flex({
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: `${S * 10}px ${S * 8}px`,
                    borderRadius: S * 12,
                    border: `1px solid ${SKILL_STYLES[i].border}`,
                    background: SKILL_STYLES[i].bg,
                    color: SKILL_STYLES[i].color,
                    fontSize: S * 11,
                    fontWeight: 600,
                    textAlign: "center",
                    lineHeight: 1.2,
                  })}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 ? (
            <div
              style={flex({
                position: "relative",
                flexDirection: "column",
                padding: `0 ${pad}px ${S * 12}px`,
                gap: S * 8,
              })}
            >
              <div
                style={flex({
                  fontSize: S * 9,
                  fontWeight: 600,
                  color: "#71717a",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                })}
              >
                Most Read Tags
              </div>
              <div
                style={flex({
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: S * 6,
                })}
              >
                {tags.map((tag, i) => (
                  <div
                    key={`tag-${i}`}
                    style={flex({
                      padding: `${S * 2}px ${S * 8}px`,
                      borderRadius: 999,
                      border: "1px solid rgba(34,211,238,0.25)",
                      background: "rgba(34,211,238,0.1)",
                      color: "#67e8f9",
                      fontSize: S * 10,
                    })}
                  >
                    #{tag.replace(/^#/, "")}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Top match */}
          {topMatch ? (
            <div
              style={flex({
                position: "relative",
                margin: `0 ${pad}px ${S * 12}px`,
                flexDirection: "column",
                padding: `${S * 12}px ${S * 14}px`,
                borderRadius: S * 12,
                border: "1px solid rgba(139,92,246,0.25)",
                background: "rgba(46,16,78,0.4)",
                gap: S * 8,
              })}
            >
              <div
                style={flex({
                  fontSize: S * 9,
                  fontWeight: 600,
                  color: "#71717a",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                })}
              >
                Top Match
              </div>
              <div
                style={flex({
                  justifyContent: "space-between",
                  alignItems: "center",
                })}
              >
                <div style={flex({ flexDirection: "column", flex: 1 })}>
                  <div
                    style={flex({
                      fontSize: S * 14,
                      fontWeight: 600,
                      color: "white",
                    })}
                  >
                    {topMatch.name}
                  </div>
                  <div
                    style={flex({
                      fontSize: S * 10,
                      color: "#71717a",
                      marginTop: S * 2,
                      fontFamily: "monospace",
                    })}
                  >
                    @{topMatch.username}
                  </div>
                </div>
                <div
                  style={flex({
                    flexDirection: "column",
                    alignItems: "center",
                    padding: `${S * 4}px ${S * 8}px`,
                    borderRadius: S * 8,
                    background: "rgba(34,211,238,0.15)",
                  })}
                >
                  <div
                    style={flex({
                      fontSize: S * 14,
                      fontWeight: 700,
                      color: "#67e8f9",
                    })}
                  >
                    {topMatch.matchScore}%
                  </div>
                  <div
                    style={flex({
                      fontSize: S * 8,
                      color: "#71717a",
                      textTransform: "uppercase",
                      marginTop: S * 2,
                    })}
                  >
                    match
                  </div>
                </div>
              </div>
              <div
                style={flex({
                  fontSize: S * 10,
                  color: "#a1a1aa",
                  lineHeight: 1.4,
                })}
              >
                {topMatch.matchReason.length > 120
                  ? `${topMatch.matchReason.slice(0, 120)}…`
                  : topMatch.matchReason}
              </div>
            </div>
          ) : null}

          {/* Footer */}
          <div
            style={flex({
              position: "relative",
              justifyContent: "space-between",
              alignItems: "center",
              padding: `${S * 14}px ${pad}px`,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(0,0,0,0.3)",
            })}
          >
            <div style={flex({ flexDirection: "column" })}>
              <div
                style={flex({
                  fontSize: S * 9,
                  color: "#52525b",
                  fontFamily: "monospace",
                })}
              >{`ID · ${id}`}</div>
              <div
                style={flex({
                  fontSize: S * 10,
                  color: "#71717a",
                  marginTop: S * 2,
                  fontWeight: 500,
                })}
              >
                #dailydevhackathon
              </div>
            </div>
            <div style={flex({ gap: S * 2, alignItems: "flex-end" })}>
              {[12, 18, 15, 21, 14, 24, 16, 20, 13, 22].map((h, i) => (
                <div
                  key={`bar-${i}`}
                  style={{
                    display: "flex",
                    width: S * 4,
                    height: S * h,
                    borderRadius: S * 2,
                    background:
                      i % 3 === 0
                        ? "linear-gradient(to top, #8b5cf6, #22d3ee)"
                        : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function renderShareCardImage(body: ShareCardPayload, origin: string) {
  const name = body.name?.trim() || "Developer";
  const username = body.username?.trim() || "dev";
  const persona = body.persona?.trim() || "Tech Explorer";
  const personaDescription = body.personaDescription?.trim() ?? "";
  const skills = normalizeSkills(body.skills);
  const techDna = (body.techDna ?? []).filter((d) => d?.label).slice(0, 6);
  const tags = (body.tags ?? []).filter(Boolean).slice(0, 6);
  const topMatch = body.topMatch;
  const avatar = resolveOgAvatarUrl(origin, body);

  const element = buildShareCardElement({
    name,
    handle: `@${username}`,
    id: (username || name).slice(0, 14).toUpperCase(),
    persona,
    personaDescription,
    skills,
    avatar,
    techDna,
    tags,
    topMatch,
  });

  const height = computeShareCardHeight({
    descriptionLen: personaDescription.length,
    dnaCount: techDna.length,
    tagCount: tags.length,
    hasTopMatch: !!topMatch,
    matchReasonLen: topMatch?.matchReason?.length ?? 0,
  });

  return new ImageResponse(element, {
    width: CARD_WIDTH,
    height,
  });
}

const TWITTER_W = 1200;
const TWITTER_H = 630;

/** 2:1 image for X / Twitter `summary_large_image` (portrait card PNG is not supported). */
export function renderTwitterPreviewImage(
  body: ShareCardPayload,
  origin: string,
) {
  const name = body.name?.trim() || "Developer";
  const username = body.username?.trim() || "dev";
  const persona = body.persona?.trim() || "Tech Explorer";
  const skills = normalizeSkills(body.skills);
  const techDna = (body.techDna ?? []).filter((d) => d?.label).slice(0, 3);
  const avatar = resolveOgAvatarUrl(origin, body);
  const desc = (body.personaDescription?.trim() ?? "").slice(0, 120);

  const element = (
    <div
      style={{
        display: "flex",
        width: TWITTER_W,
        height: TWITTER_H,
        background:
          "linear-gradient(135deg, #1a0a2e 0%, #06060b 45%, #0a1628 100%)",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        padding: 48,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          borderRadius: 24,
          border: "3px solid #8b5cf6",
          background: "#08080f",
          overflow: "hidden",
          padding: 40,
          gap: 36,
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              DD
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: "0.12em",
                }}
              >
                DAILYDEVMATCH.DEV
              </div>
              <div style={{ display: "flex", fontSize: 12, color: "#71717a" }}>
                Tech Identity Card
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div
              style={{
                display: "flex",
                width: 120,
                height: 120,
                borderRadius: 20,
                border: "3px solid rgba(255,255,255,0.2)",
                overflow: "hidden",
                background: "#12121a",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                width={112}
                height={112}
                alt={name}
                style={{ objectFit: "contain" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 36,
                  fontWeight: 700,
                  color: "white",
                }}
              >
                {name}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: "#22d3ee",
                  fontFamily: "monospace",
                }}
              >
                @{username}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "20px 24px",
              borderRadius: 16,
              border: "1px solid rgba(139,92,246,0.35)",
              background:
                "linear-gradient(90deg, rgba(46,16,78,0.9), #12121a, rgba(8,51,68,0.9))",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 11,
                color: "#71717a",
                letterSpacing: "0.15em",
                fontWeight: 600,
              }}
            >
              DEVELOPER PERSONA
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 32,
                fontWeight: 700,
                color: "#e9d5ff",
              }}
            >
              {persona}
            </div>
            {desc ? (
              <div
                style={{
                  display: "flex",
                  fontSize: 14,
                  color: "#a1a1aa",
                  lineHeight: 1.4,
                }}
              >
                {desc}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 320,
            gap: 20,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 11,
              color: "#71717a",
              letterSpacing: "0.15em",
              fontWeight: 600,
            }}
          >
            CORE STACK
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {skills.map((skill, i) => (
              <div
                key={`tw-skill-${i}`}
                style={{
                  display: "flex",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: `1px solid ${SKILL_STYLES[i].border}`,
                  background: SKILL_STYLES[i].bg,
                  color: SKILL_STYLES[i].color,
                  fontSize: 16,
                  fontWeight: 600,
                  justifyContent: "center",
                }}
              >
                {skill}
              </div>
            ))}
          </div>
          {techDna.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {techDna.map((entry, i) => (
                <div
                  key={`tw-dna-${i}`}
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: "#d4d4d8",
                    }}
                  >
                    <span>{entry.label}</span>
                    <span style={{ color: "#22d3ee" }}>{entry.value}%</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      height: 8,
                      borderRadius: 999,
                      background: "#27272a",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        height: 8,
                        width: `${entry.value}%`,
                        background: DNA_GRADIENTS[i % DNA_GRADIENTS.length],
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: 13,
              color: "#71717a",
              marginTop: 8,
            }}
          >
            #dailydevhackathon
          </div>
        </div>
      </div>
    </div>
  );

  return new ImageResponse(element, {
    width: TWITTER_W,
    height: TWITTER_H,
  });
}

export function twitterPreviewApiPath(id: string): string {
  return `/api/share-card-publish/${sharePathId(id)}?social=1`;
}
