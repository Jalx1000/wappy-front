"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { metaKey, channelLabel } from "@/lib/channels";
import { useTagsStore } from "@/store/tags";
import { tagDot } from "@/components/tags/data";
import { useContactTagsStore } from "@/store/contactTags";
import { useToast } from "@/components/ui/Toast";
import type { ContactWithIdentities } from "@/lib/api/contacts";

const colHead: CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" };

type OptCol = "channel" | "tags" | "created" | "activity";
const OPT_COLS: { id: OptCol; label: string; w: string }[] = [
  { id: "channel", label: "Canal", w: "1fr" },
  { id: "tags", label: "Etiquetas", w: "1.5fr" },
  { id: "created", label: "Creado", w: "1fr" },
  { id: "activity", label: "Última act.", w: "1fr" },
];

const labelOf = (c: ContactWithIdentities) =>
  c.contact.displayName || c.contact.phone || c.identities[0]?.handle || c.identities[0]?.phone || "Sin nombre";
const initials = (s: string) => s.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
const shortDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—");
const relTime = (iso?: string | null) => {
  if (!iso) return "—";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d}d`;
  return shortDate(iso);
};

type SortCol = "name" | "created" | "activity";

export function ContactsTable({ contacts, selectedId, onSelect }: {
  contacts: ContactWithIdentities[]; selectedId?: string; onSelect: (id: string) => void;
}) {
  const tags = useTagsStore((s) => s.tags);
  const byContact = useContactTagsStore((s) => s.byContact);
  const toggleTag = useContactTagsStore((s) => s.toggle);
  const toast = useToast();
  const [sort, setSort] = useState<{ col: SortCol; dir: 1 | -1 }>({ col: "activity", dir: -1 });
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [view, setView] = useState<"list" | "chart">("list");
  const [colsOpen, setColsOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Set<OptCol>>(new Set(["channel", "tags", "created", "activity"]));

  const shownCols = OPT_COLS.filter((c) => visibleCols.has(c.id));
  const gridTemplate = ["34px", "2.2fr", ...shownCols.map((c) => c.w)].join(" ");

  const sorted = useMemo(() => {
    const arr = [...contacts];
    arr.sort((a, b) => {
      let av: string | number = 0, bv: string | number = 0;
      if (sort.col === "name") { av = labelOf(a).toLowerCase(); bv = labelOf(b).toLowerCase(); }
      else if (sort.col === "created") { av = new Date(a.contact.createdAt || 0).getTime(); bv = new Date(b.contact.createdAt || 0).getTime(); }
      else { av = new Date(a.contact.updatedAt || 0).getTime(); bv = new Date(b.contact.updatedAt || 0).getTime(); }
      return av < bv ? -sort.dir : av > bv ? sort.dir : 0;
    });
    return arr;
  }, [contacts, sort]);

  // Channel distribution for the chart view.
  const channelStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of contacts) {
      for (const ch of new Set(c.identities.map((i) => i.channel))) counts.set(ch, (counts.get(ch) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [contacts]);
  const maxChan = channelStats.reduce((m, [, n]) => Math.max(m, n), 0) || 1;

  const toggleSort = (col: SortCol) => setSort((s) => (s.col === col ? { col, dir: (s.dir * -1) as 1 | -1 } : { col, dir: 1 }));
  const arrow = (col: SortCol) => (sort.col === col ? (sort.dir === 1 ? " ↑" : " ↓") : "");
  const allChecked = sorted.length > 0 && sorted.every((c) => picked.has(c.contact.id));
  const toggleAll = () => setPicked(allChecked ? new Set() : new Set(sorted.map((c) => c.contact.id)));
  const toggleOne = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleCol = (id: OptCol) => setVisibleCols((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const bulkApplyTag = (tagId: string) => {
    picked.forEach((cid) => { if (!(byContact[cid] || []).includes(tagId)) toggleTag(cid, tagId); });
    setBulkOpen(false);
    toast(`Etiqueta aplicada a ${picked.size} contacto${picked.size !== 1 ? "s" : ""}`);
    setPicked(new Set());
  };

  const viewBtn = (v: "list" | "chart", icon: "list" | "barChart3", label: string) => (
    <button onClick={() => setView(v)} title={label} aria-label={label} className="flex items-center justify-center cursor-pointer"
      style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid var(--color-border)", background: view === v ? "var(--color-primary-subtle)" : "var(--color-surface)", color: view === v ? "var(--color-primary-ink)" : "var(--color-text-secondary)" }}>
      <Icon name={icon} size={15} />
    </button>
  );

  return (
    <div className="flex flex-col min-h-0" style={{ background: "var(--color-background)" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-none" style={{ padding: "12px 20px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <span className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{sorted.length} contactos</span>
        {picked.size > 0 && (
          <>
            <span className="text-[12.5px]" style={{ color: "var(--color-text-tertiary)" }}>· {picked.size} seleccionado{picked.size !== 1 ? "s" : ""}</span>
            <div className="relative">
              <button onClick={() => setBulkOpen((v) => !v)} className="fobo-btn fobo-btn-secondary fobo-btn-sm"><Icon name="tag" size={14} /> Añadir etiqueta</button>
              {bulkOpen && (
                <>
                  <div className="fixed inset-0 z-[40]" onClick={() => setBulkOpen(false)} />
                  <div className="absolute z-[41]" style={{ top: "calc(100% + 6px)", left: 0, minWidth: 180, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "var(--shadow-3)", padding: 6 }}>
                    {tags.map((t) => (
                      <button key={t.id} onClick={() => bulkApplyTag(t.id)} className="flex items-center gap-2 w-full text-left rounded-[8px] cursor-pointer" style={{ padding: "7px 9px", background: "transparent", border: "none", color: "var(--color-text-primary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <span className="rounded-full" style={{ width: 8, height: 8, background: tagDot(t.color) }} /> <span className="text-[13px]">{t.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* View + columns controls */}
        <div className="ml-auto flex items-center gap-2">
          {view === "list" && (
            <div className="relative">
              <button onClick={() => setColsOpen((v) => !v)} className="fobo-btn fobo-btn-secondary fobo-btn-sm flex items-center gap-1" style={{ height: 30 }}>
                <Icon name="list" size={14} /> Columnas
              </button>
              {colsOpen && (
                <>
                  <div className="fixed inset-0 z-[40]" onClick={() => setColsOpen(false)} />
                  <div className="absolute z-[41]" style={{ top: "calc(100% + 6px)", right: 0, minWidth: 180, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "var(--shadow-3)", padding: 6 }}>
                    {OPT_COLS.map((c) => (
                      <button key={c.id} onClick={() => toggleCol(c.id)} className="flex items-center gap-2.5 w-full text-left rounded-[8px] cursor-pointer" style={{ padding: "7px 9px", background: "transparent", border: "none", color: "var(--color-text-primary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <span className="flex items-center justify-center flex-none" style={{ width: 16, height: 16, borderRadius: 5, border: `1.5px solid ${visibleCols.has(c.id) ? "var(--color-primary)" : "var(--color-border-strong)"}`, background: visibleCols.has(c.id) ? "var(--color-primary)" : "transparent", color: "var(--color-on-primary)" }}>
                          {visibleCols.has(c.id) && <Icon name="check" size={11} strokeWidth={3} />}
                        </span>
                        <span className="text-[13px]">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {viewBtn("list", "list", "Vista de lista")}
          {viewBtn("chart", "barChart3", "Vista de gráfico")}
        </div>
      </div>

      {view === "chart" ? (
        /* Chart view — contacts per channel */
        <div className="flex-1 overflow-y-auto" style={{ padding: 24 }}>
          <div className="rounded-[14px]" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)", padding: 20, maxWidth: 620 }}>
            <div className="text-[13px] font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Contactos por canal</div>
            {channelStats.length === 0 ? (
              <div className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>Sin datos.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {channelStats.map(([ch, n]) => (
                  <div key={ch} className="flex items-center gap-3">
                    <div className="flex items-center gap-2" style={{ width: 130, flex: "none" }}>
                      <ChannelDot channel={metaKey(ch)} size={15} radius={5} />
                      <span className="text-[12.5px] truncate" style={{ color: "var(--color-text-secondary)" }}>{channelLabel(ch)}</span>
                    </div>
                    <div style={{ flex: 1, height: 12, borderRadius: 9999, background: "var(--neutral-200)", overflow: "hidden" }}>
                      <div style={{ width: (n / maxChan) * 100 + "%", height: "100%", borderRadius: 9999, background: "var(--color-primary)" }} />
                    </div>
                    <span className="tnum text-[13px] font-semibold" style={{ width: 34, textAlign: "right", flex: "none", color: "var(--color-text-primary)" }}>{n}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="grid items-center flex-none" style={{ gridTemplateColumns: gridTemplate, gap: 12, padding: "9px 20px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
            <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Seleccionar todo" style={{ cursor: "pointer" }} />
            <button onClick={() => toggleSort("name")} className="text-left cursor-pointer border-none bg-transparent" style={colHead}>Nombre{arrow("name")}</button>
            {visibleCols.has("channel") && <div style={colHead}>Canal</div>}
            {visibleCols.has("tags") && <div style={colHead}>Etiquetas</div>}
            {visibleCols.has("created") && <button onClick={() => toggleSort("created")} className="text-left cursor-pointer border-none bg-transparent" style={colHead}>Creado{arrow("created")}</button>}
            {visibleCols.has("activity") && <button onClick={() => toggleSort("activity")} className="text-left cursor-pointer border-none bg-transparent" style={colHead}>Última act.{arrow("activity")}</button>}
          </div>

          {/* Rows */}
          <div className="flex-1 overflow-y-auto">
            {sorted.map((c) => {
              const id = c.contact.id;
              const on = id === selectedId;
              const chs = [...new Set(c.identities.map((i) => i.channel))];
              const ctags = tags.filter((t) => (byContact[id] || []).includes(t.id));
              return (
                <div key={id} onClick={() => onSelect(id)}
                  role="button" tabIndex={0} aria-pressed={on} aria-label={labelOf(c)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(id); } }}
                  className="grid items-center cursor-pointer fobo-focus-ring"
                  style={{ gridTemplateColumns: gridTemplate, gap: 12, padding: "11px 20px", borderBottom: "1px solid var(--color-border)", background: on ? "var(--color-primary-subtle)" : "transparent", transition: "background 120ms" }}
                  onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--neutral-50)"; }}
                  onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                  <input type="checkbox" checked={picked.has(id)} onChange={() => toggleOne(id)} onClick={(e) => e.stopPropagation()} aria-label="Seleccionar" style={{ cursor: "pointer" }} />
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex items-center justify-center rounded-full flex-none text-[11px] font-bold" style={{ width: 30, height: 30, background: "var(--color-secondary-subtle)", color: "var(--color-secondary-ink)" }}>{initials(labelOf(c))}</span>
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{labelOf(c)}</div>
                      {c.contact.email && <div className="text-[11.5px] truncate" style={{ color: "var(--color-text-tertiary)" }}>{c.contact.email}</div>}
                    </div>
                  </div>
                  {visibleCols.has("channel") && (
                    <div className="flex items-center gap-1">
                      {chs.slice(0, 3).map((ch) => <ChannelDot key={ch} channel={metaKey(ch)} size={15} radius={5} />)}
                      {chs.length > 3 && <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>+{chs.length - 3}</span>}
                      {chs.length === 0 && <span className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>—</span>}
                    </div>
                  )}
                  {visibleCols.has("tags") && (
                    <div className="flex items-center gap-1 flex-wrap min-w-0">
                      {ctags.length === 0 ? <span className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>—</span> : ctags.slice(0, 2).map((t) => (
                        <span key={t.id} className="inline-flex items-center gap-1 rounded-full" style={{ padding: "1px 7px 1px 5px", background: "var(--neutral-100)" }}>
                          <span className="rounded-full" style={{ width: 6, height: 6, background: tagDot(t.color) }} />
                          <span className="text-[10.5px] font-medium" style={{ color: "var(--color-text-secondary)" }}>{t.name}</span>
                        </span>
                      ))}
                      {ctags.length > 2 && <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>+{ctags.length - 2}</span>}
                    </div>
                  )}
                  {visibleCols.has("created") && <div className="text-[12.5px] truncate" style={{ color: "var(--color-text-secondary)" }}>{shortDate(c.contact.createdAt)}</div>}
                  {visibleCols.has("activity") && <div className="text-[12.5px] truncate" style={{ color: "var(--color-text-secondary)" }}>{relTime(c.contact.updatedAt)}</div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
