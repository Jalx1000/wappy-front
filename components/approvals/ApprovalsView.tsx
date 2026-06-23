"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUIStore } from "@/store/ui";
import {
  useApprovalsList,
  useReviewApproval,
  useCalendarItems,
} from "@/lib/hooks";
import type { CalendarItem } from "@/lib/api/calendar";

type Variant = "success" | "error" | "warning" | "neutral" | "primary";
const STATUS_META: Record<string, { label: string; variant: Variant }> = {
  pending: { label: "Pendiente", variant: "warning" },
  approved: { label: "Aprobado", variant: "success" },
  rejected: { label: "Rechazado", variant: "error" },
};
const metaFor = (s: string) =>
  STATUS_META[s] ?? { label: s, variant: "neutral" as Variant };

function fmtDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ApprovalsSkeleton() {
  return (
    <div className="p-7 max-w-[1440px]">
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}

export function ApprovalsView() {
  const toast = useToast();
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id;

  const { data: approvals = [], isPending } = useApprovalsList(brandId);
  // Wide window so the linked publication's title can be resolved.
  const { fromISO, toISO } = useMemo(() => {
    const nowMs = new Date().getTime();
    const from = new Date(nowMs - 90 * 24 * 60 * 60 * 1000);
    const to = new Date(nowMs + 365 * 24 * 60 * 60 * 1000);
    return { fromISO: from.toISOString(), toISO: to.toISOString() };
  }, []);
  const { data: items = [] } = useCalendarItems(brandId, fromISO, toISO);
  const reviewMut = useReviewApproval();

  const itemsById = useMemo(() => {
    const m = new Map<number, CalendarItem>();
    for (const it of items) m.set(it.id, it);
    return m;
  }, [items]);

  if (isPending) return <ApprovalsSkeleton />;

  const sorted = [...approvals].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (b.status === "pending" && a.status !== "pending") return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const pendingCount = approvals.filter((a) => a.status === "pending").length;

  const review = (id: number, decision: "approved" | "rejected") => {
    reviewMut.mutate(
      { id, status: decision },
      {
        onSuccess: () =>
          toast(
            decision === "approved"
              ? "Aprobado y programado ✓"
              : "Rechazado",
            decision === "approved" ? undefined : "error",
          ),
        onError: (err) =>
          toast((err as Error).message || "No se pudo revisar", "error"),
      },
    );
  };

  return (
    <div className="p-7 overflow-y-auto h-full">
      <div className="flex items-end gap-4 mb-6 flex-wrap">
        <div>
          <h1
            style={{
              fontFamily: "var(--ff-display)",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
            }}
          >
            Aprobaciones
          </h1>
          <p
            className="text-[14px] mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Publicaciones que esperan revisión antes de programarse
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="ml-auto">
            <Badge variant="warning">{pendingCount} pendientes</Badge>
          </div>
        )}
      </div>

      {approvals.length === 0 ? (
        <EmptyState
          icon="check"
          title="Todo al día"
          body="No hay publicaciones pendientes de aprobación. Marca una publicación como 'En revisión' en el Calendario para que aparezca aquí."
        />
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(2,1fr)" }}
        >
          {sorted.map((a, i) => {
            const item = a.calendarItemId
              ? itemsById.get(a.calendarItemId)
              : undefined;
            const networks =
              (item?.metadata?.networks as string[] | undefined) ?? [];
            const m = metaFor(a.status);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="fobo-card p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  {networks.map((n) => (
                    <ChannelDot key={n} channel={n} size={20} radius={5} />
                  ))}
                  <Badge variant={m.variant}>{m.label}</Badge>
                  <span
                    className="ml-auto text-[11.5px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {fmtDate(a.createdAt)}
                  </span>
                </div>
                <div
                  className="text-[14px] font-semibold leading-snug"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {item?.title ??
                    (a.calendarItemId
                      ? `Publicación #${a.calendarItemId}`
                      : `Asset #${a.assetId}`)}
                </div>
                {item?.description && (
                  <div
                    className="text-[12.5px] leading-snug overflow-hidden"
                    style={{
                      color: "var(--color-text-secondary)",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.description}
                  </div>
                )}
                {item?.scheduledAt && (
                  <div
                    className="flex items-center gap-1.5 text-[11.5px]"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    <Icon name="clock" size={12} /> Programada:{" "}
                    {fmtDate(item.scheduledAt)}
                  </div>
                )}
                {a.feedback && (
                  <div
                    className="text-[12px] p-2 rounded-[8px]"
                    style={{
                      background: "var(--color-background)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {a.feedback}
                  </div>
                )}
                {a.status === "pending" && (
                  <div className="flex gap-2 mt-1">
                    <button
                      className="fobo-btn fobo-btn-sm flex-1"
                      style={{
                        background: "var(--color-error-bg)",
                        color: "var(--color-error)",
                      }}
                      disabled={reviewMut.isPending}
                      onClick={() => review(a.id, "rejected")}
                    >
                      <Icon name="x" size={13} /> Rechazar
                    </button>
                    <button
                      className="fobo-btn fobo-btn-sm flex-1"
                      style={{
                        background: "var(--color-success-bg, #dcfce7)",
                        color: "var(--color-success-dark, #15803d)",
                      }}
                      disabled={reviewMut.isPending}
                      onClick={() => review(a.id, "approved")}
                    >
                      <Icon name="check" size={13} /> Aprobar
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
