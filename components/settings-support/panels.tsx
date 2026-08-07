"use client";

import { useState } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useWorkspaceStore } from "@/store/workspace";
import { ChannelIcon, ToggleRow } from "./shared";
import {
  st, CHANNELS, CHANNEL_ORDER, CHANNEL_FIELD, DAY_ORDER, DAY_FULL, PLANS, INVOICES,
  type Notifications,
} from "./data";

// ── General ──────────────────────────────────────────────────────────────────
export function WorkspacePanel() {
  const { workspace, setWorkspace } = useWorkspaceStore();
  const toast = useToast();
  const [name, setName] = useState(workspace.name);
  const [slug, setSlug] = useState(workspace.slug);
  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={st.h1}>General</h1>
      <p style={st.lead}>Información básica de tu espacio de trabajo.</p>
      <div style={st.card}>
        <div style={st.cardHead}><div style={st.cardTitle}>Identidad</div></div>
        <div style={{ padding: 20 }}>
          <div className="flex items-center gap-4" style={{ marginBottom: 20 }}>
            <span className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 14, background: "var(--color-primary)", color: "var(--color-on-primary)", fontWeight: 700, fontSize: 22, fontFamily: "var(--font-display)" }}>{name[0] || "W"}</span>
            <button className="fobo-btn fobo-btn-secondary fobo-btn-sm"><Icon name="edit" size={15} /> Cambiar logo</button>
          </div>
          <div style={st.field}>
            <label style={st.fieldLabel}>Nombre del espacio</label>
            <input className="fobo-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={st.field}>
            <label style={st.fieldLabel}>URL del espacio</label>
            <div className="flex items-center">
              <span className="flex items-center" style={{ height: 48, padding: "0 12px", background: "var(--color-background)", border: "1px solid var(--color-border)", borderRight: "none", borderRadius: "14px 0 0 14px", fontSize: 13, color: "var(--color-text-tertiary)" }}>wappy.dev/</span>
              <input className="fobo-input" value={slug} onChange={(e) => setSlug(e.target.value)} style={{ borderRadius: "0 14px 14px 0" }} />
            </div>
            <div style={{ ...st.hint, marginTop: 6 }}>Tu centro de ayuda y widget viven en <b style={{ color: "var(--color-text-secondary)" }}>wappy.dev/{slug || "…"}</b></div>
          </div>
        </div>
      </div>
      <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => { setWorkspace((w) => ({ ...w, name, slug })); toast("Espacio actualizado"); }}><Icon name="check2" size={16} /> Guardar cambios</button>
    </div>
  );
}

// ── Channels ─────────────────────────────────────────────────────────────────
function AddChannelAccountModal({ channel, onClose, onAdd }: { channel: string; onClose: () => void; onAdd: (label: string, detail: string) => void }) {
  const f = CHANNEL_FIELD[channel];
  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");
  const can = label.trim() && detail.trim();
  return (
    <Modal onClose={onClose} width={440}>
      <ModalHeader title={"Conectar " + CHANNELS[channel].label} subtitle="Añade otra cuenta a este canal" onClose={onClose} />
      <div style={{ padding: "18px 22px" }}>
        <div className="flex justify-center" style={{ marginBottom: 16 }}><ChannelIcon ch={channel} size={48} /></div>
        <div style={{ marginBottom: 14 }}><label style={st.fieldLabel}>Nombre de la cuenta</label><input className="fobo-input" autoFocus value={label} placeholder="p. ej. Línea de soporte" onChange={(e) => setLabel(e.target.value)} /></div>
        <div><label style={st.fieldLabel}>{f.label}</label><input className="fobo-input" value={detail} placeholder={f.ph} onChange={(e) => setDetail(e.target.value)} /></div>
      </div>
      <div className="flex justify-end gap-2.5" style={{ padding: "14px 22px", borderTop: "1px solid var(--color-border)" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={!can} onClick={() => onAdd(label.trim(), detail.trim())}><Icon name="plus" size={15} /> Conectar cuenta</button>
      </div>
    </Modal>
  );
}

export function ChannelsPanel() {
  const { workspace, setWorkspace } = useWorkspaceStore();
  const toast = useToast();
  const [adding, setAdding] = useState<string | null>(null);
  const acc = workspace.channelAccounts;
  const totalConnected = CHANNEL_ORDER.reduce((n, ch) => n + acc[ch].filter((a) => a.connected).length, 0);

  const addAccount = (ch: string, label: string, detail: string) => {
    setWorkspace((w) => ({ ...w, channelAccounts: { ...w.channelAccounts, [ch]: [...w.channelAccounts[ch], { id: ch + Date.now(), label, detail, connected: true }] } }));
    setAdding(null); toast(CHANNELS[ch].label + " conectado");
  };
  const toggleAccount = (ch: string, id: string) => setWorkspace((w) => ({ ...w, channelAccounts: { ...w.channelAccounts, [ch]: w.channelAccounts[ch].map((a) => (a.id === id ? { ...a, connected: !a.connected } : a)) } }));
  const removeAccount = (ch: string, id: string) => { setWorkspace((w) => ({ ...w, channelAccounts: { ...w.channelAccounts, [ch]: w.channelAccounts[ch].filter((a) => a.id !== id) } })); toast("Cuenta eliminada"); };

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={st.h1}>Canales</h1>
      <p style={st.lead}>Conecta tantas cuentas como necesites — varios números, páginas o buzones por canal. <b style={{ color: "var(--color-text-secondary)" }}>{totalConnected} activas</b> en {CHANNEL_ORDER.length} canales.</p>
      {CHANNEL_ORDER.map((ch) => {
        const list = acc[ch];
        const connectedCount = list.filter((a) => a.connected).length;
        return (
          <div key={ch} style={st.card}>
            <div style={st.cardHead}>
              <ChannelIcon ch={ch} size={30} />
              <div style={{ flex: 1 }}>
                <div style={st.cardTitle}>{CHANNELS[ch].label}</div>
                <div style={st.cardSub}>{connectedCount} conectadas{list.length > connectedCount ? ` · ${list.length - connectedCount} pausadas` : ""}</div>
              </div>
              <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => setAdding(ch)}><Icon name="plus" size={15} /> Añadir cuenta</button>
            </div>
            {list.length === 0 ? (
              <div style={{ padding: "18px 20px", fontSize: 13, color: "var(--color-text-tertiary)" }}>Sin cuentas todavía. Conecta tu primera cuenta de {CHANNELS[ch].label}.</div>
            ) : list.map((a, i) => (
              <div key={a.id} style={{ ...st.row, borderBottom: i < list.length - 1 ? (st.row.borderBottom as string) : "none" }}>
                <span className="rounded-full flex-none" style={{ width: 9, height: 9, background: a.connected ? "var(--color-success)" : "var(--color-text-disabled)" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={st.label}>{a.label}</div>
                  <div style={{ ...st.hint, fontFamily: "var(--font-mono)" }}>{a.detail}</div>
                </div>
                <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => toggleAccount(ch, a.id)}>{a.connected ? "Pausar" : "Reanudar"}</button>
                <button title="Eliminar" onClick={() => removeAccount(ch, a.id)} className="inline-flex items-center justify-center rounded-full border-none cursor-pointer" style={{ width: 34, height: 34, background: "transparent", color: "var(--color-error)" }}><Icon name="trash" size={16} /></button>
              </div>
            ))}
          </div>
        );
      })}
      {adding && <AddChannelAccountModal channel={adding} onClose={() => setAdding(null)} onAdd={(l, d) => addAccount(adding, l, d)} />}
    </div>
  );
}

// ── Notifications ────────────────────────────────────────────────────────────
export function NotificationsPanel() {
  const { workspace, setWorkspace } = useWorkspaceStore();
  const toast = useToast();
  const n = workspace.notifications;
  const set = (k: keyof Notifications) => setWorkspace((w) => ({ ...w, notifications: { ...w.notifications, [k]: !w.notifications[k] } }));
  const setVal = (k: keyof Notifications, v: string) => setWorkspace((w) => ({ ...w, notifications: { ...w.notifications, [k]: v } }));
  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={st.h1}>Notificaciones</h1>
      <p style={st.lead}>Elige de qué quieres recibir aviso.</p>
      <div style={st.card}>
        <div style={st.cardHead}><div style={st.cardTitle}>Email</div></div>
        <ToggleRow label="Nueva conversación asignada a mí" on={n.assigned} onToggle={() => set("assigned")} />
        <ToggleRow label="Nueva respuesta en mis conversaciones" on={n.replies} onToggle={() => set("replies")} />
        <ToggleRow label="Menciones en notas internas" on={n.mentions} onToggle={() => set("mentions")} />
        <ToggleRow label="Valoración CSAT recibida" hint="Cuando un cliente valora una conversación resuelta" on={n.csat} onToggle={() => set("csat")} />
        <ToggleRow label="Resumen diario" hint="Un resumen de actividad cada mañana" on={n.digest} onToggle={() => set("digest")} last />
      </div>
      <div style={st.card}>
        <div style={st.cardHead}><div style={st.cardTitle}>Push y sonido</div></div>
        <ToggleRow label="Notificaciones push de escritorio" on={n.push} onToggle={() => set("push")} />
        <ToggleRow label="Sonido al llegar un mensaje" on={n.sound} onToggle={() => set("sound")} last />
      </div>
      <div style={st.card}>
        <div style={st.cardHead}><div style={st.cardTitle}>Horas de silencio</div><div style={st.cardSub}>Pausa notificaciones de noche</div></div>
        <ToggleRow label="Activar horas de silencio" on={n.quietEnabled} onToggle={() => set("quietEnabled")} last={!n.quietEnabled} />
        {n.quietEnabled && (
          <div className="flex gap-3" style={{ padding: "0 20px 18px" }}>
            <div style={{ flex: 1 }}><label style={st.fieldLabel}>Desde</label><input className="fobo-input" type="time" value={n.quietFrom} onChange={(e) => setVal("quietFrom", e.target.value)} /></div>
            <div style={{ flex: 1 }}><label style={st.fieldLabel}>Hasta</label><input className="fobo-input" type="time" value={n.quietTo} onChange={(e) => setVal("quietTo", e.target.value)} /></div>
          </div>
        )}
      </div>
      <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => toast("Preferencias guardadas")}><Icon name="check2" size={16} /> Guardar cambios</button>
    </div>
  );
}

// ── Office hours ─────────────────────────────────────────────────────────────
export function HoursPanel() {
  const { workspace, setWorkspace } = useWorkspaceStore();
  const toast = useToast();
  const h = workspace.hours;
  type Days = typeof h.days;
  const setDays = (fn: (d: Days) => Days) => setWorkspace((w) => ({ ...w, hours: { ...w.hours, days: fn(w.hours.days) } }));
  const toggleDay = (d: string) => setDays((days) => ({ ...days, [d]: { ...days[d], on: !days[d].on, segments: days[d].on ? days[d].segments : days[d].segments.length ? days[d].segments : [{ from: "09:00", to: "18:00" }] } }));
  const setSeg = (d: string, i: number, key: "from" | "to", v: string) => setDays((days) => ({ ...days, [d]: { ...days[d], segments: days[d].segments.map((sg, j) => (j === i ? { ...sg, [key]: v } : sg)) } }));
  const addSeg = (d: string) => setDays((days) => { const segs = days[d].segments; const last = segs[segs.length - 1]; return { ...days, [d]: { ...days[d], segments: [...segs, { from: last ? last.to : "14:00", to: "18:00" }] } }; });
  const rmSeg = (d: string, i: number) => setDays((days) => ({ ...days, [d]: { ...days[d], segments: days[d].segments.filter((_, j) => j !== i) } }));

  return (
    <div style={{ maxWidth: 680 }}>
      <h1 style={st.h1}>Horario de oficina</h1>
      <p style={st.lead}>Cuándo tu equipo está disponible. Añade pausas para turnos partidos (p. ej. cierre de mediodía).</p>
      <div style={st.card}>
        <ToggleRow label="Mostrar horario en el widget" hint="Los clientes ven tu tiempo de respuesta esperado" on={h.enabled} onToggle={() => setWorkspace((w) => ({ ...w, hours: { ...w.hours, enabled: !w.hours.enabled } }))} last />
      </div>
      <div style={st.card}>
        <div style={st.cardHead}><div style={{ flex: 1 }}><div style={st.cardTitle}>Horario semanal</div><div style={st.cardSub}>{h.tz}</div></div></div>
        {DAY_ORDER.map((d, di) => {
          const day = h.days[d];
          return (
            <div key={d} className="flex gap-4 items-start" style={{ padding: "16px 20px", borderBottom: di < 6 ? "1px solid var(--color-border)" : "none" }}>
              <div className="flex items-center gap-2.5 flex-none" style={{ width: 140, paddingTop: 8 }}>
                <button role="switch" aria-checked={day.on} className="fobo-toggle" style={{ transform: "scale(0.85)" }} onClick={() => toggleDay(d)} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: day.on ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>{DAY_FULL[d]}</span>
              </div>
              <div style={{ flex: 1 }}>
                {!day.on ? (
                  <div style={{ fontSize: 13, color: "var(--color-text-tertiary)", paddingTop: 10 }}>Cerrado</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {day.segments.map((sg, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input className="fobo-input" type="time" value={sg.from} onChange={(e) => setSeg(d, i, "from", e.target.value)} style={{ width: 130, height: 40 }} />
                        <span style={{ color: "var(--color-text-tertiary)", fontSize: 13 }}>–</span>
                        <input className="fobo-input" type="time" value={sg.to} onChange={(e) => setSeg(d, i, "to", e.target.value)} style={{ width: 130, height: 40 }} />
                        {day.segments.length > 1 && <button title="Quitar" onClick={() => rmSeg(d, i)} className="inline-flex items-center justify-center rounded-full border-none cursor-pointer" style={{ width: 34, height: 34, background: "transparent", color: "var(--color-text-tertiary)" }}><Icon name="x" size={16} /></button>}
                        {i === day.segments.length - 1 && <button className="fobo-btn fobo-btn-ghost fobo-btn-sm" style={{ height: 34, padding: "0 10px" }} onClick={() => addSeg(d)}><Icon name="plus" size={15} /> Pausa</button>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => toast("Horario guardado")}><Icon name="check2" size={16} /> Guardar cambios</button>
    </div>
  );
}

// ── Plan & billing ───────────────────────────────────────────────────────────
function Meter({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  const near = pct >= 80;
  return (
    <div style={{ marginBottom: 16 }}>
      <div className="flex justify-between" style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{label}</span>
        <span className="tnum" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{used.toLocaleString()} / {total.toLocaleString()}</span>
      </div>
      <div style={{ height: 8, borderRadius: 9999, background: "var(--neutral-200)", overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", borderRadius: 9999, background: near ? "var(--color-warning)" : "var(--color-primary)" }} />
      </div>
    </div>
  );
}

export function BillingPanel() {
  const { workspace } = useWorkspaceStore();
  const toast = useToast();
  const [current, setCurrent] = useState("growth");
  const seats = workspace.team.length;
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={st.h1}>Plan y facturación</h1>
      <p style={st.lead}>Gestiona tu suscripción, uso y facturas.</p>

      <div style={{ ...st.card, background: "var(--color-surface-dark)", border: "none", color: "#F5F5F7" }}>
        <div className="flex items-start gap-5 flex-wrap" style={{ padding: 24 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="flex items-center gap-2.5" style={{ marginBottom: 8 }}>
              <span className="fobo-badge" style={{ background: "var(--color-primary-bright)", color: "#0E1300" }}>Growth</span>
              <span style={{ fontSize: 13, opacity: 0.7 }}>Renueva 1 jul 2026</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em" }}>$99<span style={{ fontSize: 16, opacity: 0.6 }}>/mes</span></div>
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{seats} asientos · canales ilimitados · 10.000 conversaciones</div>
          </div>
          <button className="fobo-btn fobo-btn-sm" onClick={() => toast("Suscripción cancelada (demo)")} style={{ background: "transparent", color: "#F5F5F7", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)" }}>Cancelar plan</button>
        </div>
      </div>

      <div style={st.card}>
        <div style={st.cardHead}><div style={st.cardTitle}>Uso este mes</div></div>
        <div style={{ padding: 20 }}>
          <Meter label="Asientos del equipo" used={seats} total={10} />
          <Meter label="Conversaciones" used={3240} total={10000} />
          <Meter label="Canales activos" used={4} total={5} />
        </div>
      </div>

      <div style={st.card}>
        <div style={st.cardHead}><div style={st.cardTitle}>Planes</div><div style={st.cardSub}>Cambia cuando quieras — prorrateo automático</div></div>
        <div className="grid grid-cols-3 gap-3" style={{ padding: 20 }}>
          {PLANS.map((p) => {
            const on = current === p.id;
            return (
              <div key={p.id} style={{ borderRadius: 14, padding: 16, border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)", background: on ? "var(--color-primary-subtle)" : "var(--color-surface)" }}>
                <div className="flex items-center gap-1.5" style={{ marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)" }}>{p.name}</span>
                  {on && <span className="fobo-badge bg-[var(--color-primary-subtle)] text-[var(--color-primary-ink)]" style={{ fontSize: 10 }}>Actual</span>}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, color: "var(--color-text-primary)" }}>${p.price}<span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>/mes</span></div>
                <div style={{ fontSize: 11.5, color: "var(--color-text-tertiary)", margin: "2px 0 10px" }}>{p.blurb}</div>
                <div className="flex flex-col gap-1.5" style={{ marginBottom: 12 }}>
                  {p.feats.map((f) => <div key={f} className="flex items-center gap-1.5" style={{ fontSize: 12, color: "var(--color-text-secondary)" }}><Icon name="check" size={13} style={{ color: "var(--color-success)" }} /> {f}</div>)}
                </div>
                <button className={on ? "fobo-btn fobo-btn-secondary fobo-btn-sm" : "fobo-btn fobo-btn-primary fobo-btn-sm"} style={{ width: "100%" }} disabled={on} onClick={() => { setCurrent(p.id); toast("Cambiado a " + p.name); }}>{on ? "Plan actual" : "Elegir " + p.name}</button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={st.card}>
        <div style={st.cardHead}><div style={st.cardTitle}>Método de pago</div></div>
        <div style={{ ...st.row, borderBottom: "none" }}>
          <span className="flex items-center justify-center" style={{ width: 40, height: 28, borderRadius: 6, background: "var(--neutral-200)" }}><Icon name="card" size={18} style={{ color: "var(--color-text-secondary)" }} /></span>
          <div style={{ flex: 1 }}><div style={st.label}>Visa terminada en 4242</div><div style={st.hint}>Caduca 09/27</div></div>
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => toast("Editar método de pago")}>Actualizar</button>
        </div>
      </div>

      <div style={st.card}>
        <div style={st.cardHead}><div style={{ flex: 1 }}><div style={st.cardTitle}>Historial de facturación</div></div><button className="fobo-btn fobo-btn-ghost fobo-btn-sm" onClick={() => toast("Descargando facturas")}><Icon name="download" size={15} /> Exportar</button></div>
        {INVOICES.map((inv, i) => (
          <div key={inv.id} style={{ ...st.row, borderBottom: i < INVOICES.length - 1 ? (st.row.borderBottom as string) : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...st.label, fontFamily: "var(--font-mono)" }}>{inv.id}</div>
              <div style={st.hint}>{inv.date}</div>
            </div>
            <span className="tnum" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{inv.amount}</span>
            <span className="fobo-badge bg-[var(--color-success-bg)] text-[var(--color-success-dark)]">{inv.status}</span>
            <button title="Descargar" onClick={() => toast("Descargando " + inv.id)} className="inline-flex items-center justify-center rounded-full border-none cursor-pointer" style={{ width: 34, height: 34, background: "transparent", color: "var(--color-text-secondary)" }}><Icon name="download" size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
