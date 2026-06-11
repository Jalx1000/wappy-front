"use client";

import { useEffect, useState } from "react";

async function startMSW() {
  if (typeof window === "undefined") return;
  const { worker } = await import("@/lib/mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(
    process.env.NEXT_PUBLIC_USE_MOCKS !== "true"
  );

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCKS !== "true") return;
    startMSW().then(() => setReady(true));
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
