import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * True once the calling component has hydrated on the client, false on the
 * server and during the client's hydration render. Use this to gate any
 * render output derived from client-only state (e.g. a value seeded from
 * localStorage before this component's own hydration completes) — the
 * server always sees `false`, so gating keeps the first client render
 * identical to the server's, then React swaps in the real value right after
 * hydration finishes instead of throwing a mismatch.
 */
export const useHasMounted = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
