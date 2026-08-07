"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useOnboardingStore } from "@/store/onboarding";

interface Step { id: string; title: string; desc: string; icon: IconName; href?: string }

const SETUP_STEPS: Step[] = [
  { id: "workspace", title: "Nombra tu espacio", desc: "Define tu identidad y URL", icon: "building", href: "/app/settings" },
  { id: "channel", title: "Conecta un canal", desc: "WhatsApp, email, web y más", icon: "megaphone", href: "/app/connections" },
  { id: "widget", title: "Instala el widget de chat", desc: "Dos líneas de código en tu sitio", icon: "messageCircle" },
  { id: "team", title: "Invita a tu equipo", desc: "Suma agentes al espacio", icon: "userPlus", href: "/app/settings" },
  { id: "article", title: "Escribe tu primer artículo", desc: "Puebla tu centro de ayuda", icon: "fileText", href: "/app/help-center" },
];

function Ring({ pct, size = 44, stroke = 4 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flex: "none" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--neutral-200)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-primary)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: "stroke-dashoffset .5s var(--ease-out)" }} />
    </svg>
  );
}

function WelcomeModal({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center" style={{ background: "var(--color-overlay-scrim)", backdropFilter: "blur(3px)", padding: 24, animation: "fadeIn .2s ease" }}>
      <div style={{ width: 460, maxWidth: "100%", background: "var(--color-surface)", borderRadius: 24, overflow: "hidden", boxShadow: "var(--shadow-3)", animation: "fadeUp .26s var(--ease-spring)" }}>
        <div className="text-center relative" style={{ background: "linear-gradient(160deg, #C7F303 0%, #A8D400 100%)", padding: "36px 32px 30px" }}>
          <span className="inline-flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: 18, background: "#0E1300", boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}><Icon name="rocket" size={30} style={{ color: "#C7F303" }} /></span>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "#0E1300", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 18 }}>Te damos la bienvenida a Wappy 👋</div>
          <div style={{ fontSize: 14.5, color: "rgba(14,19,0,0.62)", marginTop: 6, fontWeight: 500 }}>Pongamos tu soporte en marcha en 5 pasos rápidos.</div>
        </div>
        <div style={{ padding: "22px 28px 26px" }}>
          <div className="flex flex-col gap-1" style={{ marginBottom: 22 }}>
            {SETUP_STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3" style={{ padding: "8px 0" }}>
                <span className="flex items-center justify-center flex-none" style={{ width: 34, height: 34, borderRadius: 10, background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}><Icon name={s.icon} size={17} /></span>
                <div className="flex-1">
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{s.desc}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-disabled)" }}>{i + 1}</span>
              </div>
            ))}
          </div>
          <button className="fobo-btn fobo-btn-primary" style={{ width: "100%", marginBottom: 10 }} onClick={onStart}><Icon name="rocket" size={17} /> Empezar configuración</button>
          <button className="fobo-btn fobo-btn-ghost" style={{ width: "100%", height: 40 }} onClick={onSkip}>Explorar por mi cuenta</button>
        </div>
      </div>
    </div>
  );
}

function SnippetModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const snippet = `<script>\n  window.Wappy = { workspaceId: 'ws_abc123' };\n</script>\n<script src="https://cdn.wappy.dev/widget.js" async defer></script>`;
  const copy = () => { void navigator.clipboard?.writeText(snippet); toast("Snippet copiado al portapapeles"); };
  return (
    <Modal onClose={onClose} width={520}>
      <ModalHeader title="Instala el widget de chat" subtitle="Pega esto antes de la etiqueta </body> de tu sitio" onClose={onClose} />
      <div style={{ padding: "18px 22px" }}>
        <div style={{ background: "var(--color-surface-dark)", borderRadius: 12, padding: 16 }}>
          <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.6, color: "#C7F303", whiteSpace: "pre-wrap" }}>{snippet}</pre>
        </div>
        <div className="flex items-center gap-2" style={{ marginTop: 14, fontSize: 12.5, color: "var(--color-text-tertiary)" }}>
          <Icon name="shield" size={15} /> El widget pesa menos de 30 KB y respeta tus tokens de marca automáticamente.
        </div>
      </div>
      <div className="flex justify-end gap-2.5" style={{ padding: "14px 22px", borderTop: "1px solid var(--color-border)" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={copy}><Icon name="copy" size={15} /> Copiar snippet</button>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={onDone}><Icon name="check2" size={16} /> Ya lo instalé</button>
      </div>
    </Modal>
  );
}

function SetupChecklist({ done, onStep, onDismiss, expanded, setExpanded }: {
  done: Record<string, boolean>; onStep: (s: Step) => void; onDismiss: () => void; expanded: boolean; setExpanded: (v: boolean) => void;
}) {
  const total = SETUP_STEPS.length;
  const completed = SETUP_STEPS.filter((s) => done[s.id]).length;
  const pct = completed / total;
  const allDone = completed === total;

  return (
    <div className="fixed z-[80]" style={{ bottom: 22, right: 22, width: expanded ? 332 : "auto", fontFamily: "var(--font-ui)" }}>
      {expanded ? (
        <div style={{ background: "var(--color-surface)", borderRadius: 18, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-3)", overflow: "hidden", animation: "fadeUp .22s var(--ease-spring)" }}>
          <div style={{ padding: "18px 18px 16px", background: allDone ? "linear-gradient(160deg, #C7F303, #A8D400)" : "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
            <div className="flex items-center gap-3">
              <Ring pct={pct} />
              <div className="flex-1">
                <div style={{ fontSize: 15, fontWeight: 700, color: allDone ? "#0E1300" : "var(--color-text-primary)" }}>{allDone ? "¡Todo listo! 🎉" : "Primeros pasos"}</div>
                <div style={{ fontSize: 12.5, color: allDone ? "rgba(14,19,0,0.6)" : "var(--color-text-tertiary)" }}>{completed} de {total} completados</div>
              </div>
              <button onClick={() => setExpanded(false)} aria-label="Contraer" className="flex items-center justify-center rounded-full border-none cursor-pointer" style={{ width: 28, height: 28, background: "transparent", color: allDone ? "#0E1300" : "var(--color-text-secondary)" }}><Icon name="chevronDown" size={18} /></button>
            </div>
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {SETUP_STEPS.map((s) => {
              const isDone = done[s.id];
              return (
                <div key={s.id} onClick={() => !isDone && onStep(s)} className="flex items-center gap-3" style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", cursor: isDone ? "default" : "pointer" }}
                  onMouseEnter={(e) => { if (!isDone) e.currentTarget.style.background = "var(--neutral-100)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                  <span className="flex items-center justify-center flex-none rounded-full" style={{ width: 24, height: 24, background: isDone ? "var(--color-primary)" : "transparent", border: isDone ? "none" : "2px solid var(--color-border-strong)", color: "var(--color-on-primary)" }}>
                    {isDone && <Icon name="check2" size={14} />}
                  </span>
                  <div className="flex-1">
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: isDone ? "var(--color-text-tertiary)" : "var(--color-text-primary)", textDecoration: isDone ? "line-through" : "none" }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{s.desc}</div>
                  </div>
                  {!isDone && <Icon name="chevronR" size={16} style={{ color: "var(--color-text-tertiary)" }} />}
                </div>
              );
            })}
          </div>
          {allDone && <div style={{ padding: 14 }}><button className="fobo-btn fobo-btn-primary fobo-btn-sm" style={{ width: "100%" }} onClick={onDismiss}>Finalizar y cerrar</button></div>}
        </div>
      ) : (
        <button onClick={() => setExpanded(true)} className="flex items-center gap-2.5 cursor-pointer border-none" style={{ height: 52, padding: "0 18px 0 10px", borderRadius: 9999, background: "var(--color-surface)", boxShadow: "var(--shadow-3)" }}>
          <Ring pct={pct} size={36} stroke={3.5} />
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-text-primary)" }}>{allDone ? "Configuración lista 🎉" : `Setup · ${completed}/${total}`}</span>
        </button>
      )}
    </div>
  );
}

export function OnboardingLauncher() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [snippetOpen, setSnippetOpen] = useState(false);
  const { seenWelcome, dismissed, expanded, done, setSeenWelcome, setDismissed, setExpanded, markDone } = useOnboardingStore();

  useEffect(() => {
    // Rehydrate the persisted store, then flip `hydrated` on the resulting
    // microtask (not synchronously in the effect body) so it stays lint-clean.
    Promise.resolve(useOnboardingStore.persist.rehydrate()).then(() => setHydrated(true));
  }, []);

  if (!hydrated) return null;

  const onStep = (s: Step) => {
    if (s.id === "widget") { setSnippetOpen(true); return; }
    markDone(s.id);
    if (s.href) router.push(s.href);
  };

  return (
    <>
      {!seenWelcome && (
        <WelcomeModal
          onStart={() => setSeenWelcome(true)}
          onSkip={() => { setSeenWelcome(true); setDismissed(true); }}
        />
      )}
      {seenWelcome && !dismissed && (
        <SetupChecklist done={done} onStep={onStep} onDismiss={() => setDismissed(true)} expanded={expanded} setExpanded={setExpanded} />
      )}
      {snippetOpen && <SnippetModal onClose={() => setSnippetOpen(false)} onDone={() => { markDone("widget"); setSnippetOpen(false); }} />}
    </>
  );
}
