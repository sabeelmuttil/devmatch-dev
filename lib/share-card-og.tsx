import { ImageResponse } from "next/og";
import { avatarFallbackUrl } from "@/lib/avatar";
import type { ShareCardPayload } from "@/lib/export-card-image";

function normalizeSkills(skills: string[] | undefined): [string, string, string] {
  const list = (skills ?? []).filter(Boolean).slice(0, 3);
  while (list.length < 3) list.push("—");
  return [list[0], list[1], list[2]];
}

const flex = (extra: Record<string, string | number> = {}) => ({
  display: "flex",
  ...extra,
});

const DNA_FILL = ["#8b5cf6", "#22d3ee", "#d946ef", "#10b981", "#f59e0b", "#f43f5e"];

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

function buildShareCardElement({
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
}: CardElementProps) {
  const skillColors = [
    { bg: "rgba(139,92,246,0.25)", border: "rgba(167,139,250,0.5)", text: "#ddd6fe" },
    { bg: "rgba(34,211,238,0.2)", border: "rgba(34,211,238,0.45)", text: "#a5f3fc" },
    { bg: "rgba(217,70,239,0.2)", border: "rgba(232,121,249,0.45)", text: "#f5d0fe" },
  ];

  return (
    <div
      style={flex({
        width: "100%",
        height: "100%",
        flexDirection: "column",
        background: "#06060b",
        fontFamily: "system-ui, sans-serif",
      })}
    >
      <div
        style={flex({
          flexDirection: "column",
          margin: 4,
          borderRadius: 20,
          border: "2px solid #8b5cf6",
          overflow: "hidden",
          background: "#08080f",
          height: "100%",
        })}
      >
        <div
          style={flex({
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 28px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          })}
        >
          <div style={flex({ alignItems: "center", gap: 12 })}>
            <div
              style={flex({
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#7c3aed",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 12,
                fontWeight: 700,
              })}
            >
              DD
            </div>
            <div style={flex({ flexDirection: "column" })}>
              <div style={flex({ fontSize: 12, fontWeight: 700, color: "white" })}>
                DAILYDEVMATCH.DEV
              </div>
              <div style={flex({ fontSize: 10, color: "#71717a", marginTop: 2 })}>
                Tech Identity Card
              </div>
            </div>
          </div>
          <div
            style={flex({
              padding: "5px 12px",
              borderRadius: 999,
              border: "1px solid rgba(251,191,36,0.5)",
              background: "rgba(251,191,36,0.12)",
              color: "#fde68a",
              fontSize: 9,
              fontWeight: 700,
            })}
          >
            VERIFIED
          </div>
        </div>

        <div style={flex({ padding: "24px 28px 12px", gap: 20, alignItems: "flex-start" })}>
          <div style={flex({ padding: 3, borderRadius: 16, background: "#7c3aed" })}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              width={76}
              height={76}
              alt={name}
              style={{ borderRadius: 12, objectFit: "cover" }}
            />
          </div>
          <div style={flex({ flexDirection: "column", flex: 1 })}>
            <div style={flex({ fontSize: 24, fontWeight: 700, color: "white" })}>{name}</div>
            <div style={flex({ fontSize: 13, color: "#22d3ee", marginTop: 4 })}>{handle}</div>
            <div style={flex({ fontSize: 11, color: "#71717a", marginTop: 4 })}>
              daily.dev developer
            </div>
          </div>
        </div>

        <div
          style={flex({
            margin: "0 28px 12px",
            padding: "16px 20px",
            borderRadius: 14,
            border: "1px solid rgba(139,92,246,0.35)",
            background: "#1e1033",
            flexDirection: "column",
            alignItems: "center",
          })}
        >
          <div
            style={flex({
              fontSize: 9,
              color: "#71717a",
              letterSpacing: "0.15em",
              fontWeight: 600,
            })}
          >
            DEVELOPER PERSONA
          </div>
          <div
            style={flex({
              fontSize: 22,
              fontWeight: 700,
              color: "#c4b5fd",
              marginTop: 8,
              textAlign: "center",
            })}
          >
            {persona}
          </div>
          <div
            style={flex({
              display: personaDescription ? "flex" : "none",
              fontSize: 12,
              color: "#a1a1aa",
              marginTop: 10,
              lineHeight: 1.45,
              textAlign: "left",
            })}
          >
            {personaDescription.length > 160
              ? `${personaDescription.slice(0, 160)}…`
              : personaDescription}
          </div>
        </div>

        <div
          style={flex({
            display: techDna.length > 0 ? "flex" : "none",
            flexDirection: "column",
            padding: "8px 28px 12px",
            gap: 10,
          })}
        >
          <div
            style={flex({
              fontSize: 9,
              color: "#71717a",
              letterSpacing: "0.15em",
              fontWeight: 600,
            })}
          >
            TECH DNA
          </div>
          {techDna.slice(0, 6).map((entry, i) => (
            <div key={`dna-${i}`} style={flex({ flexDirection: "column", gap: 4 })}>
              <div style={flex({ justifyContent: "space-between", fontSize: 11 })}>
                <div style={flex({ color: "#d4d4d8" })}>{entry.label}</div>
                <div style={flex({ color: "#22d3ee", fontWeight: 600 })}>
                  {entry.value}%
                </div>
              </div>
              <div
                style={flex({
                  height: 8,
                  borderRadius: 4,
                  background: "#27272a",
                  overflow: "hidden",
                  width: "100%",
                })}
              >
                <div
                  style={{
                    display: "flex",
                    height: 8,
                    width: `${Math.min(100, Math.max(0, entry.value))}%`,
                    background: DNA_FILL[i % DNA_FILL.length],
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={flex({ flexDirection: "column", padding: "8px 28px 12px" })}>
          <div
            style={flex({
              fontSize: 9,
              color: "#71717a",
              letterSpacing: "0.15em",
              fontWeight: 600,
              marginBottom: 10,
              justifyContent: "center",
            })}
          >
            CORE STACK
          </div>
          <div style={flex({ gap: 10 })}>
            {skills.map((skill, i) => (
              <div
                key={`skill-${i}`}
                style={flex({
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px 6px",
                  borderRadius: 10,
                  border: `1px solid ${skillColors[i].border}`,
                  background: skillColors[i].bg,
                  color: skillColors[i].text,
                  fontSize: 11,
                  fontWeight: 600,
                  textAlign: "center",
                })}
              >
                {skill}
              </div>
            ))}
          </div>
        </div>

        <div
          style={flex({
            display: tags.length > 0 ? "flex" : "none",
            flexDirection: "column",
            padding: "4px 28px 12px",
            gap: 8,
          })}
        >
          <div
            style={flex({
              fontSize: 9,
              color: "#71717a",
              letterSpacing: "0.15em",
              fontWeight: 600,
            })}
          >
            MOST READ TAGS
          </div>
          <div style={flex({ flexDirection: "row", gap: 6 })}>
            {tags.slice(0, 4).map((tag, i) => (
              <div
                key={`tag-${i}`}
                style={flex({
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(34,211,238,0.35)",
                  background: "rgba(34,211,238,0.12)",
                  color: "#a5f3fc",
                  fontSize: 10,
                })}
              >
                #{tag.replace(/^#/, "")}
              </div>
            ))}
          </div>
        </div>

        {topMatch ? (
          <div
            style={flex({
              margin: "4px 28px 12px",
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid rgba(139,92,246,0.35)",
              background: "rgba(30,16,51,0.8)",
              flexDirection: "column",
              gap: 6,
            })}
          >
            <div
              style={flex({
                fontSize: 9,
                color: "#71717a",
                letterSpacing: "0.15em",
                fontWeight: 600,
              })}
            >
              TOP MATCH
            </div>
            <div style={flex({ justifyContent: "space-between", alignItems: "center" })}>
              <div style={flex({ flexDirection: "column" })}>
                <div style={flex({ fontSize: 14, fontWeight: 700, color: "white" })}>
                  {topMatch.name}
                </div>
                <div style={flex({ fontSize: 10, color: "#71717a", marginTop: 2 })}>
                  @{topMatch.username}
                </div>
              </div>
              <div
                style={flex({
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: "rgba(34,211,238,0.15)",
                  color: "#22d3ee",
                  fontSize: 14,
                  fontWeight: 700,
                })}
              >
                {topMatch.matchScore}%
              </div>
            </div>
            <div style={flex({ fontSize: 10, color: "#a1a1aa", lineHeight: 1.4 })}>
              {topMatch.matchReason.length > 100
                ? `${topMatch.matchReason.slice(0, 100)}…`
                : topMatch.matchReason}
            </div>
          </div>
        ) : null}

        <div
          style={flex({
            marginTop: "auto",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 28px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "#050508",
          })}
        >
          <div style={flex({ flexDirection: "column" })}>
            <div style={flex({ fontSize: 9, color: "#52525b" })}>{`ID · ${id}`}</div>
            <div style={flex({ fontSize: 10, color: "#71717a", marginTop: 3 })}>
              #dailydevhackathon
            </div>
          </div>
          <div style={flex({ gap: 3, alignItems: "flex-end" })}>
            {[16, 24, 20, 28, 18, 32, 22, 26].map((h, i) => (
              <div
                key={`bar-${i}`}
                style={flex({
                  width: 4,
                  height: h,
                  borderRadius: 2,
                  background: i % 3 === 0 ? "#8b5cf6" : "#3f3f46",
                })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function renderShareCardImage(body: ShareCardPayload) {
  const name = body.name?.trim() || "Developer";
  const username = body.username?.trim() || "dev";
  const persona = body.persona?.trim() || "Tech Explorer";
  const personaDescription = body.personaDescription?.trim() ?? "";
  const skills = normalizeSkills(body.skills);
  const techDna = (body.techDna ?? []).filter((d) => d?.label).slice(0, 6);
  const tags = (body.tags ?? []).filter(Boolean).slice(0, 6);
  const topMatch = body.topMatch;
  const avatarSrc = body.avatar?.trim() || avatarFallbackUrl(username);
  const avatar =
    avatarSrc.includes("dicebear.com") && avatarSrc.includes("/svg")
      ? avatarSrc.replace("/svg", "/png")
      : avatarSrc;

  const handle = `@${username}`;
  const id = (username || name).slice(0, 14).toUpperCase();

  const element = buildShareCardElement({
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
  });

  const hasExtras =
    personaDescription.length > 0 ||
    techDna.length > 0 ||
    tags.length > 0 ||
    !!topMatch;
  const height = hasExtras ? 1080 : 820;

  return new ImageResponse(element, { width: 720, height });
}
