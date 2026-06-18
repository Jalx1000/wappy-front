"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import {
  useReports,
  useCreateReport,
  useReportSchedules,
  useUpdateReportSchedule,
  useDeleteReportSchedule,
} from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import type { Report, ReportStatus } from "@/lib/api/reports";
import type { ReportSchedule, ReportFrequency } from "@/lib/api/reportSchedules";
import { ScheduleModal } from "./ScheduleModal";

const STATUS_META: Record<ReportStatus, { label: string; variant: BadgeVariant }> = {
  ready: { label: "Listo", variant: "success" },
  processing: { label: "Generando…", variant: "warning" },
  pending: { label: "En cola", variant: "warning" },
  failed: { label: "Error", variant: "error" },
};

const SECTIONS = ["Social Analytics", "Web / GA4", "Paid Media"];
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

type PeriodChoice =
  | { kind: "last"; days: number; label: string }
  | { kind: "month"; month: number; year: number };

function periodToRange(p: PeriodChoice): { from: string; to: string; label: string } {
  if (p.kind === "last") {
    const to = new Date();
    const from = new Date(to.getTime() - p.days * 86400000);
    return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10), label: p.label };
  }
  const from = new Date(Date.UTC(p.year, p.month, 1));
  const to = new Date(Date.UTC(p.year, p.month + 1, 0));
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    label: `${MONTHS[p.month]} ${p.year}`,
  };
}

function ReportWizard({ onClose }: { onClose: () => void }) {
  const activeBrand = useUIStore((s) => s.activeBrand);
  const createReport = useCreateReport();
  const toast = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [period, setPeriod] = useState<PeriodChoice>({ kind: "last", days: 30, label: "Últimos 30 días" });
  const [sections, setSections] = useState<string[]>([...SECTIONS]);

  const toggleSection = (s: string) =>
    setSections((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const generate = async () => {
    if (!activeBrand) {
      toast("Seleccioná una marca primero");
      return;
    }
    const range = periodToRange(period);
    try {
      const report = await createReport.mutateAsync({
        type: "summary",
        from: range.from,
        to: range.to,
        sections,
      });
      toast("Reporte en generación · recopilando datos");
      onClose();
      router.push(`/app/reports/${report.id}`);
    } catch {
      toast("No se pudo crear el reporte");
    }
  };

  const STEPS = ["Período", "Secciones"];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ background: "var(--color-overlay-scrim)", backdropFilter: "blur(3px)" }}
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="w-[520px] max-w-[94vw]"
        style={{ background: "var(--color-surface)", borderRadius: 20, boxShadow: "var(--shadow-3)", overflow: "hidden" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-[16px]" style={{ color: "var(--color-text-primary)" }}>
              Generar reporte · {activeBrand?.name ?? "—"}
            </div>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer" style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}>
              <Icon name="x" size={15} />
            </button>
          </div>
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div
                  className="flex items-center justify-center text-[11px] font-bold rounded-full"
                  style={{
                    width: 22, height: 22,
                    background: i <= step ? "var(--color-primary)" : "var(--color-background)",
                    color: i <= step ? "#fff" : "var(--color-text-tertiary)",
                    border: i === step ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  {i < step ? <Icon name="check" size={11} color="#fff" /> : i + 1}
                </div>
                <span className="text-[11.5px]" style={{ color: i <= step ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>{s}</span>
                {i < STEPS.length - 1 && <div className="flex-1 h-px mx-1" style={{ background: i < step ? "var(--color-primary)" : "var(--color-border)" }} />}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                <p className="text-[14px] mb-3" style={{ color: "var(--color-text-secondary)" }}>Período del reporte</p>
                <div className="flex gap-2 mb-4">
                  {[
                    { days: 30, label: "Últimos 30 días" },
                    { days: 90, label: "Últimos 90 días" },
                  ].map((opt) => {
                    const on = period.kind === "last" && period.days === opt.days;
                    return (
                      <button
                        key={opt.days}
                        onClick={() => setPeriod({ kind: "last", days: opt.days, label: opt.label })}
                        className="flex-1 py-2 rounded-[10px] text-[13px] font-medium border-none cursor-pointer"
                        style={{
                          background: on ? "var(--color-primary-subtle)" : "var(--color-background)",
                          color: on ? "var(--color-primary-ink)" : "var(--color-text-primary)",
                          outline: on ? "1.5px solid var(--color-primary)" : "none",
                          fontFamily: "var(--ff-ui)",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[12px] mb-2" style={{ color: "var(--color-text-tertiary)" }}>O un mes específico (2026)</p>
                <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                  {MONTHS.map((m, idx) => {
                    const on = period.kind === "month" && period.month === idx;
                    return (
                      <button
                        key={m}
                        onClick={() => setPeriod({ kind: "month", month: idx, year: 2026 })}
                        className="py-2 rounded-[10px] text-[13px] font-medium border-none cursor-pointer capitalize"
                        style={{
                          background: on ? "var(--color-primary-subtle)" : "var(--color-background)",
                          color: on ? "var(--color-primary-ink)" : "var(--color-text-primary)",
                          outline: on ? "1.5px solid var(--color-primary)" : "none",
                          fontFamily: "var(--ff-ui)",
                        }}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                <p className="text-[14px] mb-4" style={{ color: "var(--color-text-secondary)" }}>¿Qué secciones incluir?</p>
                <div className="flex flex-col gap-2">
                  {SECTIONS.map((s) => {
                    const on = sections.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSection(s)}
                        className="flex items-center gap-3 p-3 rounded-[10px] text-left border-none cursor-pointer"
                        style={{ background: on ? "var(--color-primary-subtle)" : "var(--color-background)", outline: on ? "1.5px solid var(--color-primary)" : "none", fontFamily: "var(--ff-ui)" }}
                      >
                        <div className="flex items-center justify-center rounded-[5px] flex-shrink-0" style={{ width: 20, height: 20, background: on ? "var(--color-primary)" : "var(--color-border)" }}>
                          {on && <Icon name="check" size={12} color="#fff" />}
                        </div>
                        <span className="text-[14px] font-medium" style={{ color: "var(--color-text-primary)" }}>{s}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 mt-6">
            {step > 0 && <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => setStep((s) => s - 1)}>← Atrás</button>}
            <div className="flex-1" />
            {step < STEPS.length - 1 ? (
              <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setStep((s) => s + 1)}>Siguiente →</button>
            ) : (
              <button className="fobo-btn fobo-btn-primary fobo-btn-sm gap-1" onClick={generate} disabled={createReport.isPending || !sections.length}>
                <Icon name="file" size={14} /> {createReport.isPending ? "Generando…" : "Generar reporte"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function reportTitle(r: Report): string {
  const label = r.data?.period.label ?? `${r.params.from} – ${r.params.to}`;
  return `Reporte ${label}`;
}
function reportSections(r: Report): string[] {
  if (r.params.sections?.length) return r.params.sections;
  return r.data?.sections ?? [];
}

const FREQ_LABEL: Record<ReportFrequency, string> = {
  daily: "Diario",
  weekdays: "Días hábiles",
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
  quarterly: "Trimestral",
};
const DOW_SHORT = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function scheduleCadence(s: ReportSchedule): string {
  const h = `${String(s.hour).padStart(2, "0")}:00`;
  if (s.frequency === "weekly" || s.frequency === "biweekly")
    return `${FREQ_LABEL[s.frequency]} · ${DOW_SHORT[s.dayOfWeek ?? 1]} ${h}`;
  if (s.frequency === "monthly" || s.frequency === "quarterly")
    return `${FREQ_LABEL[s.frequency]} · día ${s.dayOfMonth ?? 1} ${h}`;
  return `${FREQ_LABEL[s.frequency]} · ${h}`;
}

function SchedulesPanel() {
  const { data: schedules = [] } = useReportSchedules();
  const updateSchedule = useUpdateReportSchedule();
  const deleteSchedule = useDeleteReportSchedule();
  const toast = useToast();

  if (!schedules.length) return null;

  return (
    <div className="fobo-card overflow-hidden mb-6">
      <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <Icon name="calendar" size={15} style={{ color: "var(--color-primary-ink)" }} />
        <span className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>Envíos programados</span>
        <span className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>({schedules.length})</span>
      </div>
      {schedules.map((s, i) => {
        const recipients = s.memberUserIds.length + s.extraEmails.length;
        return (
          <div key={s.id} className="grid gap-4 px-5 py-3 items-center" style={{ gridTemplateColumns: "1.6fr 1.4fr 1fr auto", borderBottom: i < schedules.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <div>
              <div className="text-[13.5px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{scheduleCadence(s)}</div>
              <div className="text-[11.5px] mt-[2px]" style={{ color: "var(--color-text-tertiary)" }}>{recipients} destinatario(s) · {s.sections.length} secciones</div>
            </div>
            <div className="text-[12.5px]" style={{ color: "var(--color-text-secondary)" }}>
              {s.enabled && s.nextRunAt ? `Próximo: ${new Date(s.nextRunAt).toLocaleString("es-BO", { dateStyle: "medium", timeStyle: "short" })}` : "Pausado"}
            </div>
            <div className="flex justify-center">
              <Badge variant={s.enabled ? "success" : "neutral"}>{s.enabled ? "Activo" : "Pausado"}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="fobo-btn fobo-btn-ghost fobo-btn-sm"
                title={s.enabled ? "Pausar" : "Activar"}
                onClick={() => updateSchedule.mutate({ id: s.id, payload: { enabled: !s.enabled } })}
              >
                <Icon name={s.enabled ? "eyeOff" : "eye"} size={15} />
              </button>
              <button
                className="fobo-btn fobo-btn-ghost fobo-btn-sm"
                title="Eliminar"
                onClick={() => {
                  deleteSchedule.mutate(s.id, { onSuccess: () => toast("Programación eliminada") });
                }}
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ReportsView() {
  const router = useRouter();
  const { data: reports = [], isLoading } = useReports();
  const [wizard, setWizard] = useState(false);
  const [schedule, setSchedule] = useState(false);

  const sorted = useMemo(
    () => [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reports],
  );

  return (
    <div className="p-7 overflow-y-auto h-full">
      <div className="flex items-end gap-4 mb-6 flex-wrap">
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
            Reportes
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {sorted.length} {sorted.length === 1 ? "reporte generado" : "reportes generados"}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex items-center gap-1" onClick={() => setSchedule(true)}>
            <Icon name="calendar" size={15} /> Programar envío
          </button>
          <button className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1" onClick={() => setWizard(true)}>
            <Icon name="plus" size={15} /> Generar reporte
          </button>
        </div>
      </div>

      <SchedulesPanel />

      {isLoading ? (
        <div className="flex items-center justify-center py-24" style={{ color: "var(--color-text-tertiary)" }}>
          <Icon name="refresh" size={22} className="animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon="file"
          title="Sin reportes"
          body="Generá tu primer reporte white-label con datos reales de Social, Web y Ads."
          action={
            <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setWizard(true)}>
              <Icon name="plus" size={15} /> Generar reporte
            </button>
          }
        />
      ) : (
        <div className="fobo-card overflow-hidden">
          <div className="grid gap-4 px-5 py-3" style={{ gridTemplateColumns: "2fr 1.2fr 1fr 1fr auto", borderBottom: "1px solid var(--color-border)" }}>
            {["Reporte", "Período", "Fecha", "Estado", ""].map((h, i) => (
              <div key={h} className="text-[10.5px] font-bold uppercase" style={{ letterSpacing: "0.05em", color: "var(--color-text-tertiary)", textAlign: i >= 2 ? "center" : "left" }}>{h}</div>
            ))}
          </div>
          {sorted.map((r, i) => {
            const meta = STATUS_META[r.status];
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="grid gap-4 px-5 py-[14px] items-center"
                style={{ gridTemplateColumns: "2fr 1.2fr 1fr 1fr auto", borderBottom: i < sorted.length - 1 ? "1px solid var(--color-border)" : "none" }}
              >
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{reportTitle(r)}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {reportSections(r).map((s) => (
                      <span key={s} className="text-[10.5px] font-medium px-[6px] py-[2px] rounded-full" style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{r.params.from} → {r.params.to}</div>
                <div className="text-center text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{new Date(r.createdAt).toLocaleDateString("es-BO")}</div>
                <div className="flex justify-center"><Badge variant={meta.variant}>{meta.label}</Badge></div>
                <div className="flex items-center gap-1">
                  <button
                    className="fobo-btn fobo-btn-ghost fobo-btn-sm"
                    onClick={() => router.push(`/app/reports/${r.id}`)}
                    title="Ver / Descargar"
                  >
                    <Icon name="eye" size={15} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {wizard && <ReportWizard onClose={() => setWizard(false)} />}
        {schedule && <ScheduleModal onClose={() => setSchedule(false)} />}
      </AnimatePresence>
    </div>
  );
}
