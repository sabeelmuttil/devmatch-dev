import { fetchProfileBrief } from "@/lib/fetch-profile-brief";
import { SITE_NAME } from "@/lib/site-seo";
import { normalizeUsernameRoute } from "@/lib/username-route";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ username: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { username: raw } = await context.params;
  const username = normalizeUsernameRoute(decodeURIComponent(raw));
  if (!username) {
    return new Response("Not found", { status: 404 });
  }

  const persona =
    new URL(request.url).searchParams.get("persona")?.trim() ||
    "Developer Tech Identity";

  const profile = await fetchProfileBrief(username);
  const displayName = profile?.name?.trim() || username;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "20px 28px",
          background:
            "linear-gradient(135deg, #0a0a12 0%, #1a1030 50%, #0c1a2e 100%)",
          border: "2px solid rgba(139, 92, 246, 0.45)",
          borderRadius: 16,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 800,
            color: "white",
            flexShrink: 0,
          }}
        >
          DD
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.2,
            }}
          >
            {displayName}
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#67e8f9",
              marginTop: 4,
            }}
          >
            @{username}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginTop: 8,
              background: "linear-gradient(90deg, #c4b5fd, #67e8f9)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {persona}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>
            {SITE_NAME}
          </div>
          <div style={{ fontSize: 11, color: "#71717a", marginTop: 4 }}>
            View Tech DNA →
          </div>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 140,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "Content-Type": "image/png",
      },
    },
  );
}
