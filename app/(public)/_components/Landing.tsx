"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useMarketing } from "./MarketingProvider";
import type { SiteContent } from "./content";
import { MOCK } from "./mock";
import { ripple } from "./ripple";
import { Faq } from "./Faq";
import { ProductVideo } from "./ProductVideo";
import { ArrowRight, Check, Spark, Send, Apple, GooglePlay, ChannelIcon } from "./Icons";

function Pip() {
  return (
    <span className="pip">
      <ArrowRight />
    </span>
  );
}

export function Landing() {
  const { lang, t, startTrial, openDemo, openCompare } = useMarketing();
  const m = MOCK[lang];
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll-reveal for elements tagged `.reveal`.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.12 },
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const trial = (e: React.MouseEvent<HTMLElement>) => {
    ripple(e);
    startTrial();
  };
  const book = (e: React.MouseEvent<HTMLElement>) => {
    ripple(e);
    openDemo();
  };

  return (
    <div ref={rootRef}>
      {/* HERO */}
      <header className="hero">
        <div className="cloud" style={{ top: 90, left: -60, width: 300, height: 120 }} />
        <div className="cloud" style={{ top: 240, right: -40, width: 260, height: 110 }} />
        <div className="cloud" style={{ bottom: 60, left: "18%", width: 240, height: 100, opacity: 0.5 }} />
        <div className="wrap hero-inner">
          <span className="trial">
            <span className="tdot" />
            {t.hero.trial}
          </span>
          <h1 className="display">
            {t.hero.title1}
            <br />
            <span className="t2">{t.hero.title2}</span>
          </h1>
          <p className="sub">{t.hero.sub}</p>
          <div className="hero-cta">
            <button className="btn btn-primary" onClick={trial}>
              {t.hero.ctaTrial} <Pip />
            </button>
            <button className="btn btn-glass" onClick={book}>
              {t.hero.ctaDemo}
            </button>
          </div>
          <div className="hero-badges">
            <a className="store-badge" href="#app">
              <Apple />
              <div>
                <div className="s1">Download on the</div>
                <div className="s2">App Store</div>
              </div>
            </a>
            <a className="store-badge" href="#app">
              <GooglePlay />
              <div>
                <div className="s1">Get it on</div>
                <div className="s2">Google Play</div>
              </div>
            </a>
          </div>
        </div>
        <div className="wrap">
          <div className="hero-stage">
            <div className="float" style={{ top: 0, left: "2%", width: 300, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={avatar("#E8EAFF", "#4852ED")}>AW</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Amelia Wright</div>
                  <div style={{ fontSize: 11, color: "#9A9AA8" }}>WhatsApp · {m.open}</div>
                </div>
                <span style={{ background: "#C7F303", color: "#0E1300", fontSize: 11, fontWeight: 700, borderRadius: 9999, padding: "2px 7px" }}>2</span>
              </div>
              <div style={{ background: "#F2F3F5", borderRadius: "4px 12px 12px 12px", padding: "8px 11px", fontSize: 12.5 }}>
                {m.ameliaMsgLong}
              </div>
            </div>
            <div className="float" style={{ top: 120, right: "3%", width: 280, padding: 14, animationDelay: "1.4s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                <span style={sparkChip()}>
                  <Spark size={14} />
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{t.lifestyle.copilot}</span>
                <span style={{ fontSize: 11, color: "#9A9AA8" }}>{m.suggested}</span>
              </div>
              <div style={{ background: "#C7F303", borderRadius: 12, padding: "9px 12px", fontSize: 12.5, fontWeight: 500 }}>
                {m.copilotBubble}
              </div>
            </div>
            <div className="float" style={{ bottom: 0, left: "32%", width: 230, padding: 16, animationDelay: ".7s" }}>
              <div style={{ fontSize: 11, color: "#9A9AA8", fontWeight: 600 }}>{m.csatWeek}</div>
              <div className="display" style={{ fontWeight: 600, fontSize: 34, letterSpacing: "-0.03em", color: "#40AD5A" }}>97%</div>
              <div style={{ display: "flex", gap: 3, marginTop: 6 }}>
                <span style={bar("#40AD5A")} />
                <span style={bar("#40AD5A")} />
                <span style={bar("#D6F4DF")} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STATS BENTO */}
      <section className="band">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="dot" />
              {t.stats.eyebrow}
            </span>
            <h2 className="display">{t.stats.title}</h2>
          </div>
          <div className="bento reveal">
            <div className="cell big">
              <div>
                <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: ".06em", opacity: 0.5 }}>
                  {t.stats.omnichannel}
                </div>
                <div className="display" style={{ fontSize: 30, marginTop: 8, lineHeight: 1.08 }}>
                  {t.stats.omniTitle}
                </div>
              </div>
              <div className="chan-cards">
                {t.stats.channels.map((ch) => (
                  <div className="chan-card" key={ch.name}>
                    <span className="cdot" style={{ background: ch.color }}>
                      <ChannelIcon name={ch.name} />
                    </span>
                    <div>
                      <div className="cn">{ch.name}</div>
                      <div className="cs">{ch.status}</div>
                    </div>
                  </div>
                ))}
                <div className="chan-card" style={{ alignItems: "center", justifyContent: "center", borderStyle: "dashed" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{t.stats.more}</span>
                </div>
              </div>
            </div>
            {t.stats.cells.map((cell, i) => (
              <div className={`cell${i === 0 ? " lime" : ""}`} key={cell.l}>
                <div className="stat-n">{cell.n}</div>
                <div className="stat-l">{cell.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="band" style={{ paddingTop: 30 }}>
        <div className="wrap">
          {t.features.map((f, i) => (
            <div className={`feat${i === 1 ? " rev" : ""} reveal`} key={f.eyebrow}>
              <div className="feat-copy">
                <span className="eyebrow">
                  <span className="dot" />
                  {f.eyebrow}
                </span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                <ul className="feat-list">
                  {f.list.map((li) => (
                    <li key={li}>
                      <span className="ck">
                        <Check />
                      </span>
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`feat-art ${["tint-sky", "tint-lav", "tint-mint"][i]}`}>
                <FeatureArt index={i} m={m} copilot={t.lifestyle.copilot} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MOBILE APP */}
      <section id="app" className="band" style={{ background: "var(--sky)", overflow: "hidden", position: "relative" }}>
        <div className="cloud" style={{ top: 40, left: -40, width: 240, height: 100 }} />
        <div className="cloud" style={{ bottom: 40, right: -30, width: 220, height: 90 }} />
        <div className="wrap" style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <span className="eyebrow">
            <span className="dot" />
            {t.app.eyebrow}
          </span>
          <h2 className="display" style={{ fontSize: "clamp(30px,4.6vw,48px)", margin: "14px 0 0" }}>
            {t.app.title}
          </h2>
          <p style={{ fontSize: 17, color: "rgba(14,19,0,0.62)", maxWidth: 480, margin: "14px auto 0" }}>{t.app.sub}</p>
          <div className="hero-badges" style={{ marginTop: 24 }}>
            <div className="store-badge">
              <Apple />
              <div>
                <div className="s1">Download on the</div>
                <div className="s2">App Store</div>
              </div>
            </div>
            <div className="store-badge">
              <GooglePlay />
              <div>
                <div className="s1">Get it on</div>
                <div className="s2">Google Play</div>
              </div>
            </div>
          </div>
          <div className="app-phones">
            <IosPhone m={m} app={t.app} />
            <AndroidPhone app={t.app} you={m.you} />
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="band vid-band">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="dot" />
              {t.video.eyebrow}
            </span>
            <h2 className="display">{t.video.title}</h2>
            <p>{t.video.sub}</p>
          </div>
          <div className="reveal">
            <ProductVideo />
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="band">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="dot" />
              {t.integrations.eyebrow}
            </span>
            <h2 className="display">{t.integrations.title}</h2>
            <p>{t.integrations.sub}</p>
          </div>
          <div className="intg reveal">
            {INTEGRATIONS.map((it) => (
              <div className="i" key={it.name}>
                <span className="g" style={{ background: it.bg }}>
                  {it.svg}
                </span>
                {it.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="dot" />
              {t.testimonials.eyebrow}
            </span>
            <h2 className="display">{t.testimonials.title}</h2>
          </div>
          <div className="tgrid reveal">
            {t.testimonials.items.map((tc, i) => (
              <div className="tcard" key={tc.name}>
                <div className="stars">★★★★★</div>
                <p>&ldquo;{tc.quote}&rdquo;</p>
                <div className="who">
                  <span className="av" style={AVATARS[i]}>{INITIALS[i]}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{tc.name}</div>
                    <div style={{ fontSize: 12.5, color: "#9A9AA8" }}>{tc.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIFESTYLE */}
      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="life reveal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bg" src="/marketing/ref-lifestyle-1.png" alt="" />
            <div className="scrim" />
            <div className="life-copy">
              <span className="eyebrow">
                <span className="dot" />
                {t.lifestyle.eyebrow}
              </span>
              <h2>{t.lifestyle.title}</h2>
              <p>{t.lifestyle.body}</p>
              <div className="hero-cta" style={{ justifyContent: "flex-start", marginTop: 24 }}>
                <button className="btn btn-lime" onClick={trial}>
                  {t.lifestyle.cta}
                </button>
              </div>
            </div>
            <div className="life-float" style={{ top: 36, right: 36, width: 250 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                <span style={sparkChip()}>
                  <Spark size={14} />
                </span>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{t.lifestyle.copilot}</span>
              </div>
              <div style={{ background: "#C7F303", borderRadius: 12, padding: "9px 12px", fontSize: 12.5, fontWeight: 500, color: "#0E1300" }}>
                {t.lifestyle.copilotMsg}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="dot" />
              {t.faq.eyebrow}
            </span>
            <h2 className="display">{t.faq.title}</h2>
          </div>
          <div className="reveal">
            <Faq items={t.faq.items} />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="eyebrow">
              <span className="dot" />
              {t.pricing.eyebrow}
            </span>
            <h2 className="display">{t.pricing.title}</h2>
            <p>{t.pricing.sub}</p>
          </div>
          <div className="price reveal">
            {t.pricing.plans.map((p) => (
              <div className={`pcard${p.featured ? " feat-plan" : ""}`} key={p.name}>
                {p.badge && <span className="pbadge">{p.badge}</span>}
                <div className="pn">{p.name}</div>
                <div className="pp">
                  {p.price}
                  <span>{p.per}</span>
                </div>
                <div style={{ fontSize: 13, color: p.featured ? "rgba(255,255,255,0.6)" : "#9A9AA8", marginBottom: 4 }}>
                  {p.audience}
                </div>
                <div className="ptrial">
                  <span style={{ width: 6, height: 6, borderRadius: 9999, background: p.featured ? "var(--lime)" : "#1E8E3E", display: "inline-block" }} />
                  {p.trial}
                </div>
                <ul>
                  {p.features.map((feat) => (
                    <li key={feat}>
                      <span className="pck">
                        <Check size={11} strokeWidth={3.5} />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  className={`btn ${p.featured ? "btn-lime" : "btn-glass"} btn-sm`}
                  onClick={trial}
                  style={{ marginTop: "auto", justifyContent: "center", ...(p.featured ? {} : { border: "1px solid var(--line)" }) }}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
          <div className="price-note">
            {t.pricing.note}{" "}
            <a
              href="#"
              className="legal-link"
              onClick={(e) => {
                e.preventDefault();
                openCompare();
              }}
            >
              {t.pricing.compare}
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final">
        <span className="trial" style={{ marginBottom: 18 }}>
          <span className="tdot" />
          {t.finalCta.trial}
        </span>
        <h2>{t.finalCta.title}</h2>
        <p>{t.finalCta.sub}</p>
        <div className="hero-cta" style={{ marginTop: 28 }}>
          <button className="btn btn-primary" onClick={trial}>
            {t.finalCta.ctaTrial} <Pip />
          </button>
          <button className="btn btn-glass" onClick={book}>
            {t.finalCta.ctaDemo}
          </button>
        </div>
      </section>
    </div>
  );
}

/* ── style helpers ─────────────────────────────────────────────────────── */
function avatar(bg: string, color: string): React.CSSProperties {
  return {
    width: 36,
    height: 36,
    borderRadius: 9999,
    background: bg,
    color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
  };
}
function sparkChip(): React.CSSProperties {
  return { width: 24, height: 24, borderRadius: 7, background: "#C7F303", display: "flex", alignItems: "center", justifyContent: "center" };
}
function bar(bg: string): React.CSSProperties {
  return { flex: 1, height: 6, borderRadius: 9999, background: bg };
}

const AVATARS: React.CSSProperties[] = [
  { background: "#E8EAFF", color: "#4852ED" },
  { background: "#D6F4DF", color: "#0A5818" },
  { background: "#FEF0DC", color: "#F09030" },
];
const INITIALS = ["AG", "MR", "SL"];

/* ── feature mockups ───────────────────────────────────────────────────── */
function FeatureArt({ index, m, copilot }: { index: number; m: typeof MOCK.es; copilot: string }) {
  if (index === 0) {
    const rows = [
      { i: "AW", n: "Amelia Wright", s: `WhatsApp · ${m.open}`, bg: "#E8EAFF", c: "#4852ED", border: true },
      { i: "MR", n: "Marco Rossi", s: `Email · ${m.resolved}`, bg: "#D6F4DF", c: "#0A5818", border: true },
      { i: "SP", n: "Sofia Petrova", s: `WhatsApp · ${m.snoozed}`, bg: "#FEF0DC", c: "#F09030", border: false },
    ];
    return (
      <div style={{ width: "100%", maxWidth: 360, background: "#fff", borderRadius: 18, boxShadow: "0 16px 40px rgba(20,40,80,0.14)", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #EEF0F3", fontWeight: 700, fontFamily: "var(--display)" }}>{m.inbox}</div>
        {rows.map((r) => (
          <div key={r.i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 16px", borderBottom: r.border ? "1px solid #F2F3F5" : undefined }}>
            <span style={{ ...avatar(r.bg, r.c), width: 38, height: 38 }}>{r.i}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.n}</div>
              <div style={{ fontSize: 12, color: "#9A9AA8" }}>{r.s}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (index === 1) {
    return (
      <div style={{ width: "100%", maxWidth: 340, background: "#fff", borderRadius: 18, boxShadow: "0 16px 40px rgba(20,40,80,0.14)", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ width: 28, height: 28, borderRadius: 8, background: "#C7F303", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Spark />
          </span>
          <span style={{ fontWeight: 700 }}>{copilot}</span>
        </div>
        <div style={{ background: "#F2F3F5", borderRadius: 12, padding: 12, fontSize: 13.5, lineHeight: 1.5, marginBottom: 12 }}>{m.copilotDraft}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ flex: 1, height: 38, borderRadius: 9999, background: "#C7F303", color: "#0E1300", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 }}>{m.useReply}</span>
          <span style={{ width: 38, height: 38, borderRadius: 9999, border: "1px solid #E7EAEE", display: "flex", alignItems: "center", justifyContent: "center" }}>↻</span>
        </div>
      </div>
    );
  }
  return (
    <div style={{ width: 280, background: "linear-gradient(160deg,#C7F303,#A8D400)", borderRadius: 20, boxShadow: "0 16px 40px rgba(20,40,80,0.16)", padding: 18 }}>
      <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 22, color: "#0E1300" }}>{m.helloThere}</div>
      <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 22, color: "rgba(14,19,0,0.45)", marginBottom: 14 }}>{m.howHelp}</div>
      <div style={{ background: "#fff", borderRadius: 14, padding: "13px 15px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 14px rgba(0,0,0,0.08)" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#0E1300", flex: 1 }}>{m.sendMsg}</span>
        <span style={{ width: 34, height: 34, borderRadius: 9999, background: "#C7F303", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Send />
        </span>
      </div>
    </div>
  );
}

/* ── phone mockups ─────────────────────────────────────────────────────── */
type AppCopy = SiteContent["app"];

function IosPhone({ m, app }: { m: typeof MOCK.es; app: AppCopy }) {
  const rows = [
    { i: "AW", n: "Amelia Wright", msg: m.ameliaMsgShort, badge: m.open, badgeBg: "#E8EAFF", badgeC: "#4852ED", av: "#E8EAFF", avc: "#4852ED", dot: "#25D366", count: "2" },
    { i: "MR", n: "Marco Rossi", msg: m.marcoMsg, badge: m.resolved, badgeBg: "#D6F4DF", badgeC: "#0A5818", av: "#D6F4DF", avc: "#0A5818", dot: "#5B6B7B", count: null },
    { i: "SP", n: "Sofia Petrova", msg: m.sofiaMsg, badge: m.snoozed, badgeBg: "#FEF0DC", badgeC: "#F09030", av: "#FEF0DC", avc: "#F09030", dot: "#25D366", count: null },
  ];
  return (
    <div className="phone-wrap">
      <div className="phone-label">
        <Apple size={14} fill="#0E1300" />
        {app.iosLabel}
      </div>
      <div className="phone">
        <div className="phone-screen">
          <div className="phone-notch">
            <span />
          </div>
          <div style={{ padding: "6px 16px 10px", textAlign: "left", background: "#fff" }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 24, color: "#0E1300" }}>{m.inbox}</div>
            <div style={{ display: "flex", gap: 6, background: "#E9E9EE", borderRadius: 9, padding: 3, marginTop: 8 }}>
              <span style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 600, padding: "6px 0", background: "#fff", borderRadius: 7 }}>{m.you}</span>
              <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#6A6A6E", padding: "6px 0" }}>{m.all}</span>
            </div>
          </div>
          <div style={{ background: "#F2F3F7", padding: 6, textAlign: "left" }}>
            {rows.map((r) => (
              <div key={r.i} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, background: "#fff", borderRadius: 14, marginBottom: 6 }}>
                <span style={{ width: 38, height: 38, borderRadius: 9999, background: r.av, color: r.avc, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, position: "relative", flex: "none" }}>
                  {r.i}
                  <span style={{ position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: 9999, background: r.dot, border: "2px solid #fff" }} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{r.n}</div>
                  <div style={{ fontSize: 11, color: "#9A9AA8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.msg}</div>
                  <span style={{ display: "inline-block", marginTop: 3, fontSize: 9, fontWeight: 700, padding: "1px 7px", borderRadius: 9999, background: r.badgeBg, color: r.badgeC }}>{r.badge}</span>
                </div>
                {r.count && (
                  <span style={{ width: 18, height: 18, borderRadius: 9999, background: "#C7F303", color: "#0E1300", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{r.count}</span>
                )}
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 4px" }}>
              <span style={{ height: 38, padding: "0 16px", borderRadius: 9999, background: "#C7F303", color: "#0E1300", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700 }}>{app.compose}</span>
            </div>
          </div>
          <div style={{ display: "flex", background: "#fff", borderTop: "1px solid #EEF0F3", padding: "8px 0 14px" }}>
            <TabActive label={app.tabInbox} />
            <TabIcon label={app.tabTeam}>
              <circle cx="9" cy="7" r="4" />
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            </TabIcon>
            <TabIcon label={app.tabHelp}>
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
            </TabIcon>
            <TabIcon label={app.tabProfile}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-1a6 6 0 0 1 12 0v1" />
            </TabIcon>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabActive({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ width: 54, height: 28, margin: "0 auto", borderRadius: 9999, background: "#E8EAFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B40B5" strokeWidth="2">
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      </div>
      <div style={{ fontSize: 9, fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function TabIcon({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ flex: 1, textAlign: "center", color: "#9A9AA8", paddingTop: 5 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A9AA8" strokeWidth="1.8">
        {children}
      </svg>
      <div style={{ fontSize: 9, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function AndroidPhone({ app, you }: { app: AppCopy; you: string }) {
  return (
    <div className="phone-wrap">
      <div className="phone-label">
        <GooglePlay size={14} fill="#0E1300" />
        {app.androidLabel}
      </div>
      <div className="phone">
        <div className="phone-screen">
          <div className="phone-notch">
            <span style={{ width: 10, height: 10, borderRadius: 9999 }} />
          </div>
          <div style={{ background: "linear-gradient(160deg,#5BB8F5,#86CCF6)", height: 54 }} />
          <div style={{ padding: "14px 16px", textAlign: "left", background: "#F2F3F7", marginTop: -30 }}>
            <div style={{ textAlign: "center", marginBottom: 12 }}>
              <span style={{ width: 64, height: 64, borderRadius: 9999, background: "#C7F303", color: "#0E1300", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22, border: "3px solid #F2F3F7" }}>YO</span>
              <div style={{ fontSize: 17, fontWeight: 600, marginTop: 6 }}>{you}</div>
              <div style={{ fontSize: 11, color: "#9A9AA8" }}>{app.role}</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#3B40B5", marginBottom: 6 }}>{app.availability}</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              <span style={{ flex: 1, height: 36, borderRadius: 9999, background: "#E8EAFF", color: "#3B40B5", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 11, fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: 9999, background: "#1E8E3E" }} />
                {app.online}
              </span>
              <span style={{ flex: 1, height: 36, borderRadius: 9999, border: "1px solid #E2E4E8", color: "#9A9AA8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{app.away}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "var(--display)" }}>1,284</div>
                <div style={{ fontSize: 10, color: "#9A9AA8" }}>{app.conversations}</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 16, padding: 12 }}>
                <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "var(--display)", color: "#1E8E3E" }}>97%</div>
                <div style={{ fontSize: 10, color: "#9A9AA8" }}>{app.csat}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── integrations ──────────────────────────────────────────────────────── */
const INTEGRATIONS: { name: string; bg: string; svg: ReactNode }[] = [
  {
    name: "Slack",
    bg: "#F4F4F6",
    svg: (
      <svg viewBox="0 0 24 24">
        <path d="M5.04 15.17a2.52 2.52 0 1 1-2.52-2.52h2.52zM6.3 15.17a2.52 2.52 0 0 1 5.04 0v6.3a2.52 2.52 0 0 1-5.04 0z" fill="#E01E5A" />
        <path d="M8.82 5.04A2.52 2.52 0 1 1 11.34 2.52v2.52zM8.82 6.3a2.52 2.52 0 0 1 0 5.04h-6.3a2.52 2.52 0 0 1 0-5.04z" fill="#36C5F0" />
        <path d="M18.96 8.83a2.52 2.52 0 1 1 2.52 2.52h-2.52zM17.7 8.83a2.52 2.52 0 0 1-5.04 0v-6.3a2.52 2.52 0 0 1 5.04 0z" fill="#2EB67D" />
        <path d="M15.18 18.96a2.52 2.52 0 1 1-2.52 2.52v-2.52zM15.18 17.7a2.52 2.52 0 0 1 0-5.04h6.3a2.52 2.52 0 0 1 0 5.04z" fill="#ECB22E" />
      </svg>
    ),
  },
  {
    name: "Jira",
    bg: "#F4F4F6",
    svg: (
      <svg viewBox="0 0 24 24" fill="#2684FF">
        <path d="M11.53 11.4 6.77 6.64a.6.6 0 0 0-.85 0l-3.9 3.9a.6.6 0 0 0 0 .85l9.5 9.5a.6.6 0 0 0 .86 0l3.9-3.9-4.75-4.75z" />
        <path d="M12.47 12.6l4.76 4.76a.6.6 0 0 0 .85 0l3.9-3.9a.6.6 0 0 0 0-.85l-9.5-9.5a.6.6 0 0 0-.85 0l-3.9 3.9 4.74 4.75z" opacity=".55" />
      </svg>
    ),
  },
  {
    name: "Shopify",
    bg: "#95BF47",
    svg: (
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M16.3 5.3c-.1 0-1.7.1-1.7.1s-1.1-1.1-1.3-1.2c-.1-.1-.3 0-.4 0l-.5.2c-.3-.9-.9-1.4-1.8-1.4-.6-.4-1.4.2-1.9 1-.5-.2-.9 0-1 .3-.4.1-.7.2-.7.2-.4.1-.4.1-.5.5C6.7 5.4 5 18.3 5 18.3l8.6 1.6 4.6-1.1S16.4 5.4 16.3 5.3zM12.6 4.4l-.9.3c0-.6-.1-1.3-.4-1.8.6.1 1 .8 1.3 1.5zm-1.6-1.3c.3.5.4 1.2.4 1.8l-1.6.5c.3-1.2.9-1.9 1.2-2.3zm-.8-.5c.1 0 .2 0 .3.1-.5.2-1 .9-1.3 2.3l-1.3.4c.4-1.2 1.2-2.8 2.3-2.8z" />
      </svg>
    ),
  },
  {
    name: "Stripe",
    bg: "#635BFF",
    svg: (
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M13.5 9.4c0-.6.5-.9 1.3-.9 1.1 0 2.5.4 3.6 1V6.1c-1.2-.5-2.4-.7-3.6-.7-3 0-4.9 1.5-4.9 4 0 3.9 5.4 3.3 5.4 5 0 .6-.6.9-1.4.9-1.2 0-2.8-.5-4-1.2v3.5c1.4.6 2.7.8 4 .8 3 0 5.1-1.5 5.1-4.1 0-4.2-5.5-3.5-5.5-5.1z" />
      </svg>
    ),
  },
  {
    name: "Zapier",
    bg: "#FF4F00",
    svg: (
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M14.4 12a2.4 2.4 0 0 1-.15.83l3.2 1.85a.3.3 0 0 1 .11.4l-1.1 1.9a.3.3 0 0 1-.4.1l-3.2-1.84a2.4 2.4 0 0 1-1.32.66v3.7a.3.3 0 0 1-.3.3H8.74a.3.3 0 0 1-.3-.3v-3.7a2.4 2.4 0 0 1-1.32-.66l-3.2 1.85a.3.3 0 0 1-.4-.11l-1.1-1.9a.3.3 0 0 1 .1-.4l3.2-1.85a2.4 2.4 0 0 1 0-1.66l-3.2-1.85a.3.3 0 0 1-.1-.4l1.1-1.9a.3.3 0 0 1 .4-.11l3.2 1.85a2.4 2.4 0 0 1 1.32-.66v-3.7a.3.3 0 0 1 .3-.3h2.5a.3.3 0 0 1 .3.3v3.7a2.4 2.4 0 0 1 1.32.66l3.2-1.85a.3.3 0 0 1 .4.11l1.1 1.9a.3.3 0 0 1-.11.4l-3.2 1.85c.1.27.16.55.15.83z" />
      </svg>
    ),
  },
  {
    name: "HubSpot",
    bg: "#FF7A59",
    svg: (
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M16.3 8.6V6.4a1.7 1.7 0 0 0 1-1.5V4.8a1.7 1.7 0 0 0-1.7-1.7h-.05a1.7 1.7 0 0 0-1.7 1.7v.05a1.7 1.7 0 0 0 1 1.5v2.2a4.8 4.8 0 0 0-2.3 1l-6-4.7a1.9 1.9 0 1 0-1 1.3l5.9 4.6a4.8 4.8 0 0 0 .07 5.4l-1.8 1.8a1.6 1.6 0 0 0-.45-.07 1.55 1.55 0 1 0 1.55 1.55c0-.16-.03-.3-.07-.45l1.78-1.78a4.85 4.85 0 1 0 3.77-8.6zm-.8 7.3a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    bg: "#181717",
    svg: (
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
      </svg>
    ),
  },
  {
    name: "Salesforce",
    bg: "#F4F4F6",
    svg: (
      <svg viewBox="0 0 24 24" fill="#00A1E0">
        <path d="M10.2 6.4a3.5 3.5 0 0 1 5.5-.9 4.2 4.2 0 0 1 6.1 3.8 4 4 0 0 1-2 3.5 4 4 0 0 1-5.3 4.8 4.5 4.5 0 0 1-8.2-.4 3.8 3.8 0 0 1-.8.08A3.7 3.7 0 0 1 4 13.9a3.6 3.6 0 0 1 1.9-6.7 4 4 0 0 1 4.3-.8z" />
      </svg>
    ),
  },
  {
    name: "Notion",
    bg: "#F4F4F6",
    svg: (
      <svg viewBox="0 0 24 24" fill="#000">
        <path d="M4.5 3.8 14 4.9c.8.07 1 .1 1.5.46l2 1.6c.3.24.4.3.4.55v12.7c0 .43-.16.68-.7.72l-11 .66c-.4.02-.6-.04-.82-.3l-2.4-3.1c-.24-.32-.34-.56-.34-.85V4.9c0-.5.22-.92 1.16-1.1z" />
        <path d="M14.3 5.8c.08-.42-.2-.5-.46-.5l-8.7.5 1.9 1.6c.2.16.4.16.7.14l6.56-.4z" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "Linear",
    bg: "#5E6AD2",
    svg: (
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M3 13.5 10.5 21A9 9 0 0 1 3 13.5zM3.05 11.2 12.8 21a9 9 0 0 0 2.2-.5L3.55 9a9 9 0 0 0-.5 2.2zM4.3 7.3 16.7 19.7a9 9 0 0 0 1.5-1.1L5.4 5.8A9 9 0 0 0 4.3 7.3zM6.6 4.6 19.4 17.4A9 9 0 0 0 6.6 4.6z" />
      </svg>
    ),
  },
  {
    name: "Intercom",
    bg: "#1F8DED",
    svg: (
      <svg viewBox="0 0 24 24" fill="#fff">
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4 13.4c0 .3-.2.5-.5.5-.3 0-2-1.4-3.5-1.4S9 15.9 8.5 15.9c-.3 0-.5-.2-.5-.5V8.6c0-.3.2-.5.5-.5s.5.2.5.5v6c.6-.4 1.9-1 3-1s2.4.6 3 1v-6c0-.3.2-.5.5-.5s.5.2.5.5z" />
      </svg>
    ),
  },
  {
    name: "Webhooks",
    bg: "#0E1300",
    svg: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#C7F303" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="8 7 3 12 8 17" />
        <polyline points="16 7 21 12 16 17" />
      </svg>
    ),
  },
];
