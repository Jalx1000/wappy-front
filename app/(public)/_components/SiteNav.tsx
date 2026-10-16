"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMarketing } from "./MarketingProvider";
import { LangToggle } from "./LangToggle";
import { ripple } from "./ripple";

export function SiteNav() {
  const { t, signInHref, openDemo } = useMarketing();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on Escape, and when the viewport grows back to desktop
  // (where the inline links return and the burger is hidden).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 880) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <nav className="nav">
      <div className={`nav-inner${scrolled ? " scrolled" : ""}`}>
        <Link className="nav-logo" href="/" aria-label="Wappy" onClick={() => setMenuOpen(false)}>
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
        <button
          type="button"
          className="nav-burger"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mkt-mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {menuOpen ? (
              <>
                <path d="M6 6 18 18" />
                <path d="M18 6 6 18" />
              </>
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      <div id="mkt-mobile-menu" className={`nav-mobile${menuOpen ? " open" : ""}`}>
        <div className="nav-mobile-links">
          {t.nav.links.map((l) => (
            <a
              key={l.href + l.label}
              className="m-link"
              href={`/${l.href}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="m-sep" />
        <div className="m-actions">
          <LangToggle />
          <Link className="nav-signin m-signin" href={signInHref} onClick={() => setMenuOpen(false)}>
            {t.nav.signIn}
          </Link>
          <button
            className="btn btn-lime btn-sm"
            onClick={(e) => { ripple(e); setMenuOpen(false); openDemo(); }}
          >
            {t.nav.bookDemo}
          </button>
        </div>
      </div>
    </nav>
  );
}
