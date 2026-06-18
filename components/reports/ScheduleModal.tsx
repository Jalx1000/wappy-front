"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useBrandMembers, useMe, useCreateReportSchedule } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import type { ReportFrequency } from "@/lib/api/reportSchedules";

const SECTIONS = ["Social Analytics", "Web / GA4", "Paid Media"];
const FREQUENCIES: { value: ReportFrequency; label: string; needs: "dow" | "dom" | null }[] = [
  { value: "daily", label: "Diario", needs: null },
  { value: "weekdays", label: "Días hábiles (L–V)", needs: null },
  { value: "weekly", label: "Semanal", needs: "dow" },
  { value: "biweekly", label: "Quincenal", needs: "dow" },
  { value: "monthly", label: "Mensual", needs: "dom" },
  { value: "quarterly", label: "Trimestral", needs: "dom" },
];
const DOW = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ScheduleModal({ onClose }: { onClose: () => void }) {
  const activeBrand = useUIStore((s) => s.activeBrand);
  const { data: members = [] } = useBrandMembers(activeBrand?.id);
  const { data: me } = useMe();
  const createSchedule = useCreateReportSchedule();
  const toast = useToast();

  const [frequency, setFrequency] = useState<ReportFrequency>("monthly");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [hour, setHour] = useState(8);
  const [sections, setSections] = useState<string[]>([...SECTIONS]);
  const [memberUserIds, setMemberUserIds] = useState<number[]>(
    me?.id ? [me.id] : [],
  );
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  const freqMeta = FREQUENCIES.find((f) => f.value === frequency)!;

  const toggleSection = (s: string) =>
    setSections((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  const toggleMember = (id: number) =>
    setMemberUserIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const addEmail = () => {
    const e = emailInput.trim().toLowerCase();
    if (!e) return;
    if (!emailRe.test(e)) {
      toast("Email inválido");
      return;
    }
    if (!emails.includes(e)) setEmails((p) => [...p, e]);
    setEmailInput("");
  };

  const totalRecipients = memberUserIds.length + emails.length;

  const submit = async () => {
    if (!totalRecipients) {
      toast("Agregá al menos un destinatario");
      return;
    }
    if (!sections.length) {
      toast("Elegí al menos una sección");
      return;
    }
    try {
      await createSchedule.mutateAsync({
        frequency,
        dayOfWeek: freqMeta.needs === "dow" ? dayOfWeek : undefined,
        dayOfMonth: freqMeta.needs === "dom" ? dayOfMonth : undefined,
        hour,
        sections,
        memberUserIds,
        extraEmails: emails,
        enabled: true,
      });
      toast("Programación creada");
      onClose();
    } catch {
      toast("No se pudo crear la programación");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ background: "var(--color-overlay-scrim)", backdropFilter: "blur(3px)" }}
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="w-[560px] max-w-[94vw] max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--color-surface)", borderRadius: 20, boxShadow: "var(--shadow-3)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 sticky top-0 z-10" style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          <div className="flex items-center justify-between">
            <div className="font-semibold text-[16px]" style={{ color: "var(--color-text-primary)" }}>
              Programar envío · {activeBrand?.name ?? "—"}
            </div>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer" style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}>
              <Icon name="x" size={15} />
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Frequency */}
          <div>
            <p className="text-[13px] font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Frecuencia</p>
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              {FREQUENCIES.map((f) => {
                const on = frequency === f.value;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFrequency(f.value)}
                    className="py-2 px-2 rounded-[10px] text-[12.5px] font-medium border-none cursor-pointer"
                    style={{
                      background: on ? "var(--color-primary-subtle)" : "var(--color-background)",
                      color: on ? "var(--color-primary-ink)" : "var(--color-text-primary)",
                      outline: on ? "1.5px solid var(--color-primary)" : "none",
                      fontFamily: "var(--ff-ui)",
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day + hour */}
          <div className="flex gap-3 flex-wrap">
            {freqMeta.needs === "dow" && (
              <label className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                Día
                <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} className="block mt-1 px-3 py-2 rounded-[8px] text-[13px]" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}>
                  {DOW.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </label>
            )}
            {freqMeta.needs === "dom" && (
              <label className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                Día del mes
                <select value={dayOfMonth} onChange={(e) => setDayOfMonth(Number(e.target.value))} className="block mt-1 px-3 py-2 rounded-[8px] text-[13px]" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}>
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>
            )}
            <label className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
              Hora (La Paz)
              <select value={hour} onChange={(e) => setHour(Number(e.target.value))} className="block mt-1 px-3 py-2 rounded-[8px] text-[13px]" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}>
                {Array.from({ length: 24 }, (_, i) => i).map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
            </label>
          </div>

          {/* Sections */}
          <div>
            <p className="text-[13px] font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Secciones</p>
            <div className="flex gap-2 flex-wrap">
              {SECTIONS.map((s) => {
                const on = sections.includes(s);
                return (
                  <button key={s} onClick={() => toggleSection(s)} className="px-3 py-[7px] rounded-full text-[12.5px] font-medium border-none cursor-pointer" style={{ background: on ? "var(--color-primary)" : "var(--color-background)", color: on ? "#fff" : "var(--color-text-secondary)", fontFamily: "var(--ff-ui)" }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipients: team members */}
          <div>
            <p className="text-[13px] font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Miembros del equipo</p>
            {members.length === 0 ? (
              <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>Sin miembros en esta marca.</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {members.map((m) => {
                  const on = memberUserIds.includes(m.userId);
                  const isMe = me?.id === m.userId;
                  return (
                    <button key={m.id} onClick={() => toggleMember(m.userId)} className="px-3 py-[7px] rounded-full text-[12.5px] font-medium border-none cursor-pointer flex items-center gap-1" style={{ background: on ? "var(--color-secondary-subtle)" : "var(--color-background)", color: on ? "var(--color-secondary-ink)" : "var(--color-text-secondary)", outline: on ? "1.5px solid var(--color-secondary)" : "none", fontFamily: "var(--ff-ui)" }}>
                      {on && <Icon name="check" size={11} />}
                      {isMe ? `${[me?.firstName, me?.lastName].filter(Boolean).join(" ") || me?.email || "Yo"} (tú)` : `${m.role} · #${m.userId}`}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recipients: free emails */}
          <div>
            <p className="text-[13px] font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>Otros correos</p>
            <div className="flex gap-2">
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } }}
                placeholder="cliente@empresa.com"
                className="flex-1 px-3 py-2 rounded-[8px] text-[13px]"
                style={{ background: "var(--color-background)", border: "1px solid var(--color-border)", color: "var(--color-text-primary)" }}
              />
              <button onClick={addEmail} className="fobo-btn fobo-btn-secondary fobo-btn-sm">Agregar</button>
            </div>
            {emails.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {emails.map((e) => (
                  <span key={e} className="flex items-center gap-1 px-2 py-1 rounded-full text-[12px]" style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}>
                    {e}
                    <button onClick={() => setEmails((p) => p.filter((x) => x !== e))} className="border-none bg-transparent cursor-pointer" style={{ color: "inherit" }}><Icon name="x" size={11} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 sticky bottom-0 flex items-center gap-2" style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}>
          <span className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>{totalRecipients} destinatario(s)</span>
          <div className="flex-1" />
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
          <button className="fobo-btn fobo-btn-primary fobo-btn-sm gap-1" onClick={submit} disabled={createSchedule.isPending}>
            <Icon name="calendar" size={14} /> {createSchedule.isPending ? "Guardando…" : "Programar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
