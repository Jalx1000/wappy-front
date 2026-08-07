"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  WA_CATEGORIES, WA_CATEGORY_ORDER, WA_MESSAGE_TYPES, WA_MESSAGE_TYPE_ORDER,
  type Campaign, type CatalogProduct, type WaConfig, type WaButton, type WaButtonType,
} from "./data";

export type SetField = <K extends keyof Campaign>(key: K, value: Campaign[K]) => void;

const chLabel: CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 };
const segBtn = (on: boolean): CSSProperties => ({
  flex: 1, height: 38, borderRadius: 9, cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600,
  background: on ? "var(--color-primary-subtle)" : "var(--color-surface)", color: on ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
  border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
});
const miniX: CSSProperties = { width: 40, height: 48, borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-tertiary)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" };

// ════════════════════════════════ WHATSAPP ════════════════════════════════
export function WhatsAppComposer({ c, set, products }: { c: Campaign; set: SetField; products: CatalogProduct[] }) {
  const wa = c.wa || {};
  const setWa = <K extends keyof WaConfig>(k: K, v: WaConfig[K]) => set("wa", { ...wa, [k]: v });
  const cat = wa.category || "marketing";
  const mt = wa.msgType || "normal";
  const buttons = wa.buttons || [];
  const isOtp = cat === "otp";

  const setBtn = (i: number, k: keyof WaButton, v: string) => setWa("buttons", buttons.map((b, j) => (j === i ? { ...b, [k]: v } : b)));
  const addBtn = () => buttons.length < 3 && setWa("buttons", [...buttons, { type: "quick", label: "" }]);
  const rmBtn = (i: number) => setWa("buttons", buttons.filter((_, j) => j !== i));
  const rows = wa.rows || ["", ""];

  return (
    <div>
      {/* Category */}
      <div style={{ marginBottom: 16 }}>
        <label style={chLabel}>Categoría de plantilla</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {WA_CATEGORY_ORDER.map((id) => {
            const ct = WA_CATEGORIES[id];
            const on = cat === id;
            return (
              <div key={id} onClick={() => setWa("category", id)} style={{ padding: "12px 12px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                background: on ? "var(--color-primary-subtle)" : "var(--color-surface)", border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" }}>
                <span style={{ width: 34, height: 34, borderRadius: 9, background: ct.tint.bg, color: ct.tint.fg, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 6 }}><Icon name={ct.icon} size={17} /></span>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{ct.label}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 1, lineHeight: 1.3 }}>{ct.blurb}</div>
              </div>
            );
          })}
        </div>
      </div>

      {isOtp ? (
        <div style={{ background: "var(--color-success-bg)", borderRadius: 12, padding: 14, marginBottom: 4 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-success-dark)", marginBottom: 4 }}>Plantilla de autenticación</div>
          <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>El cuerpo del OTP lo fija WhatsApp: <i>“{"{{1}}"} es tu código de verificación.”</i> Elige la validez y un botón para copiar el código.</div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <div style={{ flex: 1 }}><label style={chLabel}>Expiración (min)</label><input className="fobo-input" type="number" value={wa.expiry ?? 10} onChange={(e) => setWa("expiry", e.target.value)} /></div>
            <div style={{ flex: 1 }}><label style={chLabel}>Texto del botón</label><input className="fobo-input" value={wa.copyLabel || "Copiar código"} onChange={(e) => setWa("copyLabel", e.target.value)} /></div>
          </div>
        </div>
      ) : (
        <>
          {/* Message type */}
          <div style={{ marginBottom: 16 }}>
            <label style={chLabel}>Tipo de mensaje</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {WA_MESSAGE_TYPE_ORDER.map((id) => {
                const m = WA_MESSAGE_TYPES[id];
                const on = mt === id;
                return (
                  <button key={id} type="button" onClick={() => setWa("msgType", id)} style={{ ...segBtn(on), flexDirection: "column", height: "auto", padding: "10px 4px", gap: 4 }}>
                    <Icon name={m.icon} size={17} /> {m.label}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--color-text-tertiary)", marginTop: 6 }}>{WA_MESSAGE_TYPES[mt].blurb}</div>
          </div>

          {/* Header (text types) */}
          {(mt === "normal" || mt === "buttons" || mt === "list") && (
            <div style={{ marginBottom: 12 }}>
              <label style={chLabel}>Encabezado <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(opcional)</span></label>
              <input className="fobo-input" value={wa.header || ""} placeholder="Título en negrita arriba" onChange={(e) => setWa("header", e.target.value)} />
            </div>
          )}

          {/* Product picker */}
          {mt === "product" && (
            <div style={{ marginBottom: 12 }}>
              <label style={chLabel}>Producto</label>
              <select className="fobo-input" value={wa.productId || ""} onChange={(e) => setWa("productId", e.target.value)}>
                <option value="">Selecciona un producto…</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} — ${p.price.toFixed(2)}</option>)}
              </select>
            </div>
          )}

          {/* Body */}
          <div style={{ marginBottom: 12 }}>
            <label style={chLabel}>Cuerpo</label>
            <textarea className="fobo-input" style={{ height: "auto", minHeight: 90, paddingTop: 12, resize: "vertical", lineHeight: 1.5 }}
              value={wa.body || ""} placeholder="Hola {{name}}, …" onChange={(e) => { setWa("body", e.target.value); set("body", e.target.value); }} />
            <div style={{ fontSize: 11.5, color: "var(--color-text-tertiary)", marginTop: 5 }}>Usa <code style={{ fontFamily: "var(--font-mono)" }}>{"{{name}}"}</code> o variables numeradas <code style={{ fontFamily: "var(--font-mono)" }}>{"{{1}}"}</code>.</div>
          </div>

          {/* List rows */}
          {mt === "list" && (
            <div style={{ marginBottom: 12 }}>
              <label style={chLabel}>Filas de la lista</label>
              {rows.map((row, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <input className="fobo-input" value={row} placeholder={`Opción ${i + 1}`} onChange={(e) => setWa("rows", rows.map((r, j) => (j === i ? e.target.value : r)))} />
                  {rows.length > 1 && <button type="button" onClick={() => setWa("rows", rows.filter((_, j) => j !== i))} style={miniX}><Icon name="x" size={15} /></button>}
                </div>
              ))}
              <button type="button" className="fobo-btn fobo-btn-ghost fobo-btn-sm" style={{ height: 32, padding: "0 10px" }} onClick={() => setWa("rows", [...rows, ""])}><Icon name="plus" size={14} /> Añadir fila</button>
            </div>
          )}

          {/* Footer */}
          {mt !== "product" && (
            <div style={{ marginBottom: 12 }}>
              <label style={chLabel}>Pie <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(opcional)</span></label>
              <input className="fobo-input" value={wa.footer || ""} placeholder="Texto gris pequeño al final" onChange={(e) => setWa("footer", e.target.value)} />
            </div>
          )}

          {/* Buttons */}
          {(mt === "normal" || mt === "buttons" || mt === "product") && (
            <div>
              <label style={chLabel}>Botones <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(hasta 3)</span></label>
              {buttons.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <select className="fobo-input" style={{ width: 130, flex: "none" }} value={b.type} onChange={(e) => setBtn(i, "type", e.target.value as WaButtonType)}>
                    <option value="quick">Respuesta rápida</option>
                    <option value="url">Visitar URL</option>
                    <option value="phone">Llamar</option>
                  </select>
                  <input className="fobo-input" value={b.label} placeholder="Texto del botón" onChange={(e) => setBtn(i, "label", e.target.value)} />
                  <button type="button" onClick={() => rmBtn(i)} style={miniX}><Icon name="x" size={15} /></button>
                </div>
              ))}
              {buttons.length < 3 && <button type="button" className="fobo-btn fobo-btn-ghost fobo-btn-sm" style={{ height: 32, padding: "0 10px" }} onClick={addBtn}><Icon name="plus" size={14} /> Añadir botón</button>}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// WhatsApp phone preview
export function WhatsAppPreview({ c, products }: { c: Pick<Campaign, "wa" | "body">; products: CatalogProduct[] }) {
  const wa = c.wa || {};
  const cat = wa.category || "marketing";
  const mt = wa.msgType || "normal";
  const product = (products || []).find((p) => p.id === wa.productId);
  const buttons = wa.buttons || [];
  return (
    <div style={{ background: "#E5DDD5", borderRadius: 18, padding: 16, minHeight: 200,
      backgroundImage: "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "12px 12px" }}>
      <div style={{ maxWidth: 248, background: "#fff", borderRadius: "10px 10px 10px 2px", boxShadow: "0 1px 2px rgba(0,0,0,0.15)", overflow: "hidden" }}>
        {cat === "otp" ? (
          <div style={{ padding: 10 }}>
            <div style={{ fontSize: 13.5, color: "#111", lineHeight: 1.4 }}><b>123-456</b> es tu código de verificación. Por seguridad, no lo compartas.</div>
            <div style={{ fontSize: 11, color: "#667781", marginTop: 4 }}>Este código expira en {wa.expiry || 10} minutos.</div>
          </div>
        ) : mt === "product" && product ? (
          <div>
            <div style={{ height: 90, background: "var(--neutral-100)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="box" size={30} style={{ color: "var(--color-text-tertiary)" }} /></div>
            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#111" }}>{product.name}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginTop: 2 }}>${product.price.toFixed(2)}</div>
              {wa.body && <div style={{ fontSize: 12.5, color: "#111", marginTop: 6, lineHeight: 1.4 }}>{wa.body}</div>}
            </div>
          </div>
        ) : (
          <div style={{ padding: 10 }}>
            {wa.header && <div style={{ fontSize: 13.5, fontWeight: 700, color: "#111", marginBottom: 4 }}>{wa.header}</div>}
            <div style={{ fontSize: 13.5, color: "#111", lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{wa.body || "Vista previa de tu mensaje…"}</div>
            {mt === "list" && (wa.rows || []).filter(Boolean).length > 0 && (
              <div style={{ marginTop: 8, borderTop: "1px solid #eee", paddingTop: 6 }}>
                {(wa.rows || []).filter(Boolean).map((r, i) => <div key={i} style={{ fontSize: 12.5, color: "#111", padding: "5px 0", borderBottom: "1px solid #f3f3f3" }}>{r}</div>)}
              </div>
            )}
            {wa.footer && <div style={{ fontSize: 11, color: "#667781", marginTop: 6 }}>{wa.footer}</div>}
          </div>
        )}
        <div style={{ textAlign: "right", padding: "0 8px 5px", fontSize: 10, color: "#667781" }}>12:30 ✓✓</div>
        {/* buttons */}
        {cat !== "otp" && mt === "list" ? (
          <div style={{ borderTop: "1px solid #eee", padding: 8, textAlign: "center", color: "#128C45", fontSize: 13, fontWeight: 600 }}><Icon name="sort" size={14} style={{ verticalAlign: "-2px" }} /> Ver opciones</div>
        ) : cat === "otp" ? (
          <div style={{ borderTop: "1px solid #eee", padding: 9, textAlign: "center", color: "#128C45", fontSize: 13, fontWeight: 600 }}>{wa.copyLabel || "Copiar código"}</div>
        ) : buttons.filter((b) => b.label).length > 0 ? (
          <div>{buttons.filter((b) => b.label).map((b, i) => (
            <div key={i} style={{ borderTop: "1px solid #eee", padding: 9, textAlign: "center", color: "#128C45", fontSize: 13, fontWeight: 600 }}>
              <Icon name={b.type === "url" ? "cursor" : b.type === "phone" ? "phone" : "messageCircle"} size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />{b.label}
            </div>
          ))}</div>
        ) : null}
      </div>
    </div>
  );
}

// ════════════════════════════════ EMAIL ════════════════════════════════
function tabBtn(on: boolean): CSSProperties {
  return { height: 26, padding: "0 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
    background: on ? "var(--color-surface)" : "transparent", color: on ? "var(--color-text-primary)" : "var(--color-text-tertiary)", boxShadow: on ? "0 1px 2px rgba(0,0,0,0.1)" : "none" };
}

function ToolBtn({ onExec, cmd, val, icon, label }: { onExec: (cmd: string, val?: string) => void; cmd: string; val?: string; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" title={label} onMouseDown={(e) => { e.preventDefault(); onExec(cmd, val); }}
      style={{ width: 32, height: 32, borderRadius: 7, border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
      {icon}
    </button>
  );
}

export function EmailRichEditor({ c, set }: { c: Campaign; set: SetField }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [html, setHtml] = useState(c.body || "<p>Hola {{name}},</p><p>Esto es lo nuevo este mes en Wappy.</p>");

  // Restore the stored HTML into the contentEditable node when returning to visual
  // mode. The `!== html` guard means a keystroke (which already matches the DOM)
  // never re-writes innerHTML, so the caret is preserved.
  useEffect(() => {
    if (mode === "visual" && ref.current && ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
    }
  }, [mode, html]);

  const sync = (h: string) => { setHtml(h); set("body", h); };
  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); if (ref.current) sync(ref.current.innerHTML); };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <label style={chLabel}>Asunto</label>
        <input className="fobo-input" value={c.subject || ""} placeholder="Tu asunto…" onChange={(e) => set("subject", e.target.value)} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={chLabel}>Preencabezado <span style={{ color: "var(--color-text-tertiary)", fontWeight: 400 }}>(texto de vista previa)</span></label>
        <input className="fobo-input" value={c.preheader || ""} placeholder="Se muestra tras el asunto en la mayoría de bandejas" onChange={(e) => set("preheader", e.target.value)} />
      </div>
      <label style={chLabel}>Cuerpo</label>
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
        {/* toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, padding: 6, borderBottom: "1px solid var(--color-border)", background: "var(--color-background)", flexWrap: "wrap" }}>
          <ToolBtn onExec={exec} cmd="bold" icon={<b>B</b>} label="Negrita" />
          <ToolBtn onExec={exec} cmd="italic" icon={<i>I</i>} label="Cursiva" />
          <ToolBtn onExec={exec} cmd="underline" icon={<u>U</u>} label="Subrayado" />
          <span style={{ width: 1, height: 20, background: "var(--color-border)", margin: "0 4px" }} />
          <ToolBtn onExec={exec} cmd="formatBlock" val="<h2>" icon="H" label="Encabezado" />
          <ToolBtn onExec={exec} cmd="insertUnorderedList" icon={<Icon name="sort" size={15} />} label="Lista" />
          <ToolBtn onExec={exec} cmd="justifyLeft" icon="≡" label="Alinear a la izquierda" />
          <span style={{ width: 1, height: 20, background: "var(--color-border)", margin: "0 4px" }} />
          <ToolBtn onExec={exec} cmd="createLink" val="https://wappy.dev" icon={<Icon name="cursor" size={15} />} label="Insertar enlace" />
          <button type="button" title="Insertar botón" onMouseDown={(e) => { e.preventDefault(); exec("insertHTML", '<a href="#" style="display:inline-block;padding:10px 18px;background:#C7F303;color:#1a1c00;border-radius:9999px;font-weight:600;text-decoration:none">Botón</a>'); }}
            style={{ height: 32, padding: "0 10px", borderRadius: 7, border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>+ Botón</button>
          <div style={{ marginLeft: "auto", display: "flex", gap: 2, background: "var(--neutral-100)", borderRadius: 8, padding: 2 }}>
            <button type="button" onClick={() => setMode("visual")} style={tabBtn(mode === "visual")}>Visual</button>
            <button type="button" onClick={() => { if (ref.current) sync(ref.current.innerHTML); setMode("html"); }} style={tabBtn(mode === "html")}>HTML</button>
          </div>
        </div>
        {/* editor / html */}
        {mode === "visual" ? (
          <div ref={ref} contentEditable suppressContentEditableWarning onInput={(e) => sync(e.currentTarget.innerHTML)}
            style={{ minHeight: 180, padding: 16, fontSize: 14, lineHeight: 1.6, color: "var(--color-text-primary)", outline: "none", fontFamily: "var(--font-ui)" }} />
        ) : (
          <textarea value={html} onChange={(e) => sync(e.target.value)} spellCheck={false}
            style={{ width: "100%", boxSizing: "border-box", minHeight: 180, padding: 16, border: "none", outline: "none", resize: "vertical",
              fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.6, background: "var(--color-surface-dark)", color: "#d7f56b" }} />
        )}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--color-text-tertiary)", marginTop: 6 }}>Edita visualmente o cambia a <b>HTML</b> para control total. Usa <code style={{ fontFamily: "var(--font-mono)" }}>{"{{name}}"}</code> para personalizar.</div>
    </div>
  );
}

export function EmailRichPreview({ c }: { c: Pick<Campaign, "subject" | "preheader" | "body"> }) {
  return (
    <div style={{ background: "var(--neutral-100)", borderRadius: 14, padding: 14 }}>
      <div style={{ background: "var(--color-surface)", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{c.subject || "Tu asunto"}</div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 1 }}>{c.preheader || "Wappy Support · support@wappy.dev"}</div>
        </div>
        <div style={{ padding: 14, fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: c.body || "<p style='color:var(--color-text-tertiary)'>El cuerpo de tu email…</p>" }} />
      </div>
    </div>
  );
}
