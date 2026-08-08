"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { CONTENT, type Lang, type SiteContent } from "./content";
import { Toast } from "./Toast";
import { DemoModal } from "./DemoModal";
import { CompareModal } from "./CompareModal";

const LANG_KEY = "wappy.site.lang";
const SIGNIN_HREF = "/login";

interface MarketingCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: SiteContent;
  signInHref: string;
  toast: (msg: string) => void;
  startTrial: () => void;
  openDemo: () => void;
  openCompare: () => void;
}

const Ctx = createContext<MarketingCtx | null>(null);

export function useMarketing(): MarketingCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMarketing must be used inside <MarketingProvider>");
  return ctx;
}

export function MarketingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>("es");
  const [toastText, setToastText] = useState("");
  const [toastShow, setToastShow] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Restore saved language after mount. Reading localStorage during the initial
  // render would diverge from SSR (which has no `window`) and cause a hydration
  // mismatch, so we intentionally set state once on mount instead.
  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration-safe restore
    if (saved === "es" || saved === "en") setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore private-mode storage errors */
    }
    document.documentElement.lang = l;
  }, []);

  const toast = useCallback((msg: string) => {
    setToastText(msg);
    setToastShow(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2600);
  }, []);

  const t = CONTENT[lang];

  const startTrial = useCallback(() => {
    toast(t.toasts.trialStarting);
    setTimeout(() => router.push(SIGNIN_HREF), 900);
  }, [toast, t.toasts.trialStarting, router]);

  const openDemo = useCallback(() => setDemoOpen(true), []);
  const openCompare = useCallback(() => setCompareOpen(true), []);

  // Close modals with Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDemoOpen(false);
        setCompareOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider
      value={{ lang, setLang, t, signInHref: SIGNIN_HREF, toast, startTrial, openDemo, openCompare }}
    >
      {children}
      <Toast text={toastText} show={toastShow} />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} />
    </Ctx.Provider>
  );
}
