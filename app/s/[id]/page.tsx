import { twitterPreviewApiPath } from "@/lib/share-card-og";
import { absoluteUrl, SITE_NAME } from "@/lib/site-seo";
import { sharePathId } from "@/lib/share-url";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ id: string }> };

/** In-app card width — PNG is 1080px but displayed at UI scale. */
const SHARE_CARD_DISPLAY_WIDTH = 360;

function pngPath(id: string): string {
  return `/api/share-card-publish/${sharePathId(id)}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const shortId = sharePathId(id);
  const pageUrl = absoluteUrl(`/s/${shortId}`);
  const socialImage = absoluteUrl(twitterPreviewApiPath(id));
  const title = "Tech Identity Card";
  const description = `Developer Tech Identity card on ${SITE_NAME} — Tech DNA, persona, and stack powered by daily.dev.`;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      url: pageUrl,
      title: `${title} · ${SITE_NAME}`,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: socialImage,
          width: 1200,
          height: 630,
          alt: "Tech Identity Card",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      images: {
        url: socialImage,
        alt: "Tech Identity Card",
      },
    },
    robots: { index: true, follow: true },
  };
}

export default async function ShareCardViewPage({ params }: PageProps) {
  const { id } = await params;
  const src = pngPath(id);

  return (
    <div className="share-view-root">
      <div className="share-view-bg" aria-hidden>
        <div className="share-view-bg__grid grid-bg" />
        <div className="share-view-blob share-view-blob--violet" />
        <div className="share-view-blob share-view-blob--cyan" />
        <div className="share-view-blob share-view-blob--pink" />
        <div className="share-view-bg__vignette" />
      </div>

      <main className="share-view-content">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300">
          dailydevmatch.dev
        </p>

        <div className="share-view-card-wrap glow-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Tech Identity Card"
            width={SHARE_CARD_DISPLAY_WIDTH}
            className="share-view-card"
          />
        </div>

        <p className="mt-5 text-center text-xs text-zinc-500">
          #dailydevhackathon
        </p>
      </main>
    </div>
  );
}
