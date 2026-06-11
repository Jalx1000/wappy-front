"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { useRequests, useUpdateRequest } from "@/lib/hooks";
import { REQ_PRI_META, REQ_STATUS_META } from "@/lib/mocks/analyticsData";
import type { BadgeVariant } from "@/components/ui/Badge";
import type { RequestItem } from "@/lib/api/requests";

type ReqStatus = "abierta" | "progreso" | "cerrada";

const FILTERS: Array<{ v: string; l: string }> = [
  { v: "all",     l: "Todas" },
  { v: "abierta", l: "Abiertas" },
  { v: "progreso",l: "En progreso" },
  { v: "cerrada", l: "Cerradas" },
];

export function RequestsView() {
  const toast = useToast();
  const [filter, setFilter] = useState("all");
  const { data: items = [] } = useRequests();
  const updateRequest = useUpdateRequest();
  const [form, setForm] = useState(false);

  const list = items.filter((r) => filter === "all" || r.status === filter);

  const setStatus = (id: string, status: ReqStatus) => {
    updateRequest.mutate({ id, status });
    toast(`Estado: ${REQ_STATUS_META[status].label}`);
  };

  return (
    <div className="p-7 overflow-y-auto h-full">
      <div className="flex items-end gap-4 mb-5 flex-wrap">
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
            Solicitudes
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {items.length} pedidos de clientes y equipos internos
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Segmented options={FILTERS} value={filter} onChange={setFilter} sm />
          <button className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1" onClick={() => setForm(true)}>
            <Icon name="plus" size={15} /> Nueva solicitud
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState icon="ticket" title="Sin solicitudes" body="No hay solicitudes en este filtro." action={
          <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setForm(true)}>
            <Icon name="plus" size={15} /> Nueva solicitud
          </button>
        } />
      ) : (
        <div className="fobo-card overflow-hidden">
          <div
            className="grid gap-4 px-5 py-3"
            style={{
              gridTemplateColumns: "90px 2fr 1.2fr 1fr 0.9fr 1fr 100px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {["ID", "Solicitud", "Marca", "Tipo", "Prioridad", "Estado", ""].map((h) => (
              <div key={h} className="text-[10.5px] font-bold uppercase" style={{ letterSpacing: "0.05em", color: "var(--color-text-tertiary)" }}>{h}</div>
            ))}
          </div>
          {list.map((r, i) => {
            const sMeta = REQ_STATUS_META[r.status as ReqStatus];
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid gap-4 px-5 py-[14px] items-center"
                style={{
                  gridTemplateColumns: "90px 2fr 1.2fr 1fr 0.9fr 1fr 100px",
                  borderBottom: i < list.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "var(--color-background)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                <div className="text-[12px] font-semibold" style={{ fontFamily: "var(--ff-mono)", color: "var(--color-text-tertiary)" }}>{r.id}</div>
                <div>
                  <div className="text-[13.5px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{r.title}</div>
                  <div className="text-[11.5px] mt-[2px]" style={{ color: "var(--color-text-tertiary)" }}>{r.by} · {r.when}</div>
                </div>
                <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{r.brand}</div>
                <div>
                  <span className="text-[11.5px] font-medium px-[7px] py-[3px] rounded-full" style={{ background: "var(--color-background)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }}>
                    {r.type}
                  </span>
                </div>
                <div>
                  <Badge variant={REQ_PRI_META[r.pri] as BadgeVariant}>{r.pri}</Badge>
                </div>
                <div>
                  <Badge variant={sMeta.variant as BadgeVariant}>{sMeta.label}</Badge>
                </div>
                <div className="flex gap-1">
                  {r.status !== "progreso" && (
                    <button
                      title="Marcar en progreso"
                      className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
                      onClick={() => setStatus(r.id, "progreso")}
                    >
                      <Icon name="spark" size={13} />
                    </button>
                  )}
                  {r.status !== "cerrada" && (
                    <button
                      title="Marcar cerrada"
                      className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1"
                      onClick={() => setStatus(r.id, "cerrada")}
                    >
                      <Icon name="check" size={13} />
                    </button>
                  )}
                  <button className="fobo-btn fobo-btn-ghost fobo-btn-sm p-1">
                    <Icon name="edit" size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New request modal (simplified) */}
      <AnimatePresence>
        {form && (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center"
            style={{ background: "var(--color-overlay-scrim)", backdropFilter: "blur(3px)" }}
            onMouseDown={() => setForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className="w-[480px] max-w-[94vw] p-6"
              style={{ background: "var(--color-surface)", borderRadius: 20, boxShadow: "var(--shadow-3)" }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="font-semibold text-[16px]" style={{ color: "var(--color-text-primary)" }}>
                  Nueva solicitud
                </div>
                <button onClick={() => setForm(false)} className="flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer" style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}>
                  <Icon name="x" size={15} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>Título</label>
                  <input className="fobo-input" placeholder="Describe la solicitud…" />
                </div>
                <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                  <div>
                    <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>Tipo</label>
                    <select className="fobo-input">
                      {["Diseño", "Reporte", "Pauta", "CM", "Producción", "Otro"].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>Prioridad</label>
                    <select className="fobo-input">
                      {["alta", "media", "baja"].map((t) => (
                        <option key={t} className="capitalize">{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>Descripción</label>
                  <textarea className="fobo-input" rows={3} style={{ height: "auto", resize: "none" }} placeholder="Detalles de la solicitud…" />
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1" onClick={() => setForm(false)}>Cancelar</button>
                  <button
                    className="fobo-btn fobo-btn-primary fobo-btn-sm flex-1"
                    onClick={() => {
                      updateRequest.mutate({ id: `SOL-${Date.now()}`, status: "abierta" });
                      setForm(false);
                      toast("Solicitud creada ✓");
                    }}
                  >
                    Crear solicitud
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
