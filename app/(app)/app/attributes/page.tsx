import type { Metadata } from "next";
import { Suspense } from "react";
import { AttributesView } from "@/components/attributes/AttributesView";

export const metadata: Metadata = { title: "Atributos" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AttributesView />
    </Suspense>
  );
}
