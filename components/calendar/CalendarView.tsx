"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { Segmented } from "@/components/ui/Segmented";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useCalendar } from "@/lib/hooks";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import { POST_STATUS_META } from "@/lib/mocks/analyticsData";
import type { CalPost, PostStatus } from "@/lib/mocks/analyticsData";
import { Skeleton } from "@/components/ui/Skeleton";

let _id = 100;
const uid = () => `p${++_id}`;

function flattenRaw(raw: Record<number, { ch: string; st: PostStatus; t: string }[]>): CalPost[] {
  const HOURS = ["09:00", "13:00", "19:00", "21:00"];
  const out: CalPost[] = [];
  Object.entries(raw).forEach(([d, arr]) => {
    arr.forEach((p, i) => {
      out.push({ id: uid(), day: +d, ch: p.ch, st: p.st, t: p.t, time: HOURS[(+d + i) % HOURS.length] });
    });
  });
  return out;
}

const STATUS_OPTS: PostStatus[] = ["scheduled", "published", "review", "draft"];

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
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: calData, isPending } = useCalendar(brandId, 2026, 6);

  const [view, setView] = useState<"month" | "list">("month");
  const [posts, setPosts] = useState<CalPost[]>([]);
  const [dayPanel, setDayPanel] = useState<number | null>(null);
  const [form, setForm] = useState<{ day: number; post?: CalPost } | null>(null);

  useEffect(() => {
    if (calData?.posts) {
      setPosts(flattenRaw(calData.posts as Record<number, { ch: string; st: PostStatus; t: string }[]>));
    }
  }, [calData]);

  if (isPending) return <CalendarSkeleton />;
  const calMonth = "Junio 2026";

  const byDay: Record<number, CalPost[]> = {};
  posts.forEach((p) => { (byDay[p.day] = byDay[p.day] || []).push(p); });

  const scheduled = posts.filter((p) => p.st === "scheduled").length;
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  // June 2026 starts on Monday (offset 0)
  const cells: (number | null)[] = Array.from({ length: 35 }, (_, i) => (i < 30 ? i + 1 : null));

  const deletePost = (id: string) => {
    setPosts((p) => p.filter((x) => x.id !== id));
    toast("Publicación eliminada");
  };

  return (
    <div className="p-7 overflow-y-auto h-full">
      <DemoBanner module="Calendario" />
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
            Calendario
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {calMonth} · {scheduled} programadas de {posts.length}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Segmented
            options={[{ v: "month", l: "Mes" }, { v: "list", l: "Lista" }]}
            value={view}
            onChange={(v) => setView(v as "month" | "list")}
            sm
          />
          <button
            className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1"
            onClick={() => setForm({ day: 9 })}
          >
            <Icon name="plus" size={15} /> Programar
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {STATUS_OPTS.map((s) => {
          const m = POST_STATUS_META[s];
          return (
            <div key={s} className="flex items-center gap-[6px] text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
              <span className="rounded-[3px]" style={{ width: 9, height: 9, background: m.color }} />
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
          {/* Day headers */}
          <div className="grid" style={{ gridTemplateColumns: "repeat(7,1fr)" }}>
            {days.map((d) => (
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
          {/* Day cells */}
          <div className="grid" style={{ gridTemplateColumns: "repeat(7,1fr)" }}>
            {cells.map((d, i) => {
              const dayPosts = d ? (byDay[d] || []) : [];
              const isToday = d === 9;
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
                  onMouseEnter={(e) => { if (d && !isSelected) (e.currentTarget as HTMLDivElement).style.background = "var(--color-background)"; }}
                  onMouseLeave={(e) => { if (d && !isSelected) (e.currentTarget as HTMLDivElement).style.background = "var(--color-surface)"; }}
                >
                  {d && (
                    <>
                      <div
                        className="flex items-center justify-center text-[12.5px] font-medium rounded-full mb-1"
                        style={{
                          width: 24, height: 24,
                          background: isToday ? "var(--color-primary)" : "transparent",
                          color: isToday ? "#fff" : "var(--color-text-secondary)",
                          fontWeight: isToday ? 700 : 500,
                        }}
                      >
                        {d}
                      </div>
                      <div className="flex flex-col gap-[3px]">
                        {dayPosts.slice(0, 3).map((p) => {
                          const col = POST_STATUS_META[p.st].color;
                          return (
                            <div
                              key={p.id}
                              title={`${p.t} · ${p.time}`}
                              className="flex items-center gap-[5px] px-[5px] py-[2px] rounded-[6px] cursor-pointer"
                              style={{
                                background: "var(--color-background)",
                                borderLeft: `2.5px solid ${col}`,
                              }}
                              onClick={(e) => { e.stopPropagation(); setForm({ day: d, post: p }); }}
                            >
                              <span className="text-[9px] font-bold tnum" style={{ color: col, flexShrink: 0 }}>{p.time}</span>
                              <ChannelDot channel={p.ch} size={13} radius={3} />
                              <span
                                className="text-[10px] truncate"
                                style={{ color: "var(--color-text-secondary)" }}
                              >
                                {p.t}
                              </span>
                            </div>
                          );
                        })}
                        {dayPosts.length > 3 && (
                          <div className="text-[10px] px-1" style={{ color: "var(--color-text-tertiary)" }}>
                            +{dayPosts.length - 3} más
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
        // List view
        <div className="fobo-card overflow-hidden">
          {[...posts]
            .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time))
            .map((p, i, arr) => {
              const col = POST_STATUS_META[p.st].color;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 px-5 py-[13px]"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}
                >
                  <div className="text-center flex-shrink-0" style={{ width: 44 }}>
                    <div
                      style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 18, color: "var(--color-text-primary)", lineHeight: 1 }}
                    >
                      {p.day}
                    </div>
                    <div className="text-[10.5px] uppercase" style={{ color: "var(--color-text-tertiary)" }}>jun</div>
                  </div>
                  <ChannelDot channel={p.ch} size={30} radius={9999} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      {p.t}
                    </div>
                    <div className="flex items-center gap-[6px] text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                      <Icon name="clock" size={12} /> {p.time}
                    </div>
                  </div>
                  <span className="text-[11.5px] font-semibold" style={{ color: col }}>
                    ● {POST_STATUS_META[p.st].label}
                  </span>
                  <button
                    className="fobo-btn fobo-btn-ghost fobo-btn-sm"
                    onClick={() => setForm({ day: p.day, post: p })}
                  >
                    <Icon name="edit" size={14} />
                  </button>
                  <button
                    className="fobo-btn fobo-btn-sm"
                    style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}
                    onClick={() => deletePost(p.id)}
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              );
            })}
        </div>
      )}

      {/* Day panel sidebar (slide-in) */}
      <AnimatePresence>
        {dayPanel !== null && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-0 bottom-0 w-[320px] z-30 flex flex-col overflow-y-auto"
            style={{ background: "var(--color-surface)", borderLeft: "1px solid var(--color-border)", boxShadow: "var(--shadow-3)" }}
          >
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <div>
                <div className="font-semibold text-[15px]" style={{ color: "var(--color-text-primary)" }}>
                  {dayPanel} de junio
                </div>
                <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {(byDay[dayPanel] || []).length} publicaciones
                </div>
              </div>
              <button
                className="ml-auto flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer"
                style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}
                onClick={() => setDayPanel(null)}
              >
                <Icon name="x" size={15} />
              </button>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {(byDay[dayPanel] || []).length === 0 ? (
                <p className="text-[13px] text-center py-8" style={{ color: "var(--color-text-tertiary)" }}>
                  Sin publicaciones este día
                </p>
              ) : (
                (byDay[dayPanel] || []).map((p) => {
                  const col = POST_STATUS_META[p.st].color;
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-[12px] cursor-pointer"
                      style={{ background: "var(--color-background)", borderLeft: `3px solid ${col}` }}
                      onClick={() => setForm({ day: p.day, post: p })}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ChannelDot channel={p.ch} size={20} radius={5} />
                        <span className="text-[12px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                          {p.t}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                        <span>{p.time}</span>
                        <span style={{ color: col }}>● {POST_STATUS_META[p.st].label}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <button
                className="fobo-btn fobo-btn-primary fobo-btn-sm w-full mt-2 gap-1"
                onClick={() => { setForm({ day: dayPanel }); setDayPanel(null); }}
              >
                <Icon name="plus" size={14} /> Añadir publicación
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose modal (simplified) */}
      <AnimatePresence>
        {form && (
          <ComposeModal
            day={form.day}
            post={form.post}
            onClose={() => setForm(null)}
            onSave={(data) => {
              if (form.post) {
                setPosts((p) => p.map((x) => (x.id === form.post!.id ? { ...x, ...data } : x)));
                toast("Publicación actualizada");
              } else {
                setPosts((p) => [...p, { id: uid(), ...data }]);
                toast("Publicación programada ✓");
              }
              setForm(null);
            }}
            onDelete={form.post ? () => { deletePost(form.post!.id); setForm(null); } : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Compose modal ─────────────────────────────────────────────────────────────
const CHANNELS = ["facebook", "instagram", "tiktok", "youtube", "linkedin"];
const TIMES = ["09:00", "12:00", "13:00", "18:00", "19:00", "20:00", "21:00"];

function ComposeModal({ day, post, onClose, onSave, onDelete }: {
  day: number;
  post?: CalPost;
  onClose: () => void;
  onSave: (data: Omit<CalPost, "id">) => void;
  onDelete?: () => void;
}) {
  const [ch, setCh] = useState(post?.ch ?? "instagram");
  const [t, setT] = useState(post?.t ?? "");
  const [time, setTime] = useState(post?.time ?? "19:00");
  const [st, setSt] = useState<PostStatus>(post?.st ?? "scheduled");

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
        transition={{ duration: 0.16 }}
        className="w-[440px] max-w-[94vw]"
        style={{ background: "var(--color-surface)", borderRadius: 20, boxShadow: "var(--shadow-3)", padding: 24 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="font-semibold text-[16px]" style={{ color: "var(--color-text-primary)" }}>
            {post ? "Editar publicación" : `Programar · ${day} de junio`}
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer" style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}>
            <Icon name="x" size={15} />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {/* Channel */}
          <div>
            <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>Canal</label>
            <div className="flex gap-2 flex-wrap">
              {CHANNELS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCh(c)}
                  className="flex items-center gap-1.5 px-3 py-[6px] rounded-full text-[12px] font-medium border-none cursor-pointer transition-colors"
                  style={{
                    background: ch === c ? "var(--color-primary-subtle)" : "var(--color-background)",
                    color: ch === c ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
                    outline: ch === c ? "1.5px solid var(--color-primary)" : "none",
                  }}
                >
                  <ChannelDot channel={c} size={16} radius={4} />
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {/* Title */}
          <div>
            <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>Título</label>
            <input
              className="fobo-input"
              placeholder="Describe la publicación…"
              value={t}
              onChange={(e) => setT(e.target.value)}
            />
          </div>
          {/* Time + status */}
          <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>Hora</label>
              <select
                className="fobo-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                {TIMES.map((h) => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>Estado</label>
              <select
                className="fobo-input"
                value={st}
                onChange={(e) => setSt(e.target.value as PostStatus)}
              >
                {STATUS_OPTS.map((s) => (
                  <option key={s} value={s}>{POST_STATUS_META[s].label}</option>
                ))}
              </select>
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {onDelete && (
              <button
                className="fobo-btn fobo-btn-sm"
                style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}
                onClick={onDelete}
              >
                <Icon name="trash" size={14} />
              </button>
            )}
            <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="fobo-btn fobo-btn-primary fobo-btn-sm flex-1"
              onClick={() => { if (t.trim()) onSave({ day, ch, t: t.trim(), time, st }); }}
            >
              {post ? "Guardar" : "Programar"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
