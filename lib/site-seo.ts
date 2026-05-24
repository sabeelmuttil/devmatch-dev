import type { Metadata } from "next";

export const SITE_NAME = "dailydevmatch.dev";
export const SITE_TAGLINE = "Find Your Tech Soulmate";
/** ~55 characters — within SEO title sweet spot (50–60). */
export const SITE_TITLE =
  "dailydevmatch.dev — Find Your Tech Soulmate on daily.dev";
export const HOME_PAGE_TITLE =
  "Find Your Tech Soulmate — AI Developer Matching for daily.dev";
export const DEFAULT_DESCRIPTION =
  "AI-powered developer matchmaking for daily.dev. Decode your Tech DNA, reveal your developer persona, and discover compatible creators to build with.";
export const OG_IMAGE_ALT =
  "dailydevmatch.dev — Find your Tech Soulmate. Enter your daily.dev username to get your Tech DNA.";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://dailydevmatch.dev"
  );
}

export function profilePath(username: string): string {
  return `/${encodeURIComponent(username)}`;
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncateMeta(text: string, max = 160): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

/** Next.js file-based OG image routes */
const defaultOgImage = "/opengraph-image";

/** Root + fallback metadata */
export function rootMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const title = SITE_TITLE;
  const ogImage = absoluteUrl(defaultOgImage);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s · ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    keywords: [
      "daily.dev",
      "developer matchmaking",
      "tech DNA",
      "developer persona",
      "tech stack",
      "find developers",
      "hackathon",
      "Gemini AI",
    ],
    authors: [{ name: SITE_NAME, url: siteUrl }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "technology",
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      siteName: SITE_NAME,
      title,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: DEFAULT_DESCRIPTION,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function homeMetadata(): Metadata {
  const siteUrl = getSiteUrl();
  const title = HOME_PAGE_TITLE;
  const ogImage = absoluteUrl(defaultOgImage);

  return {
    title,
    description: DEFAULT_DESCRIPTION,
    alternates: { canonical: siteUrl },
    openGraph: {
      url: siteUrl,
      title,
      description: DEFAULT_DESCRIPTION,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: DEFAULT_DESCRIPTION,
      images: [ogImage],
    },
  };
}

export function profileMetadata(input: {
  username: string;
  name?: string | null;
  bio?: string | null;
  image?: string | null;
}): Metadata {
  const { username, name, bio, image } = input;
  const displayName = name?.trim() || username;
  const title = `${displayName} (@${username}) — Tech DNA`;
  const description = bio?.trim()
    ? truncateMeta(
        `${bio} — Tech DNA, developer persona, and compatible dev matches on ${SITE_NAME}.`,
      )
    : `Discover @${username}'s Tech DNA, AI developer persona, and compatible daily.dev creators on ${SITE_NAME}.`;

  const canonical = absoluteUrl(profilePath(username));
  const ogImages = image?.startsWith("https://")
    ? [{ url: image, width: 400, height: 400, alt: `${displayName} profile` }]
    : [{ url: absoluteUrl(defaultOgImage), width: 1200, height: 630, alt: title }];

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "profile",
      url: canonical,
      title: `${displayName} · Tech Identity`,
      description,
      images: ogImages,
      username,
    },
    twitter: {
      card: image?.startsWith("https://") ? "summary" : "summary_large_image",
      title: `${displayName} · Tech DNA`,
      description,
      images: ogImages.map((i) => i.url),
    },
  };
}

export function embedMetadata(username: string): Metadata {
  return {
    title: `Embed · @${username}`,
    robots: { index: false, follow: true },
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl();
  const organizationId = `${siteUrl}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        url: siteUrl,
        description: DEFAULT_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en-US",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteUrl}/#software`,
        name: SITE_NAME,
        url: siteUrl,
        applicationCategory: "DeveloperApplication",
        applicationSubCategory: "Developer matchmaking",
        operatingSystem: "Web browser",
        description: DEFAULT_DESCRIPTION,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        featureList: [
          "Tech DNA analysis from daily.dev profile",
          "AI developer persona",
          "Compatible developer matches",
          "Shareable Tech Identity card",
        ],
        screenshot: absoluteUrl(defaultOgImage),
        publisher: { "@id": organizationId },
      },
    ],
  };
}

export function profilePageJsonLd(input: {
  username: string;
  name?: string | null;
  bio?: string | null;
  image?: string | null;
}): Record<string, unknown> {
  const { username, name, bio, image } = input;
  const url = absoluteUrl(profilePath(username));
  const displayName = name?.trim() || username;

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${url}#profile`,
    url,
    name: `${displayName} — Tech DNA`,
    description:
      bio?.trim() ||
      `Developer Tech DNA and match profile for @${username} on ${SITE_NAME}.`,
    mainEntity: {
      "@type": "Person",
      name: displayName,
      alternateName: username,
      identifier: username,
      url: `https://app.daily.dev/${username}`,
      ...(image?.startsWith("https://") ? { image } : {}),
      description: bio?.trim() || undefined,
    },
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: getSiteUrl(),
    },
  };
}
