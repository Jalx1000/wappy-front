"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { useToast } from "@/components/ui/Toast";
import { useBrands } from "@/lib/hooks";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import { DemoBanner } from "@/components/ui/DemoBanner";

type ReportStatus = "ready" | "generating" | "scheduled";
type Report = {
  id: string; name: string; brand: string; period: string;
  date: string; status: ReportStatus; sections: string[];
};

const INITIAL_REPORTS: Report[] = [
  { id: "r1", name: "Reporte mensual mayo 2026", brand: "Toyosa Motors",     period: "1–31 may 2026", date: "1 jun 2026",  status: "ready",     sections: ["Social", "Ads", "Web"] },
  { id: "r2", name: "Reporte mensual abril 2026", brand: "Banco Ganadero",   period: "1–30 abr 2026", date: "1 may 2026",  status: "ready",     sections: ["Social", "Ads", "Web"] },
  { id: "r3", name: "Reporte semanal S22 2026",   brand: "La Casa del Camba",period: "26 may–1 jun",   date: "2 jun 2026",  status: "ready",     sections: ["Social"] },
  { id: "r4", name: "Reporte mensual jun 2026",   brand: "Hipermaxi",        period: "1–30 jun 2026", date: "Programado",  status: "scheduled", sections: ["Social"] },
];

const STATUS_META: Record<ReportStatus, { label: string; variant: "success"|"primary"|"warning" }> = {
  ready:      { label: "Listo",        variant: "success" },
  generating: { label: "Generando…",  variant: "warning" },
  scheduled:  { label: "Programado",  variant: "primary" },
};

const WIZARD_STEPS = ["Marca", "Período", "Secciones", "Formato"];
const SECTIONS = ["Social Analytics", "Web / GA4", "Paid Media", "Aprobaciones", "Audiencias"];
const FORMATS  = ["PDF", "Excel", "PowerPoint"];

function ReportWizard({ onClose, onDone }: { onClose: () => void; onDone: (r: Report) => void }) {
  const { data: brands = BRANDS_FALLBACK } = useBrands();
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState(brands[0]?.id ?? BRANDS_FALLBACK[0].id);
  const [period, setPeriod] = useState("may");
  const [sections, setSections] = useState(["Social Analytics", "Web / GA4", "Paid Media"]);
  const [format, setFormat] = useState("PDF");
  const toast = useToast();

  const toggleSection = (s: string) =>
    setSections((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);

  const generate = () => {
    const b = brands.find((x) => x.id === brand) ?? brands[0]!
    onDone({
      id: `r${Date.now()}`,
      name: `Reporte ${period} 2026`,
      brand: b.name,
      period: `${period} 2026`,
      date: new Date().toLocaleDateString("es-BO"),
      status: "generating",
      sections,
    });
    toast("Reporte en generación · listo en unos segundos");
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
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18 }}
        className="w-[500px] max-w-[94vw]"
        style={{ background: "var(--color-surface)", borderRadius: 20, boxShadow: "var(--shadow-3)", overflow: "hidden" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Progress header */}
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-[16px]" style={{ color: "var(--color-text-primary)" }}>
              Generar reporte
            </div>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer" style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}>
              <Icon name="x" size={15} />
            </button>
          </div>
          <div className="flex gap-1">
            {WIZARD_STEPS.map((s, i) => (
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
                <span className="text-[11.5px]" style={{ color: i <= step ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>
                  {s}
                </span>
                {i < WIZARD_STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-1" style={{ background: i < step ? "var(--color-primary)" : "var(--color-border)" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }} className="flex flex-col gap-3">
                <p className="text-[14px]" style={{ color: "var(--color-text-secondary)" }}>¿Para qué marca?</p>
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBrand(b.id)}
                    className="flex items-center gap-3 p-3 rounded-[12px] text-left border-none cursor-pointer transition-colors"
                    style={{
                      background: brand === b.id ? "var(--color-primary-subtle)" : "var(--color-background)",
                      outline: brand === b.id ? "1.5px solid var(--color-primary)" : "none",
                      fontFamily: "var(--ff-ui)",
                    }}
                  >
                    <span className="flex items-center justify-center text-white font-bold text-[12px] rounded-[8px] flex-shrink-0" style={{ width: 32, height: 32, background: b.tint }}>{b.short}</span>
                    <div>
                      <div className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{b.name}</div>
                      <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>{b.industry} · {b.plan}</div>
                    </div>
                    {brand === b.id && <Icon name="check" size={16} color="var(--color-primary-ink)" style={{ marginLeft: "auto" }} />}
                  </button>
                ))}
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                <p className="text-[14px] mb-4" style={{ color: "var(--color-text-secondary)" }}>Período del reporte</p>
                <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                  {["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPeriod(m)}
                      className="py-2 px-3 rounded-[10px] text-[13px] font-medium border-none cursor-pointer transition-colors capitalize"
                      style={{
                        background: period === m ? "var(--color-primary-subtle)" : "var(--color-background)",
                        color: period === m ? "var(--color-primary-ink)" : "var(--color-text-primary)",
                        outline: period === m ? "1.5px solid var(--color-primary)" : "none",
                        fontFamily: "var(--ff-ui)",
                      }}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                <p className="text-[14px] mb-4" style={{ color: "var(--color-text-secondary)" }}>¿Qué secciones incluir?</p>
                <div className="flex flex-col gap-2">
                  {SECTIONS.map((s) => {
                    const on = sections.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => toggleSection(s)}
                        className="flex items-center gap-3 p-3 rounded-[10px] text-left border-none cursor-pointer"
                        style={{
                          background: on ? "var(--color-primary-subtle)" : "var(--color-background)",
                          outline: on ? "1.5px solid var(--color-primary)" : "none",
                          fontFamily: "var(--ff-ui)",
                        }}
                      >
                        <div
                          className="flex items-center justify-center rounded-[5px] flex-shrink-0"
                          style={{ width: 20, height: 20, background: on ? "var(--color-primary)" : "var(--color-border)" }}
                        >
                          {on && <Icon name="check" size={12} color="#fff" />}
                        </div>
                        <span className="text-[14px] font-medium" style={{ color: "var(--color-text-primary)" }}>{s}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.15 }}>
                <p className="text-[14px] mb-4" style={{ color: "var(--color-text-secondary)" }}>Formato de exportación</p>
                <div className="flex gap-3">
                  {FORMATS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className="flex-1 py-3 rounded-[12px] text-[14px] font-semibold border-none cursor-pointer"
                      style={{
                        background: format === f ? "var(--color-primary-subtle)" : "var(--color-background)",
                        color: format === f ? "var(--color-primary-ink)" : "var(--color-text-primary)",
                        outline: format === f ? "1.5px solid var(--color-primary)" : "none",
                        fontFamily: "var(--ff-ui)",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 mt-6">
            {step > 0 && (
              <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => setStep(s => s - 1)}>
                ← Atrás
              </button>
            )}
            <div className="flex-1" />
            {step < WIZARD_STEPS.length - 1 ? (
              <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setStep(s => s + 1)}>
                Siguiente →
              </button>
            ) : (
              <button className="fobo-btn fobo-btn-primary fobo-btn-sm gap-1" onClick={generate}>
                <Icon name="file" size={14} /> Generar reporte
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ReportsView() {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [wizard, setWizard] = useState(false);
  const toast = useToast();

  const handleDownload = (r: Report) => {
    toast(`Descargando ${r.name}…`);
  };

  return (
    <div className="p-7 overflow-y-auto h-full">
      <DemoBanner module="Reportes" />
      <div className="flex items-end gap-4 mb-6 flex-wrap">
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
            Reportes
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {reports.length} reportes generados
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex items-center gap-1">
            <Icon name="calendar" size={15} /> Programar envío
          </button>
          <button
            className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1"
            onClick={() => setWizard(true)}
          >
            <Icon name="plus" size={15} /> Generar reporte
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <EmptyState icon="file" title="Sin reportes" body="Genera tu primer reporte white-label." action={
          <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setWizard(true)}>
            <Icon name="plus" size={15} /> Generar reporte
          </button>
        } />
      ) : (
        <div className="fobo-card overflow-hidden">
          {/* Headers */}
          <div
            className="grid gap-4 px-5 py-3"
            style={{ gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 1fr auto", borderBottom: "1px solid var(--color-border)" }}
          >
            {["Reporte", "Marca", "Período", "Fecha", "Estado", ""].map((h, i) => (
              <div key={h} className="text-[10.5px] font-bold uppercase" style={{ letterSpacing: "0.05em", color: "var(--color-text-tertiary)", textAlign: i >= 3 ? "center" : "left" }}>
                {h}
              </div>
            ))}
          </div>
          {reports.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="grid gap-4 px-5 py-[14px] items-center"
              style={{
                gridTemplateColumns: "2fr 1.2fr 1.2fr 1fr 1fr auto",
                borderBottom: i < reports.length - 1 ? "1px solid var(--color-border)" : "none",
              }}
            >
              <div>
                <div className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{r.name}</div>
                <div className="flex gap-1 mt-1">
                  {r.sections.map((s) => (
                    <span key={s} className="text-[10.5px] font-medium px-[6px] py-[2px] rounded-full" style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{r.brand}</div>
              <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{r.period}</div>
              <div className="text-center text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{r.date}</div>
              <div className="flex justify-center">
                <Badge variant={STATUS_META[r.status].variant}>{STATUS_META[r.status].label}</Badge>
              </div>
              <div className="flex items-center gap-1">
                <button
                  className="fobo-btn fobo-btn-ghost fobo-btn-sm"
                  onClick={() => handleDownload(r)}
                  title="Descargar"
                  disabled={r.status !== "ready"}
                >
                  <Icon name="download" size={15} />
                </button>
                <button className="fobo-btn fobo-btn-ghost fobo-btn-sm" title="Ver">
                  <Icon name="eye" size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {wizard && (
          <ReportWizard
            onClose={() => setWizard(false)}
            onDone={(r) => {
              setReports((p) => [r, ...p]);
              setWizard(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
