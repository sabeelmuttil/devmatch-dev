import { NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "lh3.googleusercontent.com",
  "avatars.githubusercontent.com",
  "media.daily.dev",
  "res.cloudinary.com",
  "api.dicebear.com",
]);

function isAllowedUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");

  if (!url || !isAllowedUrl(url)) {
    return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: { Accept: "image/*" },
      next: { revalidate: 3600 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: upstream.status },
      );
    }

    const buffer = await upstream.arrayBuffer();
    let contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";
    if (contentType.includes("svg")) {
      contentType = "image/svg+xml";
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image proxy failed" }, { status: 502 });
  }
}
