"use client";

import { useState, type CSSProperties } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { WhatsAppComposer, WhatsAppPreview, EmailRichEditor, EmailRichPreview, type SetField } from "./channels";
import {
  AUDIENCE_FILTERS, CAMPAIGN_TYPES, CAMPAIGN_TYPE_ORDER,
  type Campaign, type CampaignType, type CampaignStatus, type CatalogProduct,
} from "./data";

const ceLabel: CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 };

// ── Live preview of the message by channel ──────────────────────────────────
export function CampaignPreview({ type, body, c, products }: { type: CampaignType; body: string; c: Campaign; products: CatalogProduct[] }) {
  if (type === "whatsapp") return <WhatsAppPreview c={c} products={products || []} />;
  if (type === "email") return <EmailRichPreview c={c} />;
  const text = body || "Vista previa de tu mensaje…";
  if (type === "push") {
    return (
      <div style={{ background: "linear-gradient(160deg,#2a2c33,#16171c)", borderRadius: 20, padding: 20, minHeight: 150, display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", background: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)", borderRadius: 14, padding: 12, display: "flex", gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: 8, background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name="megaphone" size={18} style={{ color: "var(--color-on-primary)" }} /></span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#fff" }}>Wappy</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.45, marginTop: 1 }}>{text}</div>
          </div>
        </div>
      </div>
    );
  }
  // in_app — widget bubble
  return (
    <div style={{ background: "var(--neutral-100)", borderRadius: 18, padding: 20, minHeight: 150, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ maxWidth: 260, background: "var(--color-surface)", borderRadius: "16px 16px 16px 4px", padding: 14, boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ width: 26, height: 26, borderRadius: 9999, background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="messageCircle" size={14} style={{ color: "var(--color-on-primary)" }} /></span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-primary)" }}>Equipo Wappy</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{text}</div>
      </div>
    </div>
  );
}

const STEPS = ["Canal", "Audiencia", "Contenido", "Revisión"];

function schedBtn(on: boolean): CSSProperties {
  return { flex: 1, height: 42, borderRadius: 10, cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 600,
    background: on ? "var(--color-primary-subtle)" : "var(--color-surface)", color: on ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
    border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" };
}

const NEW_CAMPAIGN: Campaign = {
  id: "", name: "", type: "whatsapp", audience: "all", subject: "", body: "", status: "draft",
  wa: { category: "marketing", msgType: "normal", buttons: [] }, recipients: 0, opened: 0, clicked: 0,
};

export function CampaignEditor({ initial, products, onClose, onSave }: { initial?: Campaign; products: CatalogProduct[]; onClose: () => void; onSave: (c: Campaign) => void }) {
  const editing = !!initial;
  const [step, setStep] = useState(editing ? 2 : 0);
  const [c, setC] = useState<Campaign>(initial || NEW_CAMPAIGN);
  const set: SetField = (k, v) => setC((p) => ({ ...p, [k]: v }));
  const aud = AUDIENCE_FILTERS.find((a) => a.id === c.audience) || AUDIENCE_FILTERS[0];
  const t = CAMPAIGN_TYPES[c.type];

  const waOk = c.type !== "whatsapp" || c.wa?.category === "otp" || !!c.body.trim();
  const canContent = Boolean(
    c.name.trim() && waOk &&
    (c.type === "whatsapp" || c.type === "email" ? true : c.body.trim()) &&
    (c.type !== "email" || (c.subject && c.subject.trim()) || c.body.trim())
  );

  const finish = (status: CampaignStatus) => onSave({
    ...c, status, recipients: aud.count, opened: c.opened || 0, clicked: c.clicked || 0,
    ...(status === "scheduled" ? { scheduledAt: c.scheduledAt || "Pronto" } : status === "sent" ? { sentAt: "Justo ahora" } : {}),
  });

  return (
    <Modal onClose={onClose} width={680}>
      <ModalHeader title={editing ? "Editar campaña" : "Nueva campaña"} subtitle={t.label} onClose={onClose} />
      {/* Stepper */}
      <div style={{ display: "flex", gap: 6, padding: "12px 22px", borderBottom: "1px solid var(--color-border)" }}>
        {STEPS.map((label, i) => (
          <div key={label} onClick={() => { if (i < step) setStep(i); }} style={{ display: "flex", alignItems: "center", gap: 7, cursor: i < step ? "pointer" : "default" }}>
            <span style={{ width: 22, height: 22, borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
              background: i <= step ? "var(--color-primary)" : "var(--neutral-200)", color: i <= step ? "var(--color-on-primary)" : "var(--color-text-tertiary)" }}>{i < step ? "✓" : i + 1}</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: i <= step ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>{label}</span>
            {i < STEPS.length - 1 && <span style={{ width: 18, height: 1, background: "var(--color-border)", marginLeft: 4 }} />}
          </div>
        ))}
      </div>

      <div style={{ padding: "20px 22px", maxHeight: "56vh", overflowY: "auto" }}>
        {/* Step 0 — type */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {CAMPAIGN_TYPE_ORDER.map((id) => {
              const ct = CAMPAIGN_TYPES[id];
              const on = c.type === id;
              return (
                <div key={id} onClick={() => set("type", id)} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 14, cursor: "pointer",
                  background: on ? "var(--color-primary-subtle)" : "var(--color-surface)", border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" }}>
                  <span style={{ width: 44, height: 44, borderRadius: 11, background: ct.tint.bg, color: ct.tint.fg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name={ct.icon} size={22} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>{ct.label}</div>
                    <div style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>{ct.blurb}</div>
                  </div>
                  {on && <Icon name="check2" size={20} style={{ color: "var(--color-primary-ink)" }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Step 1 — audience */}
        {step === 1 && (
          <div>
            <div style={ceLabel}>¿Quién debe recibir esto?</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {AUDIENCE_FILTERS.map((a) => {
                const on = c.audience === a.id;
                return (
                  <div key={a.id} onClick={() => set("audience", a.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, cursor: "pointer",
                    background: on ? "var(--color-primary-subtle)" : "var(--color-surface)", border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" }}>
                    <span style={{ width: 20, height: 20, borderRadius: 9999, border: on ? "6px solid var(--color-primary)" : "2px solid var(--color-border-strong)", flex: "none", boxSizing: "border-box" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{a.label}</div>
                      <div className="tnum" style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{a.count.toLocaleString()} contactos</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2 — content + live preview */}
        {step === 2 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
            <div>
              <div style={{ marginBottom: 14 }}>
                <label style={ceLabel}>Nombre de la campaña <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(interno)</span></label>
                <input className="fobo-input" autoFocus value={c.name} placeholder="p. ej. Recordatorio prueba junio" onChange={(e) => set("name", e.target.value)} />
              </div>
              {c.type === "whatsapp" ? (
                <WhatsAppComposer c={c} set={set} products={products || []} />
              ) : c.type === "email" ? (
                <EmailRichEditor c={c} set={set} />
              ) : (
                <div>
                  <label style={ceLabel}>Mensaje {c.type === "push" && <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(que sea breve)</span>}</label>
                  <textarea className="fobo-input" style={{ height: "auto", minHeight: 120, paddingTop: 12, resize: "vertical", lineHeight: 1.5 }}
                    value={c.body} placeholder="Escribe tu mensaje…" onChange={(e) => set("body", e.target.value)} />
                  <div style={{ fontSize: 11.5, color: "var(--color-text-tertiary)", marginTop: 6 }}>Usa <code style={{ fontFamily: "var(--font-mono)" }}>{"{{name}}"}</code> para personalizar.</div>
                </div>
              )}
            </div>
            <div>
              <div style={ceLabel}>Vista previa en vivo</div>
              <CampaignPreview type={c.type} body={c.body} c={c} products={products} />
            </div>
          </div>
        )}

        {/* Step 3 — review */}
        {step === 3 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
            <div>
              <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, overflow: "hidden" }}>
                {([["Campaña", c.name || "Sin título"], ["Canal", t.label], ["Audiencia", `${aud.label} · ${aud.count.toLocaleString()} contactos`], ...(c.type === "email" ? [["Asunto", c.subject || "—"] as [string, string]] : [])] as [string, string][]).map(([k, v], i, arr) => (
                  <div key={k} style={{ display: "flex", gap: 12, padding: "13px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                    <span style={{ width: 90, flex: "none", fontSize: 12.5, color: "var(--color-text-tertiary)" }}>{k}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--color-text-primary)" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={ceLabel}>Programación</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => set("when", "now")} style={schedBtn(c.when !== "later")}>Enviar ahora</button>
                  <button onClick={() => set("when", "later")} style={schedBtn(c.when === "later")}>Programar</button>
                </div>
                {c.when === "later" && <input className="fobo-input" style={{ marginTop: 10 }} placeholder="8 jun 2026, 09:00" value={c.scheduledAt || ""} onChange={(e) => set("scheduledAt", e.target.value)} />}
              </div>
            </div>
            <div>
              <div style={ceLabel}>Vista previa</div>
              <CampaignPreview type={c.type} body={c.body} c={c} products={products} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 22px", borderTop: "1px solid var(--color-border)" }}>
        {step > 0
          ? <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => setStep(step - 1)}>Atrás</button>
          : <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          {step === 2 && <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => finish("draft")}>Guardar borrador</button>}
          {step < 3
            ? <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={step === 2 && !canContent} style={(step === 2 && !canContent) ? { opacity: 0.5, cursor: "not-allowed" } : {}} onClick={() => setStep(step + 1)}>Continuar</button>
            : <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => finish(c.when === "later" ? "scheduled" : "sent")}>
                <Icon name={c.when === "later" ? "clock" : "send"} size={16} /> {c.when === "later" ? "Programar" : "Enviar ahora"}
              </button>}
        </div>
      </div>
    </Modal>
  );
}
