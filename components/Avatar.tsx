"use client";

import { useEffect, useMemo, useState } from "react";
import { avatarFallbackUrl } from "@/lib/avatar";

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
  const fallback = useMemo(() => avatarFallbackUrl(seed), [seed]);
  const trimmedSrc = src?.trim() || null;

  const [activeSrc, setActiveSrc] = useState(trimmedSrc ?? fallback);
  const [useInitials, setUseInitials] = useState(false);

  useEffect(() => {
    setActiveSrc(trimmedSrc ?? fallback);
    setUseInitials(false);
  }, [trimmedSrc, fallback]);

  const handleError = () => {
    if (activeSrc !== fallback) {
      setActiveSrc(fallback);
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
      src={activeSrc}
      alt={name}
      {...dimension}
      referrerPolicy="no-referrer"
      onError={handleError}
      className={`shrink-0 object-cover ${shapeClass} ${ringClassName} ${className}`}
    />
  );
}
