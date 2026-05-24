import { useSyncExternalStore } from "react";

/** Same value on server and during hydration; updates to `window.location.origin` after. */
export function useClientOrigin(fallback: string): string {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => fallback,
  );
}
