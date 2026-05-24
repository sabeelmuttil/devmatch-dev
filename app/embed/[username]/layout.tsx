import { embedMetadata } from "@/lib/site-seo";
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
  const username = normalizeUsernameRoute(decodeURIComponent(raw)) ?? raw;
  return embedMetadata(username);
}

/** Allow embedding this route in iframes on any site. */
export default function EmbedLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-0 bg-[#06060b] antialiased" data-embed-root>
      {children}
    </div>
  );
}
