"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMarketing } from "./MarketingProvider";
import { LangToggle } from "./LangToggle";
import { ripple } from "./ripple";

export function SiteNav() {
  const { t, signInHref, openDemo } = useMarketing();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="nav">
      <div className={`nav-inner${scrolled ? " scrolled" : ""}`}>
        <Link className="nav-logo" href="/" aria-label="Wappy">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marketing/wappy-wordmark.png" alt="Wappy" />
        </Link>
        <div className="nav-links">
          {t.nav.links.map((l) => (
            <a key={l.href + l.label} href={`/${l.href}`}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-cta">
          <LangToggle />
          <Link className="nav-signin" href={signInHref}>
            {t.nav.signIn}
          </Link>
          <button className="btn btn-lime btn-sm" onClick={(e) => { ripple(e); openDemo(); }}>
            {t.nav.bookDemo}
          </button>
        </div>
      </div>
    </nav>
  );
}
