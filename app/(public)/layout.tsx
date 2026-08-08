import type { ReactNode } from "react";
import { MarketingProvider } from "./_components/MarketingProvider";
import { SiteNav } from "./_components/SiteNav";
import { SiteFooter } from "./_components/SiteFooter";
import "./marketing.css";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mkt">
      <MarketingProvider>
        <SiteNav />
        {children}
        <SiteFooter />
      </MarketingProvider>
    </div>
  );
}
