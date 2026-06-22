"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { Segmented } from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUIStore } from "@/store/ui";
import {
  useCalendarItems,
  useCreateCalendarItem,
  useUpdateCalendarItem,
  useDeleteCalendarItem,
  usePublishCalendarItem,
  useCreateApproval,
  useReviewApproval,
  useAssets,
  useConnections,
} from "@/lib/hooks";
import { filesApi } from "@/lib/api/files";
import { assetsApi, type AssetItem } from "@/lib/api/assets";
import type { CalendarItem } from "@/lib/api/calendar";

const NETWORKS = ["tiktok", "facebook", "instagram"] as const;
const TIMES = ["09:00", "12:00", "13:00", "18:00", "19:00", "20:00", "21:00"];

const STATUS_META: Record<string, { color: string; label: string }> = {
  draft: { color: "#9ca3af", label: "Borrador" },
  review: { color: "#f59e0b", label: "En revisión" },
  scheduled: { color: "#6366f1", label: "Programado" },
  publishing: { color: "#3b82f6", label: "Publicando" },
  published: { color: "#10b981", label: "Publicado" },
  failed: { color: "#ef4444", label: "Falló" },
};
const metaFor = (s: string) => STATUS_META[s] ?? { color: "#9ca3af", label: s };

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function itemNetworks(item: CalendarItem): string[] {
  const nets = (item.metadata?.networks as string[] | undefined) ?? [];
  if (nets.length) return nets;
  return item.connectionId ? ["tiktok"] : [];
}

function timeOf(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

function CalendarSkeleton() {
  return (
    <div className="p-7 max-w-[1440px] flex flex-col gap-4">
      <div className="grid grid-cols-7 gap-2">
        {[...Array(35)].map((_, i) => (
          <Skeleton key={i} className="h-[80px] rounded-[10px]" />
        ))}
      </div>
    </div>
  );
}

export function CalendarView() {
  const toast = useToast();
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const today = now.getDate();

  const { fromISO, toISO } = useMemo(() => {
    const first = new Date(year, month, 1, 0, 0, 0);
    const last = new Date(year, month + 1, 0, 23, 59, 59);
    return { fromISO: first.toISOString(), toISO: last.toISOString() };
  }, [year, month]);

  const { data: items = [], isPending } = useCalendarItems(
    brandId,
    fromISO,
    toISO,
  );

  const [view, setView] = useState<"month" | "list">("month");
  const [dayPanel, setDayPanel] = useState<number | null>(null);
  const [form, setForm] = useState<{ day: number; item?: CalendarItem } | null>(
    null,
  );

  const deleteMut = useDeleteCalendarItem();

  if (isPending) return <CalendarSkeleton />;

  const monthLabel = new Date(year, month, 1).toLocaleDateString("es", {
    month: "long",
    year: "numeric",
  });

  const byDay: Record<number, CalendarItem[]> = {};
  for (const it of items) {
    const d = new Date(it.scheduledAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      (byDay[d.getDate()] = byDay[d.getDate()] || []).push(it);
    }
  }

  const scheduledCount = items.filter((i) => i.status === "scheduled").length;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // Mon-first
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const removeItem = (id: number) => {
    deleteMut.mutate(id, {
      onSuccess: () => toast("Publicación eliminada"),
      onError: () => toast("No se pudo eliminar"),
    });
  };

  return (
    <div className="p-7 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div>
          <h1
            style={{
              fontFamily: "var(--ff-display)",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              textTransform: "capitalize",
            }}
          >
            Calendario
          </h1>
          <p
            className="text-[14px] mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <span style={{ textTransform: "capitalize" }}>{monthLabel}</span> ·{" "}
            {scheduledCount} programadas de {items.length}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Segmented
            options={[
              { v: "month", l: "Mes" },
              { v: "list", l: "Lista" },
            ]}
            value={view}
            onChange={(v) => setView(v as "month" | "list")}
            sm
          />
          <button
            className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1"
            onClick={() => setForm({ day: today })}
          >
            <Icon name="plus" size={15} /> Programar
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {["draft", "review", "scheduled", "published"].map((s) => {
          const m = metaFor(s);
          return (
            <div
              key={s}
              className="flex items-center gap-[6px] text-[12px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <span
                className="rounded-[3px]"
                style={{ width: 9, height: 9, background: m.color }}
              />
              {m.label}
            </div>
          );
        })}
      </div>

      {view === "month" ? (
        <div
          className="fobo-card overflow-hidden"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(7,1fr)" }}
          >
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="px-3 py-[10px] text-[11.5px] font-bold uppercase"
                style={{
                  letterSpacing: "0.04em",
                  color: "var(--color-text-tertiary)",
                  borderBottom: "1px solid var(--color-border)",
                  borderRight: "1px solid var(--color-border)",
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div
            className="grid"
            style={{ gridTemplateColumns: "repeat(7,1fr)" }}
          >
            {cells.map((d, i) => {
              const dayItems = d ? byDay[d] || [] : [];
              const isToday = d === today;
              const isSelected = d !== null && dayPanel === d;
              return (
                <div
                  key={i}
                  className="min-h-[100px] p-2 cursor-pointer transition-colors"
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    borderRight: "1px solid var(--color-border)",
                    background: d
                      ? isSelected
                        ? "var(--color-primary-subtle)"
                        : "var(--color-surface)"
                      : "var(--color-background)",
                  }}
                  onClick={() => d && setDayPanel(isSelected ? null : d)}
                >
                  {d && (
                    <>
                      <div
                        className="flex items-center justify-center text-[12.5px] font-medium rounded-full mb-1"
                        style={{
                          width: 24,
                          height: 24,
                          background: isToday
                            ? "var(--color-primary)"
                            : "transparent",
                          color: isToday ? "#fff" : "var(--color-text-secondary)",
                          fontWeight: isToday ? 700 : 500,
                        }}
                      >
                        {d}
                      </div>
                      <div className="flex flex-col gap-[3px]">
                        {dayItems.slice(0, 3).map((it) => {
                          const col = metaFor(it.status).color;
                          const nets = itemNetworks(it);
                          return (
                            <div
                              key={it.id}
                              title={`${it.title} · ${timeOf(it.scheduledAt)}`}
                              className="flex items-center gap-[5px] px-[5px] py-[2px] rounded-[6px] cursor-pointer"
                              style={{
                                background: "var(--color-background)",
                                borderLeft: `2.5px solid ${col}`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setForm({ day: d, item: it });
                              }}
                            >
                              <span
                                className="text-[9px] font-bold tnum"
                                style={{ color: col, flexShrink: 0 }}
                              >
                                {timeOf(it.scheduledAt)}
                              </span>
                              {nets[0] && (
                                <ChannelDot
                                  channel={nets[0]}
                                  size={13}
                                  radius={3}
                                />
                              )}
                              <span
                                className="text-[10px] truncate"
                                style={{ color: "var(--color-text-secondary)" }}
                              >
                                {it.title}
                              </span>
                            </div>
                          );
                        })}
                        {dayItems.length > 3 && (
                          <div
                            className="text-[10px] px-1"
                            style={{ color: "var(--color-text-tertiary)" }}
                          >
                            +{dayItems.length - 3} más
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="fobo-card overflow-hidden">
          {[...items]
            .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
            .map((it, i, arr) => {
              const col = metaFor(it.status).color;
              const nets = itemNetworks(it);
              const d = new Date(it.scheduledAt);
              return (
                <div
                  key={it.id}
                  className="flex items-center gap-4 px-5 py-[13px]"
                  style={{
                    borderBottom:
                      i < arr.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <div className="text-center flex-shrink-0" style={{ width: 44 }}>
                    <div
                      style={{
                        fontFamily: "var(--ff-display)",
                        fontWeight: 600,
                        fontSize: 18,
                        color: "var(--color-text-primary)",
                        lineHeight: 1,
                      }}
                    >
                      {d.getDate()}
                    </div>
                    <div
                      className="text-[10.5px] uppercase"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {d.toLocaleDateString("es", { month: "short" })}
                    </div>
                  </div>
                  {nets[0] && (
                    <ChannelDot channel={nets[0]} size={30} radius={9999} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[14px] font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {it.title}
                    </div>
                    <div
                      className="flex items-center gap-[6px] text-[12px]"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      <Icon name="clock" size={12} /> {timeOf(it.scheduledAt)}
                    </div>
                  </div>
                  <span
                    className="text-[11.5px] font-semibold"
                    style={{ color: col }}
                  >
                    ● {metaFor(it.status).label}
                  </span>
                  <button
                    className="fobo-btn fobo-btn-ghost fobo-btn-sm"
                    onClick={() => setForm({ day: d.getDate(), item: it })}
                  >
                    <Icon name="edit" size={14} />
                  </button>
                  <button
                    className="fobo-btn fobo-btn-sm"
                    style={{
                      background: "var(--color-error-bg)",
                      color: "var(--color-error)",
                    }}
                    onClick={() => removeItem(it.id)}
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              );
            })}
          {items.length === 0 && (
            <p
              className="text-[13px] text-center py-10"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Sin publicaciones este mes
            </p>
          )}
        </div>
      )}

      {/* Day panel */}
      <AnimatePresence>
        {dayPanel !== null && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-0 bottom-0 w-[320px] z-30 flex flex-col overflow-y-auto"
            style={{
              background: "var(--color-surface)",
              borderLeft: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-3)",
            }}
          >
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div>
                <div
                  className="font-semibold text-[15px]"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {dayPanel} de{" "}
                  {new Date(year, month, 1).toLocaleDateString("es", {
                    month: "long",
                  })}
                </div>
                <div
                  className="text-[12px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {(byDay[dayPanel] || []).length} publicaciones
                </div>
              </div>
              <button
                className="ml-auto flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer"
                style={{
                  background: "var(--color-background)",
                  color: "var(--color-text-secondary)",
                }}
                onClick={() => setDayPanel(null)}
              >
                <Icon name="x" size={15} />
              </button>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {(byDay[dayPanel] || []).length === 0 ? (
                <p
                  className="text-[13px] text-center py-8"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Sin publicaciones este día
                </p>
              ) : (
                (byDay[dayPanel] || []).map((it) => {
                  const col = metaFor(it.status).color;
                  return (
                    <div
                      key={it.id}
                      className="p-3 rounded-[12px] cursor-pointer"
                      style={{
                        background: "var(--color-background)",
                        borderLeft: `3px solid ${col}`,
                      }}
                      onClick={() => setForm({ day: dayPanel, item: it })}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {itemNetworks(it)[0] && (
                          <ChannelDot
                            channel={itemNetworks(it)[0]}
                            size={20}
                            radius={5}
                          />
                        )}
                        <span
                          className="text-[12px] font-semibold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {it.title}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-3 text-[11px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        <span>{timeOf(it.scheduledAt)}</span>
                        <span style={{ color: col }}>
                          ● {metaFor(it.status).label}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <button
                className="fobo-btn fobo-btn-primary fobo-btn-sm w-full mt-2 gap-1"
                onClick={() => {
                  setForm({ day: dayPanel });
                  setDayPanel(null);
                }}
              >
                <Icon name="plus" size={14} /> Añadir publicación
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit/compose modal */}
      <AnimatePresence>
        {form && (
          <PublicationModal
            year={year}
            month={month}
            day={form.day}
            item={form.item}
            onClose={() => setForm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Publication modal ─────────────────────────────────────────────────────────
function PublicationModal({
  year,
  month,
  day,
  item,
  onClose,
}: {
  year: number;
  month: number;
  day: number;
  item?: CalendarItem;
  onClose: () => void;
}) {
  const toast = useToast();
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id;

  const { data: assets = [] } = useAssets(brandId);
  const { data: connections = [] } = useConnections(brandId);
  const createMut = useCreateCalendarItem();
  const updateMut = useUpdateCalendarItem();
  const deleteMut = useDeleteCalendarItem();
  const publishMut = usePublishCalendarItem();
  const createApprovalMut = useCreateApproval();
  const reviewMut = useReviewApproval();

  const videoAssets = assets.filter(
    (a) => a.type === "video" || a.mimeType?.startsWith("video"),
  );

  const meta = (item?.metadata ?? {}) as Record<string, unknown>;
  const [networks, setNetworks] = useState<string[]>(
    (meta.networks as string[] | undefined) ??
      (item?.connectionId ? ["tiktok"] : ["tiktok"]),
  );
  const [title, setTitle] = useState(item?.title ?? "");
  const [copy, setCopy] = useState(item?.description ?? "");
  const [assetId, setAssetId] = useState<number | undefined>(
    meta.assetId as number | undefined,
  );
  const [time, setTime] = useState(
    item ? timeOf(item.scheduledAt) : "19:00",
  );
  const [status, setStatus] = useState(item?.status ?? "draft");
  const [uploading, setUploading] = useState(false);

  const tiktokConn = connections.find(
    (c) => c.ch === "tiktok" && c.status === "connected",
  );
  const selectedAsset = videoAssets.find((a) => a.id === assetId);

  const toggleNetwork = (n: string) =>
    setNetworks((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n],
    );

  const buildScheduledAt = () => {
    const [hh, mm] = time.split(":").map(Number);
    return new Date(year, month, day, hh, mm, 0).toISOString();
  };

  const buildMetadata = () => ({
    ...meta,
    assetId,
    networks,
    tiktokConnectionId: tiktokConn?.id,
    tiktokMode: (meta.tiktokMode as string) ?? "inbox",
  });

  const persist = async (overrideStatus?: string): Promise<number | null> => {
    const finalStatus = overrideStatus ?? status;
    const scheduledAt = buildScheduledAt();
    const metadata = buildMetadata();
    if (item) {
      await updateMut.mutateAsync({
        id: item.id,
        title: title.trim(),
        description: copy,
        scheduledAt,
        status: finalStatus,
        metadata,
      });
      return item.id;
    }
    const created = await createMut.mutateAsync({
      title: title.trim(),
      description: copy,
      scheduledAt,
      type: "video",
      metadata,
    });
    if (finalStatus !== "draft") {
      await updateMut.mutateAsync({ id: created.id, status: finalStatus });
    }
    return created.id;
  };

  const onSave = async () => {
    if (!title.trim()) {
      toast("Ponle un título interno");
      return;
    }
    try {
      const id = await persist();
      // Submitting for review creates a linked approval (shows in Aprobaciones;
      // approving it schedules the publication via the backend gate).
      if (id && status === "review" && assetId && !meta.approvalId) {
        const approval = await createApprovalMut.mutateAsync({
          assetId,
          calendarItemId: id,
        });
        await updateMut.mutateAsync({
          id,
          metadata: { ...buildMetadata(), approvalId: approval.id },
        });
      }
      toast(item ? "Publicación actualizada" : "Publicación guardada ✓");
      onClose();
    } catch {
      toast("No se pudo guardar");
    }
  };

  const onReview = async (decision: "approved" | "rejected") => {
    const approvalId = meta.approvalId as number | undefined;
    if (!approvalId) {
      toast("Sin aprobación vinculada");
      return;
    }
    try {
      await reviewMut.mutateAsync({ id: approvalId, status: decision });
      toast(decision === "approved" ? "Aprobado y programado ✓" : "Rechazado");
      onClose();
    } catch (err) {
      toast((err as Error).message || "No se pudo revisar");
    }
  };

  const onPublishNow = async () => {
    if (!title.trim()) {
      toast("Ponle un título interno");
      return;
    }
    if (!assetId) {
      toast("Selecciona un video");
      return;
    }
    try {
      const id = await persist("scheduled");
      if (!id) return;
      const res = await publishMut.mutateAsync(id);
      const tt = res.results?.tiktok;
      if (tt && tt.ok === false) {
        toast(`TikTok: ${tt.error ?? "falló"}`);
      } else {
        toast("Publicación enviada ✓");
        onClose();
      }
    } catch {
      toast("No se pudo publicar");
    }
  };

  const onDelete = async () => {
    if (!item) return;
    try {
      await deleteMut.mutateAsync(item.id);
      toast("Publicación eliminada");
      onClose();
    } catch {
      toast("No se pudo eliminar");
    }
  };

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const uploaded = await filesApi.upload(file);
      const asset = await assetsApi.create({
        name: file.name,
        type: "video",
        mimeType: file.type || "video/mp4",
        fileId: uploaded.id,
      });
      setAssetId(asset.id);
      toast("Video subido ✓");
    } catch (err) {
      toast((err as Error).message || "No se pudo subir el video");
    } finally {
      setUploading(false);
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{
        background: "var(--color-overlay-scrim)",
        backdropFilter: "blur(3px)",
      }}
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.16 }}
        className="w-[860px] max-w-[96vw] max-h-[92vh] overflow-hidden flex flex-col"
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
          <div
            className="font-semibold text-[16px]"
            style={{ color: "var(--color-text-primary)" }}
          >
            {item ? "Editar publicación" : "Nueva publicación"}
          </div>
          <button
            onClick={onClose}
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer"
            style={{
              background: "var(--color-background)",
              color: "var(--color-text-secondary)",
            }}
          >
            <Icon name="x" size={15} />
          </button>
        </div>

        {/* Body */}
        <div
          className="grid gap-0 overflow-y-auto"
          style={{ gridTemplateColumns: "1fr 300px" }}
        >
          {/* Form */}
          <div className="flex flex-col gap-4 p-6">
            <div>
              <label className="text-[12px] font-semibold block mb-2" style={lbl}>
                Redes sociales{" "}
                <span style={{ color: "var(--color-text-tertiary)" }}>
                  · publica en una o varias
                </span>
              </label>
              <div className="flex gap-2 flex-wrap">
                {NETWORKS.map((n) => {
                  const on = networks.includes(n);
                  return (
                    <button
                      key={n}
                      onClick={() => toggleNetwork(n)}
                      className="flex items-center gap-1.5 px-3 py-[6px] rounded-full text-[12px] font-medium border-none cursor-pointer"
                      style={{
                        background: on
                          ? "var(--color-primary-subtle)"
                          : "var(--color-background)",
                        color: on
                          ? "var(--color-primary-ink)"
                          : "var(--color-text-secondary)",
                        outline: on ? "1.5px solid var(--color-primary)" : "none",
                      }}
                    >
                      <ChannelDot channel={n} size={16} radius={4} />
                      {n.charAt(0).toUpperCase() + n.slice(1)}
                    </button>
                  );
                })}
              </div>
              {networks.some((n) => n !== "tiktok") && (
                <p
                  className="text-[11px] mt-1"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Por ahora solo TikTok publica automáticamente; Facebook e
                  Instagram llegan pronto.
                </p>
              )}
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={lbl}>
                Arte o video{" "}
                <span style={{ color: "var(--color-text-tertiary)" }}>
                  · formato 9:16
                </span>
              </label>
              <select
                className="fobo-input"
                value={assetId ?? ""}
                onChange={(e) =>
                  setAssetId(e.target.value ? Number(e.target.value) : undefined)
                }
              >
                <option value="">— Selecciona un video —</option>
                {videoAssets.map((a: AssetItem) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <label
                className="inline-flex items-center gap-1.5 mt-2 text-[12px] cursor-pointer"
                style={{ color: "var(--color-primary)" }}
              >
                <Icon name="plus" size={13} />
                {uploading ? "Subiendo…" : "Subir video"}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onUpload(f);
                  }}
                />
              </label>
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={lbl}>
                Título interno
              </label>
              <input
                className="fobo-input"
                placeholder="Ej. POV test drive"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={lbl}>
                Copy / descripción
              </label>
              <textarea
                className="fobo-input"
                rows={3}
                placeholder="Escribe el texto que acompaña la publicación…"
                value={copy}
                onChange={(e) => setCopy(e.target.value)}
              />
            </div>

            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
            >
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={lbl}>
                  Día
                </label>
                <input className="fobo-input" value={day} disabled />
              </div>
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={lbl}>
                  Hora
                </label>
                <select
                  className="fobo-input"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  {(TIMES.includes(time) ? TIMES : [time, ...TIMES]).map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={lbl}>
                  Estado
                </label>
                <select
                  className="fobo-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">Borrador</option>
                  <option value="review">En revisión</option>
                  <option value="scheduled">Programado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div
            className="p-6 flex flex-col gap-3"
            style={{ background: "var(--color-background)" }}
          >
            <div
              className="text-[11px] font-bold uppercase"
              style={{
                letterSpacing: "0.04em",
                color: "var(--color-text-tertiary)",
              }}
            >
              Vista previa
            </div>
            <div
              className="rounded-[14px] overflow-hidden flex flex-col justify-end"
              style={{
                aspectRatio: "9 / 16",
                background:
                  "linear-gradient(160deg,#1f2937,#111827)",
                color: "#fff",
                padding: 12,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ChannelDot channel="tiktok" size={22} radius={6} />
                <span className="text-[12px] font-semibold">
                  {activeBrand?.name ?? "Tu marca"}
                </span>
              </div>
              <div className="text-[12px] opacity-90 line-clamp-3">
                {copy || "Escribe tu copy para ver la vista previa…"}
              </div>
              <div className="text-[11px] opacity-70 mt-1">
                {selectedAsset ? selectedAsset.name : "Sin video seleccionado"}
              </div>
            </div>
            <div
              className="text-[11px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {tiktokConn
                ? `Cuenta TikTok: ${tiktokConn.account ?? "conectada"}`
                : "Sin cuenta TikTok conectada"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-2 px-6 py-4"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          {item && (
            <button
              className="fobo-btn fobo-btn-sm"
              style={{
                background: "var(--color-error-bg)",
                color: "var(--color-error)",
              }}
              onClick={onDelete}
            >
              <Icon name="trash" size={14} /> Eliminar
            </button>
          )}
          {item?.status === "review" && (
            <div className="flex items-center gap-2">
              <button
                className="fobo-btn fobo-btn-sm"
                style={{
                  background: "var(--color-error-bg)",
                  color: "var(--color-error)",
                }}
                disabled={reviewMut.isPending}
                onClick={() => onReview("rejected")}
              >
                Rechazar
              </button>
              <button
                className="fobo-btn fobo-btn-sm"
                style={{
                  background: "var(--color-success-bg, #dcfce7)",
                  color: "var(--color-success, #16a34a)",
                }}
                disabled={reviewMut.isPending}
                onClick={() => onReview("approved")}
              >
                {reviewMut.isPending ? "..." : "Aprobar"}
              </button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              className="fobo-btn fobo-btn-secondary fobo-btn-sm"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className="fobo-btn fobo-btn-ghost fobo-btn-sm"
              disabled={publishMut.isPending || saving}
              onClick={onPublishNow}
            >
              {publishMut.isPending ? "Publicando…" : "Publicar ahora"}
            </button>
            <button
              className="fobo-btn fobo-btn-primary fobo-btn-sm"
              disabled={saving}
              onClick={onSave}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const lbl: CSSProperties = { color: "var(--color-text-secondary)" };
