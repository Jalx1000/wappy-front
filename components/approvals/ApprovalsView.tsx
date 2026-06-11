"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { useToast } from "@/components/ui/Toast";
import { useApprovals, useUpdateApproval } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import type { Approval, ApprovalStatus } from "@/lib/mocks/analyticsData";
import { Skeleton } from "@/components/ui/Skeleton";

const STATUS_META: Record<ApprovalStatus, { label: string; variant: "success"|"error"|"warning"|"neutral"|"primary" }> = {
  pending:  { label: "Pendiente",           variant: "warning" },
  approved: { label: "Aprobado",            variant: "success" },
  rejected: { label: "Rechazado",           variant: "error" },
  changes:  { label: "Cambios solicitados", variant: "neutral" },
};

function ReviewModal({ item, onClose, onApprove, onReject, onChanges }: {
  item: Approval;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onChanges: (note: string) => void;
}) {
  const [note, setNote] = useState("");
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
        className="w-[680px] max-w-[94vw] max-h-[90vh] overflow-y-auto"
        style={{
          background: "var(--color-surface)",
          borderRadius: 20,
          boxShadow: "var(--shadow-3)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <ChannelDot channel={item.ch} size={32} radius={8} />
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
              {item.title}
            </div>
            <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
              {item.by} · {item.role} · {item.when}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer"
            style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="p-6 grid gap-5" style={{ gridTemplateColumns: "1fr 1.4fr" }}>
          {/* Preview */}
          <div>
            <ImagePlaceholder ratio={item.ratio} label={`${item.ch} · ${item.ratio}`} />
          </div>
          {/* Caption + notes */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase mb-2" style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>
                Caption / Copy
              </div>
              <div
                className="text-[13.5px] leading-relaxed p-3 rounded-[10px]"
                style={{
                  background: "var(--color-background)",
                  color: "var(--color-text-primary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {item.caption}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase mb-2" style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>
                Anotaciones
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Escribe tus comentarios para el equipo…"
                rows={4}
                className="fobo-input"
                style={{ height: "auto", resize: "none" }}
              />
            </div>
            <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
              Vence: <strong style={{ color: "var(--color-text-primary)" }}>{item.due}</strong>
            </div>
            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-2">
              <button
                className="fobo-btn fobo-btn-sm flex-1 gap-1"
                style={{ background: "var(--color-error)", color: "#fff" }}
                onClick={onReject}
              >
                <Icon name="x" size={14} /> Rechazar
              </button>
              {note && (
                <button
                  className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1 gap-1"
                  onClick={() => onChanges(note)}
                >
                  <Icon name="edit" size={14} /> Pedir cambios
                </button>
              )}
              <button
                className="fobo-btn fobo-btn-sm flex-1 gap-1"
                style={{ background: "var(--color-success)", color: "#fff" }}
                onClick={onApprove}
              >
                <Icon name="check" size={14} /> Aprobar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ApprovalsSkeleton() {
  return (
    <div className="p-7 max-w-[1440px]">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-2">
        {[...Array(6)].map((_, i) => <Skeleton.Approval key={i} />)}
      </div>
    </div>
  );
}

export function ApprovalsView() {
  const toast = useToast();
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: items = [], isPending } = useApprovals(brandId);

  if (isPending) return <ApprovalsSkeleton />;
  const updateApproval = useUpdateApproval(brandId);
  const [review, setReview] = useState<Approval | null>(null);

  const handleApprove = (id: number) => {
    updateApproval.mutate({ id, status: "approved" });
    setReview(null);
    toast("Pieza aprobada ✓");
  };
  const handleReject = (id: number) => {
    updateApproval.mutate({ id, status: "rejected" });
    setReview(null);
    toast("Pieza rechazada", "error");
  };
  const handleChanges = (id: number, note: string) => {
    updateApproval.mutate({ id, status: "changes", note });
    setReview(null);
    toast("Cambios solicitados al equipo");
  };

  const pending = items.filter((a) => a.status === "pending");

  return (
    <div className="p-7 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-end gap-4 mb-6 flex-wrap">
        <div>
          <h1
            style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}
          >
            Aprobaciones
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Piezas que esperan tu revisión
          </p>
        </div>
        {pending.length > 0 && (
          <div className="ml-auto">
            <Badge variant="warning">{pending.length} pendientes</Badge>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState icon="check" title="Todo al día" body="No hay piezas pendientes de aprobación." />
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
          {items.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="fobo-card p-0 overflow-hidden cursor-pointer"
              onClick={() => setReview(a)}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-2)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "")}
            >
              <div className="grid" style={{ gridTemplateColumns: "140px 1fr" }}>
                <ImagePlaceholder ratio="1/1" />
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <ChannelDot channel={a.ch} size={22} radius={6} />
                    <Badge variant={STATUS_META[a.status].variant}>{STATUS_META[a.status].label}</Badge>
                  </div>
                  <div className="text-[14px] font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>
                    {a.title}
                  </div>
                  <div
                    className="text-[12.5px] leading-snug overflow-hidden"
                    style={{
                      color: "var(--color-text-secondary)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {a.caption}
                  </div>
                  <div className="text-[11.5px] mt-auto" style={{ color: "var(--color-text-tertiary)" }}>
                    {a.by} · {a.when} · vence {a.due}
                  </div>
                  {a.status === "pending" && (
                    <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="fobo-btn fobo-btn-sm flex-1"
                        style={{ background: "var(--color-success-bg)", color: "var(--color-success-dark)" }}
                        onClick={() => handleApprove(a.id)}
                      >
                        <Icon name="check" size={13} /> Aprobar
                      </button>
                      <button
                        className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1"
                        onClick={() => setReview(a)}
                      >
                        Revisar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {review && (
          <ReviewModal
            item={review}
            onClose={() => setReview(null)}
            onApprove={() => handleApprove(review.id)}
            onReject={() => handleReject(review.id)}
            onChanges={(note) => handleChanges(review.id, note)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
