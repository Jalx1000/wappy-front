"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";

const TEAM = [
  { id: 1, name: "María Rojas",    email: "maria@fobo.agency",   role: "Account Manager", initials: "MR", tint: "#0D5CA6" },
  { id: 2, name: "Diego Áñez",     email: "diego@fobo.agency",   role: "Content Creator", initials: "DA", tint: "#E1306C" },
  { id: 3, name: "Lucía Vargas",   email: "lucia@fobo.agency",   role: "Copywriter",      initials: "LV", tint: "#1E8A5B" },
  { id: 4, name: "Carlos Ribera",  email: "carlos@fobo.agency",  role: "Paid Media",      initials: "CR", tint: "#F09030" },
  { id: 5, name: "Ana Gutiérrez",  email: "ana@fobo.agency",     role: "Designer",        initials: "AG", tint: "#7A4FD3" },
];

type ToggleProps = { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void };

function Toggle({ label, sub, value, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-[14px]" style={{ borderBottom: "1px solid var(--color-border)" }}>
      <div>
        <div className="text-[14px] font-medium" style={{ color: "var(--color-text-primary)" }}>{label}</div>
        {sub && <div className="text-[12.5px]" style={{ color: "var(--color-text-tertiary)" }}>{sub}</div>}
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="relative border-none cursor-pointer flex-shrink-0"
        style={{
          width: 44, height: 24, borderRadius: 9999,
          background: value ? "var(--color-primary)" : "var(--neutral-400)",
          transition: "background 160ms ease",
          padding: 0,
        }}
      >
        <span
          className="absolute"
          style={{
            top: 2, left: 2, width: 20, height: 20, borderRadius: 9999,
            background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
            transition: "transform 160ms ease",
            transform: value ? "translateX(20px)" : "none",
          }}
        />
      </button>
    </div>
  );
}

const SECTIONS = ["Perfil agencia", "Equipo", "Notificaciones", "API Keys"];

export function SettingsView() {
  const toast = useToast();
  const [active, setActive] = useState("Perfil agencia");
  const [notifs, setNotifs] = useState({
    reports: true, connections: true, approvals: true,
    insights: false, digest: true, client: true,
  });

  return (
    <div className="p-7 overflow-y-auto h-full">
      <div className="mb-6">
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
          Configuración
        </h1>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: "200px 1fr" }}>
        {/* Sidebar nav */}
        <div className="flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className="text-left px-3 py-[9px] rounded-[9px] border-none cursor-pointer text-[14px] font-medium transition-colors"
              style={{
                fontFamily: "var(--ff-ui)",
                background: active === s ? "var(--color-primary-subtle)" : "transparent",
                color: active === s ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {active === "Perfil agencia" && (
            <div className="fobo-card p-6">
              <div className="text-[16px] font-semibold mb-5" style={{ color: "var(--color-text-primary)" }}>
                Perfil de la agencia
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 pb-5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <div
                    className="flex items-center justify-center text-white font-bold text-[22px]"
                    style={{ width: 64, height: 64, borderRadius: 16, background: "var(--color-brand-gradient)", fontFamily: "var(--ff-display)", letterSpacing: "-0.04em" }}
                  >
                    f
                  </div>
                  <div>
                    <div className="text-[18px] font-bold" style={{ fontFamily: "var(--ff-display)", color: "var(--color-text-primary)" }}>fobo</div>
                    <div className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>Fear of Being Offline · Santa Cruz, Bolivia</div>
                  </div>
                  <button className="fobo-btn fobo-btn-secondary fobo-btn-sm ml-auto">Cambiar logo</button>
                </div>
                {[
                  { label: "Nombre de la agencia", value: "Fobo" },
                  { label: "Correo de contacto",   value: "hola@fobo.agency" },
                  { label: "Sitio web",             value: "fobo.agency" },
                  { label: "Ciudad",                value: "Santa Cruz de la Sierra, Bolivia" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className="text-[12px] font-semibold block mb-[6px]" style={{ color: "var(--color-text-secondary)" }}>{label}</label>
                    <input className="fobo-input" defaultValue={value} />
                  </div>
                ))}
                <div className="flex justify-end pt-2">
                  <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => toast("Cambios guardados ✓")}>
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          )}

          {active === "Equipo" && (
            <div className="fobo-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <div className="text-[16px] font-semibold" style={{ color: "var(--color-text-primary)" }}>Miembros del equipo</div>
                <button className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1">
                  <Icon name="plus" size={14} /> Invitar
                </button>
              </div>
              {TEAM.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-center gap-4 px-5 py-[14px]"
                  style={{ borderBottom: i < TEAM.length - 1 ? "1px solid var(--color-border)" : "none" }}
                >
                  <span
                    className="flex items-center justify-center text-white font-bold text-[13px] rounded-full flex-shrink-0"
                    style={{ width: 38, height: 38, background: m.tint }}
                  >
                    {m.initials}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{m.name}</div>
                    <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>{m.email}</div>
                  </div>
                  <span className="text-[12.5px] font-medium px-3 py-[4px] rounded-full" style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}>
                    {m.role}
                  </span>
                  <button className="fobo-btn fobo-btn-ghost fobo-btn-sm"><Icon name="dots" size={15} /></button>
                </div>
              ))}
            </div>
          )}

          {active === "Notificaciones" && (
            <div className="fobo-card p-6">
              <div className="text-[16px] font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
                Preferencias de notificación
              </div>
              <p className="text-[13.5px] mb-4" style={{ color: "var(--color-text-secondary)" }}>
                Controla qué notificaciones recibes en la app y por correo.
              </p>
              <Toggle label="Reportes generados" sub="Cuando un reporte esté listo" value={notifs.reports} onChange={(v) => setNotifs((p) => ({ ...p, reports: v }))} />
              <Toggle label="Alertas de conexión" sub="Tokens expirados o errores de sincronización" value={notifs.connections} onChange={(v) => setNotifs((p) => ({ ...p, connections: v }))} />
              <Toggle label="Aprobaciones pendientes" sub="Piezas que esperan tu revisión" value={notifs.approvals} onChange={(v) => setNotifs((p) => ({ ...p, approvals: v }))} />
              <Toggle label="Insights de IA" sub="Nuevos hallazgos y recomendaciones" value={notifs.insights} onChange={(v) => setNotifs((p) => ({ ...p, insights: v }))} />
              <Toggle label="Resumen semanal" sub="Digest de desempeño todos los lunes" value={notifs.digest} onChange={(v) => setNotifs((p) => ({ ...p, digest: v }))} />
              <div className="flex justify-end mt-4">
                <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => toast("Preferencias guardadas ✓")}>
                  Guardar
                </button>
              </div>
            </div>
          )}

          {active === "API Keys" && (
            <div className="fobo-card p-6">
              <div className="text-[16px] font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>API Keys</div>
              <p className="text-[13.5px] mb-5" style={{ color: "var(--color-text-secondary)" }}>
                Úsalas para integrar Fobo con tus propias herramientas. Trátala como contraseña.
              </p>
              <div className="flex items-center gap-3 p-4 rounded-[12px] mb-4" style={{ background: "var(--color-background)" }}>
                <Icon name="shield" size={18} color="var(--color-text-tertiary)" />
                <span className="flex-1 text-[13px] font-medium" style={{ fontFamily: "var(--ff-mono)", color: "var(--color-text-primary)" }}>
                  fob_live_••••••••••••••••••••••
                </span>
                <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => toast("API key copiada al portapapeles")}>
                  <Icon name="link" size={13} /> Copiar
                </button>
                <button className="fobo-btn fobo-btn-sm" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>
                  <Icon name="refresh" size={13} /> Regenerar
                </button>
              </div>
              <div className="flex items-center gap-2 text-[12.5px]" style={{ color: "var(--color-text-tertiary)" }}>
                <Icon name="info" size={14} />
                Última actividad: hace 2 días · rate limit: 1000 req/min
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
