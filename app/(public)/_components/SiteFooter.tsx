"use client";

import Link from "next/link";
import { useMarketing } from "./MarketingProvider";
import { ripple } from "./ripple";
import { ArrowRight, Apple, GooglePlay } from "./Icons";

export function SiteFooter() {
  const { t, signInHref, startTrial } = useMarketing();
  const f = t.footer;

  return (
    <footer>
      <div className="fcloud" style={{ top: 40, left: -50, width: 280, height: 110 }} />
      <div className="fcloud" style={{ top: 120, right: -40, width: 240, height: 100 }} />
      <div className="wrap">
        <div className="foot-cta">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marketing/wappy-wordmark.png" alt="Wappy" />
          <h3 className="display">{f.ctaTitle}</h3>
          <p>{f.ctaSub}</p>
          <div className="hero-cta" style={{ marginTop: 22 }}>
            <button className="btn btn-primary" onClick={(e) => { ripple(e); startTrial(); }}>
              {f.ctaTrial}{" "}
              <span className="pip">
                <ArrowRight />
              </span>
            </button>
            <Link className="btn btn-glass" href={signInHref} onClick={ripple}>
              {f.signIn}
            </Link>
          </div>
          <div className="hero-badges" style={{ marginTop: 18 }}>
            <Link className="store-badge" href="/#app">
              <Apple />
              <div>
                <div className="s1">Download on the</div>
                <div className="s2">App Store</div>
              </div>
            </Link>
            <Link className="store-badge" href="/#app">
              <GooglePlay />
              <div>
                <div className="s1">Get it on</div>
                <div className="s2">Google Play</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="foot-top">
          <div className="foot-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/marketing/wappy-wordmark.png" alt="Wappy" />
            <p>{f.tagline}</p>
          </div>
          <div className="foot-cols">
            {f.cols.map((col) => (
              <div className="foot-col" key={col.title}>
                <h4>{col.title}</h4>
                {col.links.map((l) =>
                  l.href.startsWith("/") ? (
                    <Link key={l.label} href={l.href}>
                      {l.label}
                    </Link>
                  ) : (
                    <a key={l.label} href={`/${l.href}`}>
                      {l.label}
                    </a>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="foot-word">WAPPY</div>

        <div className="foot-bottom">
          <span>{f.rights}</span>
          <div className="foot-legal">
            {f.legal.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
