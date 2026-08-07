import type { Metadata } from "next";
import { Suspense } from "react";
import { InboxView } from "@/components/inbox/InboxView";
export const metadata: Metadata = { title: "Bandeja Social" };
export default function Page() {
  return (
    <Suspense fallback={null}>
      <InboxView />
    </Suspense>
  );
}
