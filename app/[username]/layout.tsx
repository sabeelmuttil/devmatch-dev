import { fetchProfileBrief } from "@/lib/fetch-profile-brief";
import {
  profileMetadata,
  profilePageJsonLd,
} from "@/lib/site-seo";
import { normalizeUsernameRoute } from "@/lib/username-route";
import type { Metadata } from "next";
import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ username: string }>;
};

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { username: raw } = await params;
  const username = normalizeUsernameRoute(decodeURIComponent(raw));
  if (!username) {
    return {
      title: "Profile not found",
      robots: { index: false, follow: false },
    };
  }

  const profile = await fetchProfileBrief(username);
  if (!profile) {
    return {
      title: `@${username} — Tech DNA`,
      description: `Look up @${username}'s developer Tech DNA and compatible matches on dailydevmatch.dev.`,
      robots: { index: true, follow: true },
    };
  }

  return profileMetadata({
    username: profile.username ?? username,
    name: profile.name,
    bio: profile.bio,
    image: profile.image,
  });
}

export default async function UsernameLayout({
  children,
  params,
}: LayoutProps) {
  const { username: raw } = await params;
  const username = normalizeUsernameRoute(decodeURIComponent(raw));
  const profile = username ? await fetchProfileBrief(username) : null;

  const jsonLd =
    username && profile
      ? profilePageJsonLd({
          username: profile.username ?? username,
          name: profile.name,
          bio: profile.bio,
          image: profile.image,
        })
      : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      {children}
    </>
  );
}
