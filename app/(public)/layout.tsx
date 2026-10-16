import type { ReactNode } from "react";
import { MarketingProvider } from "./_components/MarketingProvider";
import { SmoothScroll } from "./_components/SmoothScroll";
import { SiteNav } from "./_components/SiteNav";
import { SiteFooter } from "./_components/SiteFooter";
import "./marketing.css";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mkt">
      <SmoothScroll>
        <MarketingProvider>
          <SiteNav />
          {children}
          <SiteFooter />
        </MarketingProvider>
      </SmoothScroll>
    </div>
  );
}
