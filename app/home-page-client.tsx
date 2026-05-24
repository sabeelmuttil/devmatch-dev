"use client";

import { LandingView } from "@/app/components/devmatch-ui";
import { usernameResultsPath } from "@/lib/username-route";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export default function HomePageClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    const path = usernameResultsPath(username);
    if (path === "/") {
      setError("Enter a valid daily.dev username (letters, numbers, - or _)");
      return;
    }
    setError(null);
    router.push(path);
  }, [username, router]);

  return (
    <LandingView
      username={username}
      error={error}
      onUsernameChange={(v) => {
        setUsername(v);
        if (error) setError(null);
      }}
      onSubmit={handleSubmit}
    />
  );
}
