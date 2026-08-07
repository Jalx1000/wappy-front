import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";

export const metadata: Metadata = { title: "Catálogo" };

export default function Page() {
  return <CatalogView />;
}
