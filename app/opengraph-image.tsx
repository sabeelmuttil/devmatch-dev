import { ImageResponse } from "next/og";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site-seo";

export const runtime = "edge";
export const alt =
  "dailydevmatch.dev — Find your Tech Soulmate. Enter your daily.dev username to get your Tech DNA.";
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
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(135deg, #0a0a12 0%, #1a1030 45%, #0c1a2e 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 28,
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
              display: "flex",
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -1,
              color: "#c4b5fd",
            }}
          >
            {SITE_TAGLINE}
          </div>
          <p
            style={{
              marginTop: 22,
              fontSize: 24,
              lineHeight: 1.4,
              color: "#a1a1aa",
              maxWidth: 920,
            }}
          >
            {DEFAULT_DESCRIPTION}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "18px 36px",
              borderRadius: 16,
              background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
              fontSize: 26,
              fontWeight: 800,
              color: "white",
              boxShadow: "0 8px 32px rgba(124, 58, 237, 0.45)",
            }}
          >
            Enter your daily.dev @username →
          </div>
          <p style={{ fontSize: 17, color: "#67e8f9", textAlign: "right" }}>
            Free · Powered by daily.dev + Gemini AI
          </p>
        </div>
      </div>
    ),
    { ...size },
  );
}
