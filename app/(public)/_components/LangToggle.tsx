"use client";

import { useMarketing } from "./MarketingProvider";

export function LangToggle() {
  const { lang, setLang } = useMarketing();
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button
        type="button"
        className={lang === "es" ? "active" : undefined}
        aria-pressed={lang === "es"}
        onClick={() => setLang("es")}
      >
        ES
      </button>
      <button
        type="button"
        className={lang === "en" ? "active" : undefined}
        aria-pressed={lang === "en"}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
}
