import { ImageResponse } from "next/og";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site-seo";

export const runtime = "edge";
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "linear-gradient(135deg, #0a0a12 0%, #1a1030 45%, #0c1a2e 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            DD
          </div>
          <span style={{ fontSize: 28, fontWeight: 700 }}>{SITE_NAME}</span>
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            background: "linear-gradient(90deg, #c4b5fd, #67e8f9, #f9a8d4)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {SITE_TAGLINE}
        </div>
        <p
          style={{
            marginTop: 28,
            fontSize: 26,
            lineHeight: 1.45,
            color: "#a1a1aa",
            maxWidth: 900,
          }}
        >
          {DEFAULT_DESCRIPTION}
        </p>
        <p style={{ marginTop: 40, fontSize: 18, color: "#67e8f9" }}>
          Powered by daily.dev + Gemini AI
        </p>
      </div>
    ),
    { ...size },
  );
}
