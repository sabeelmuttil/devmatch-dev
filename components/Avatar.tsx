"use client";

import { avatarFallbackUrl, proxiedAvatarUrl } from "@/lib/avatar";
import { useClientOrigin } from "@/lib/use-client-origin";
import { useMemo, useState } from "react";

const DEFAULT_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://dailydevmatch.dev";

function initialsFrom(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

export interface AvatarProps {
  src?: string | null;
  name: string;
  username?: string | null;
  size?: number;
  className?: string;
  ringClassName?: string;
  shape?: "circle" | "rounded";
}

interface AvatarImageProps {
  intendedSrc: string;
  fallback: string;
  name: string;
  size: number;
  className: string;
  ringClassName: string;
  shape: "circle" | "rounded";
}

function AvatarImage({
  intendedSrc,
  fallback,
  name,
  size,
  className,
  ringClassName,
  shape,
}: AvatarImageProps) {
  const [src, setSrc] = useState(intendedSrc);
  const [useInitials, setUseInitials] = useState(false);

  const handleError = () => {
    if (src !== fallback) {
      setSrc(fallback);
      return;
    }
    setUseInitials(true);
  };

  const shapeClass = shape === "rounded" ? "rounded-2xl" : "rounded-full";
  const dimension = { width: size, height: size };

  if (useInitials) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-500 font-bold text-white ${shapeClass} ${ringClassName} ${className}`}
        style={dimension}
        aria-label={name}
      >
        <span style={{ fontSize: Math.max(12, size * 0.35) }}>
          {initialsFrom(name)}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      {...dimension}
      referrerPolicy="no-referrer"
      onError={handleError}
      className={`shrink-0 object-cover ${shapeClass} ${ringClassName} ${className}`}
    />
  );
}

export function Avatar({
  src,
  name,
  username,
  size = 56,
  className = "",
  ringClassName = "",
  shape = "circle",
}: AvatarProps) {
  const seed = username?.trim() || name.trim() || "developer";
  const origin = useClientOrigin(DEFAULT_ORIGIN);
  const intendedSrc = useMemo(
    () => proxiedAvatarUrl(origin, src, seed),
    [origin, src, seed],
  );
  const fallback = useMemo(
    () => proxiedAvatarUrl(origin, avatarFallbackUrl(seed), seed),
    [origin, seed],
  );

  return (
    <AvatarImage
      key={intendedSrc}
      intendedSrc={intendedSrc}
      fallback={fallback}
      name={name}
      size={size}
      className={className}
      ringClassName={ringClassName}
      shape={shape}
    />
  );
}
