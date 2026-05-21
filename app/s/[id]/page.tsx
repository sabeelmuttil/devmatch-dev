import type { Metadata } from "next";

type PageProps = { params: Promise<{ id: string }> };

function originFromEnv(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

function pngPath(id: string): string {
  return `/api/share-card-publish/${encodeURIComponent(id)}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const origin = originFromEnv();
  const image = `${origin}${pngPath(id)}`;

  return {
    title: "Tech Identity Card · dailydevmatch.dev",
    description: "Developer Tech Identity from dailydevmatch.dev",
    openGraph: {
      type: "website",
      images: [{ url: image, width: 1080, height: 1400, alt: "Tech Identity Card" }],
    },
    twitter: {
      card: "summary_large_image",
      images: [image],
    },
  };
}

export default async function ShareCardViewPage({ params }: PageProps) {
  const { id } = await params;
  const src = pngPath(id);

  return (
    <main
      style={{
        margin: 0,
        minHeight: "100dvh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        background: "#06060b",
        padding: "12px 0",
        boxSizing: "border-box",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Tech Identity Card"
        style={{
          width: "100%",
          maxWidth: "100%",
          height: "auto",
          display: "block",
          objectFit: "contain",
        }}
      />
      <p
        style={{
          marginTop: 16,
          fontFamily: "system-ui, sans-serif",
          fontSize: 12,
          color: "#71717a",
        }}
      >
        dailydevmatch.dev · #dailydevhackathon
      </p>
    </main>
  );
}
