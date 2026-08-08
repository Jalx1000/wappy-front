import type { Metadata } from "next";
import { BRANDS } from "@/lib/mocks/data";

export async function generateMetadata({ params }: { params: Promise<{ brandSlug: string }> }): Promise<Metadata> {
  const { brandSlug } = await params;
  const brand = BRANDS.find((b) => b.id === brandSlug);
  return {
    title: brand ? `${brand.name} · Métricas` : "Portal · Wappy",
  };
}

export default function BrandPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-background)", fontFamily: "var(--ff-ui)" }}
    >
      {children}
    </div>
  );
}
