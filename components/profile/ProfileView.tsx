"use client";

import { useState, type CSSProperties } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useProfileStore } from "@/store/profile";
import { AVAIL_COLORS, type Availability, type AgentProfile } from "./data";

const card: CSSProperties = { background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", marginBottom: 18 };
const cardHead: CSSProperties = { padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center" };
const fieldLabel: CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 };
const valRow: CSSProperties = { display: "flex", alignItems: "center", padding: "13px 20px", borderBottom: "1px solid var(--color-border)" };

const AVAIL: Availability[] = ["Disponible", "Ausente", "Ocupado"];
const STATS: { label: string; value: string; icon: IconName }[] = [
  { label: "Conversaciones", value: "1,284", icon: "inbox" },
  { label: "Resp. media", value: "2m 14s", icon: "clock" },
  { label: "CSAT", value: "97%", icon: "star" },
  { label: "Resueltas", value: "1,209", icon: "check" },
];

const initialsOf = (name: string) => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function ProfileView() {
  const { profile, setProfile } = useProfileStore();
  const toast = useToast();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<AgentProfile>(profile);
  const set = <K extends keyof AgentProfile>(k: K, v: AgentProfile[K]) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => { setProfile(form); setEdit(false); toast("Perfil guardado"); };
  const cancel = () => { setForm(profile); setEdit(false); };
  const startEdit = () => { setForm(profile); setEdit(true); };

  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: "auto", background: "var(--color-background)" }}>
      <div style={{ height: 120, background: "linear-gradient(110deg, var(--color-primary) 0%, var(--color-primary-bright) 100%)" }} />
      <div className="mx-auto" style={{ maxWidth: 720, padding: "0 24px 40px" }}>
        <div className="flex items-end gap-[18px]" style={{ marginTop: -40, marginBottom: 24 }}>
          <span className="flex items-center justify-center rounded-full flex-none" style={{ width: 96, height: 96, fontSize: 34, fontWeight: 700, background: "var(--color-primary)", color: "var(--color-on-primary)", border: "4px solid var(--color-background)" }}>{initialsOf(profile.name)}</span>
          <div className="flex-1" style={{ paddingBottom: 6 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>{profile.name}</div>
            <div style={{ fontSize: 13.5, color: "var(--color-text-secondary)" }}>{profile.role} · {profile.email}</div>
          </div>
          {!edit && <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" style={{ marginBottom: 6 }} onClick={startEdit}><Icon name="edit" size={16} /> Editar perfil</button>}
        </div>

        {/* Availability */}
        <div style={card}>
          <div style={cardHead}><div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>Disponibilidad</div></div>
          <div className="flex gap-2" style={{ padding: 16 }}>
            {AVAIL.map((st) => {
              const on = (edit ? form.availability : profile.availability) === st;
              return (
                <button key={st} onClick={() => (edit ? set("availability", st) : setProfile({ ...profile, availability: st }))} className="flex items-center gap-2 cursor-pointer"
                  style={{ height: 42, padding: "0 18px", borderRadius: 9999, fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 600,
                    background: on ? "var(--color-primary-subtle)" : "var(--color-surface)", color: on ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
                    border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" }}>
                  <span className="rounded-full" style={{ width: 9, height: 9, background: AVAIL_COLORS[st] }} /> {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats (view only) */}
        {!edit && (
          <div className="grid grid-cols-4 gap-3" style={{ marginBottom: 18 }}>
            {STATS.map((st) => (
              <div key={st.label} style={{ background: "var(--color-surface)", borderRadius: 14, border: "1px solid var(--color-border)", padding: "16px 18px" }}>
                <Icon name={st.icon} size={18} style={{ color: "var(--color-primary-ink)" }} />
                <div className="tnum" style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginTop: 8 }}>{st.value}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 2 }}>{st.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Details */}
        <div style={card}>
          <div style={cardHead}><div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>Datos personales</div></div>
          {edit ? (
            <div style={{ padding: 20 }}>
              <div className="flex gap-3" style={{ marginBottom: 16 }}>
                <div className="flex-1"><label style={fieldLabel}>Nombre completo</label><input className="fobo-input" value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
                <div className="flex-1"><label style={fieldLabel}>Rol</label><input className="fobo-input" value={form.role} onChange={(e) => set("role", e.target.value)} /></div>
              </div>
              <div className="flex gap-3" style={{ marginBottom: 16 }}>
                <div className="flex-1"><label style={fieldLabel}>Email</label><input className="fobo-input" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
                <div className="flex-1"><label style={fieldLabel}>Teléfono</label><input className="fobo-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
              </div>
              <div><label style={fieldLabel}>Biografía</label><textarea className="fobo-input" style={{ height: "auto", paddingTop: 12, resize: "vertical", minHeight: 80 }} value={form.bio} onChange={(e) => set("bio", e.target.value)} /></div>
            </div>
          ) : (
            <div>
              {([["Email", profile.email], ["Teléfono", profile.phone], ["Zona horaria", profile.timezone], ["Idioma", profile.language]] as [string, string][]).map(([k, v], i, a) => (
                <div key={k} style={{ ...valRow, borderBottom: i < a.length - 1 ? valRow.borderBottom : "none" }}>
                  <span style={{ width: 120, fontSize: 13, color: "var(--color-text-tertiary)" }}>{k}</span>
                  <span style={{ fontSize: 13.5, color: "var(--color-text-primary)", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              {profile.bio && <div style={{ padding: "14px 20px", fontSize: 13.5, color: "var(--color-text-secondary)", lineHeight: 1.6, borderTop: "1px solid var(--color-border)" }}>{profile.bio}</div>}
            </div>
          )}
        </div>

        {!edit && (
          <div style={card}>
            <div style={cardHead}><div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>Seguridad</div></div>
            <div style={{ ...valRow, borderBottom: "none" }}>
              <div className="flex-1"><div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--color-text-primary)" }}>Contraseña</div><div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Cambiada hace 3 meses</div></div>
              <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => toast("Enlace de restablecimiento enviado")}>Cambiar</button>
            </div>
          </div>
        )}

        {edit && (
          <div className="flex justify-end gap-2.5">
            <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={cancel}>Cancelar</button>
            <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={save}><Icon name="check2" size={16} /> Guardar cambios</button>
          </div>
        )}
      </div>
    </div>
  );
}
