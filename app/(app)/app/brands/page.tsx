import type { Metadata } from "next";
import { BrandsGrid } from "@/components/brands/BrandsGrid";

export const metadata: Metadata = { title: "Marcas" };

export default function BrandsPage() {
  return <BrandsGrid />;
}
