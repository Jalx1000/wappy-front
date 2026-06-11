import { notFound } from "next/navigation";
import { BrandPortal } from "@/components/portal/BrandPortal";
import { BRANDS } from "@/lib/mocks/data";

export default async function BrandPortalPage({ params }: { params: Promise<{ brandSlug: string }> }) {
  const { brandSlug } = await params;
  const brand = BRANDS.find((b) => b.id === brandSlug);
  if (!brand) notFound();
  return <BrandPortal brand={brand} />;
}
