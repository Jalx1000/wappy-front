"use client";

import { ReactLenis } from "lenis/react";
import { useSyncExternalStore, type ReactNode } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function getSnapshot() {
  return window.matchMedia(REDUCED).matches;
}
function getServerSnapshot() {
  return false;
}

/**
 * Marketing-only smooth scrolling. Mounted inside the (public) layout so Lenis
 * never runs on the authenticated dashboard (which needs native scrolling for
 * dense data views). Falls back to native scroll when the user prefers reduced
 * motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.1, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
