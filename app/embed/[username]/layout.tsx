import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

/** Allow embedding this route in iframes on any site. */
export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-0 bg-[#06060b] antialiased" data-embed-root>
      {children}
    </div>
  );
}
