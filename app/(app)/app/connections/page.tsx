import type { Metadata } from "next";
import { Suspense } from "react";
import { ConnectionsHub } from "@/components/connections/ConnectionsHub";

export const metadata: Metadata = { title: "Conexiones" };

export default function ConnectionsPage() {
  // ConnectionsHub uses useSearchParams (para detectar el callback OAuth).
  // Next.js 16 exige Suspense boundary alrededor de cualquier componente que
  // use useSearchParams en una página estática.
  return (
    <Suspense fallback={null}>
      <ConnectionsHub />
    </Suspense>
  );
}
