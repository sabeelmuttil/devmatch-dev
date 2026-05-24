import HomePageClient from "@/app/home-page-client";
import { homeMetadata } from "@/lib/site-seo";
import type { Metadata } from "next";

export const metadata: Metadata = homeMetadata();

export default function HomePage() {
  return <HomePageClient />;
}
