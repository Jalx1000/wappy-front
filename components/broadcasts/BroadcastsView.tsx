"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { uid } from "@/lib/id";
import { useBroadcastsStore } from "@/store/broadcasts";
import { CampaignEditor } from "./CampaignEditor";
import {
  AUDIENCE_FILTERS, CAMPAIGN_STATUS, CAMPAIGN_TYPES, CAMPAIGN_TYPE_ORDER, CATALOG_PRODUCTS, rate,
  type Campaign, type CampaignType,
} from "./data";

const GRID = "2.4fr 1.1fr 1fr 0.9fr 0.9fr 0.9fr 60px";

function CampaignStat({ icon, label, value, tint }: { icon: IconName; label: string; value: string | number; tint: { bg: string; fg: string } }) {
  return (
    <div style={{ flex: 1, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 14, padding: "14px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: tint.bg, color: tint.fg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name={icon} size={16} /></span>
        <span style={{ fontSize: 12.5, color: "var(--color-text-tertiary)" }}>{label}</span>
      </div>
      <div className="tnum" style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--color-text-primary)", marginTop: 8 }}>{value}</div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: IconName; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13, color: danger ? "var(--color-error)" : "var(--color-text-primary)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
      <Icon name={icon} size={16} /> {label}
    </div>
  );
}

function CampaignRow({ c, onEdit, onDuplicate, onDelete, onToggle }: {
  c: Campaign; onEdit: (c: Campaign) => void; onDuplicate: (c: Campaign) => void; onDelete: (c: Campaign) => void; onToggle: (c: Campaign) => void;
}) {
  const [hover, setHover] = useState(false);
  const [menu, setMenu] = useState(false);
  const t = CAMPAIGN_TYPES[c.type];
  const st = CAMPAIGN_STATUS[c.status];
  const sent = c.status === "sent" || c.status === "paused";
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setMenu(false); }} onClick={() => onEdit(c)}
      style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, alignItems: "center",
        padding: "13px 20px", borderBottom: "1px solid var(--color-border)", cursor: "pointer", background: hover ? "var(--neutral-100)" : "transparent", position: "relative" }}>
      {/* name + type icon */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: t.tint.bg, color: t.tint.fg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name={t.icon} size={19} /></span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{t.label}{c.sentAt ? " · " + c.sentAt : c.scheduledAt ? " · " + c.scheduledAt : ""}</div>
        </div>
      </div>
      {/* status */}
      <div><Badge variant={st.variant}>{st.label}</Badge></div>
      {/* audience */}
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{(AUDIENCE_FILTERS.find((a) => a.id === c.audience) || {}).label || "—"}</div>
      {/* recipients */}
      <div className="tnum" style={{ fontSize: 13.5, color: "var(--color-text-primary)", fontWeight: 500 }}>{c.recipients ? c.recipients.toLocaleString() : "—"}</div>
      {/* open rate */}
      <div className="tnum" style={{ fontSize: 13.5, color: sent ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>{sent ? rate(c.opened, c.recipients) : "—"}</div>
      {/* click rate */}
      <div className="tnum" style={{ fontSize: 13.5, color: sent ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>{sent ? rate(c.clicked, c.recipients) : "—"}</div>
      {/* actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", opacity: hover ? 1 : 0, transition: "opacity 120ms", position: "relative" }}>
        <button title="Más" onClick={(e) => { e.stopPropagation(); setMenu(!menu); }} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name="dots" size={18} /></button>
        {menu && (
          <>
            <div onClick={(e) => { e.stopPropagation(); setMenu(false); }} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
            <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: 32, right: 0, zIndex: 50, width: 180, background: "var(--color-surface)", borderRadius: 12, border: "1px solid var(--color-border)", boxShadow: "0 12px 32px rgba(0,0,0,0.18)", padding: 6 }}>
              <MenuItem icon="edit" label="Editar" onClick={() => { setMenu(false); onEdit(c); }} />
              {(c.status === "scheduled" || c.status === "paused") && <MenuItem icon={c.status === "paused" ? "send" : "clock"} label={c.status === "paused" ? "Reanudar" : "Pausar"} onClick={() => { setMenu(false); onToggle(c); }} />}
              <MenuItem icon="copy" label="Duplicar" onClick={() => { setMenu(false); onDuplicate(c); }} />
              <MenuItem icon="trash" label="Eliminar" danger onClick={() => { setMenu(false); onDelete(c); }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const chipBtn = (on: boolean): CSSProperties => ({ width: 30, height: 30, borderRadius: 9999, border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)", background: on ? "var(--color-primary-subtle)" : "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" });

export function BroadcastsView() {
  const { campaigns, setCampaigns } = useBroadcastsStore();
  const toast = useToast();
  const [editor, setEditor] = useState<{ campaign?: Campaign } | null>(null);
  const [confirm, setConfirm] = useState<Campaign | null>(null);
  const [typeFilter, setTypeFilter] = useState<CampaignType | "all">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => campaigns.filter((c) => {
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (query.trim() && !c.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }), [campaigns, typeFilter, statusFilter, query]);

  // aggregate stats
  const done = campaigns.filter((c) => c.status === "sent" || c.status === "paused");
  const totalReach = done.reduce((n, c) => n + (c.recipients || 0), 0);
  const totalOpened = done.reduce((n, c) => n + (c.opened || 0), 0);
  const totalClicked = done.reduce((n, c) => n + (c.clicked || 0), 0);
  const activeCount = campaigns.filter((c) => c.status === "scheduled" || c.status === "sending").length;

  const save = (data: Campaign) => {
    if (data.id) setCampaigns((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
    else setCampaigns((prev) => [{ ...data, id: uid("cmp") }, ...prev]);
    setEditor(null);
    toast(data.status === "sent" ? "Campaña enviada 🎉" : data.status === "scheduled" ? "Campaña programada" : "Borrador guardado");
  };
  const duplicate = (c: Campaign) => { setCampaigns((prev) => [{ ...c, id: uid("cmp"), name: c.name + " (copia)", status: "draft", sentAt: undefined, scheduledAt: undefined, opened: 0, clicked: 0 }, ...prev]); toast("Campaña duplicada"); };
  const del = (c: Campaign) => { setCampaigns((prev) => prev.filter((x) => x.id !== c.id)); setConfirm(null); toast("Campaña eliminada"); };
  const toggle = (c: Campaign) => { setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: x.status === "paused" ? "scheduled" : "paused" } : x))); toast(c.status === "paused" ? "Campaña reanudada" : "Campaña pausada"); };

  const statusTabs: [string, string][] = [["all", "Todas"], ["draft", "Borradores"], ["scheduled", "Programadas"], ["sent", "Enviadas"]];

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--color-background)", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "18px 24px 0", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ padding: "0 0 12px" }}><DemoBanner module="Mensajes proactivos" /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)", margin: 0 }}>Mensajes proactivos</h1>
          <Badge variant="neutral">{campaigns.length}</Badge>
          <button className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1" style={{ marginLeft: "auto" }} onClick={() => setEditor({})}><Icon name="plus" size={16} /> Nueva campaña</button>
        </div>
        {/* stat row */}
        <div style={{ display: "flex", gap: 12, paddingBottom: 16, flexWrap: "wrap" }}>
          <CampaignStat icon="users" label="Alcance total" value={totalReach.toLocaleString()} tint={CAMPAIGN_TYPES.in_app.tint} />
          <CampaignStat icon="mail" label="Tasa de apertura media" value={rate(totalOpened, totalReach)} tint={CAMPAIGN_TYPES.email.tint} />
          <CampaignStat icon="cursor" label="Tasa de clic media" value={rate(totalClicked, totalReach)} tint={CAMPAIGN_TYPES.push.tint} />
          <CampaignStat icon="clock" label="Activas / programadas" value={activeCount} tint={{ bg: "var(--neutral-200)", fg: "var(--color-text-secondary)" }} />
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 36, background: "var(--color-background)", borderRadius: 10, padding: "0 12px", minWidth: 200, flex: "0 1 240px" }}>
          <Icon name="search" size={16} style={{ color: "var(--color-text-tertiary)" }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar campañas…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-primary)" }} />
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {statusTabs.map(([id, label]) => (
            <button key={id} onClick={() => setStatusFilter(id)} className={"fobo-badge " + (statusFilter === id ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary-ink)]" : "bg-[var(--neutral-200)] text-[var(--color-text-secondary)]")} style={{ height: 30, padding: "0 12px", fontSize: 12, cursor: "pointer", border: "none" }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginLeft: 2 }}>
          <button onClick={() => setTypeFilter("all")} className={"fobo-badge " + (typeFilter === "all" ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary-ink)]" : "bg-[var(--neutral-200)] text-[var(--color-text-secondary)]")} style={{ height: 30, padding: "0 12px", fontSize: 12, cursor: "pointer", border: "none" }}>Todos los tipos</button>
          {CAMPAIGN_TYPE_ORDER.map((id) => (
            <button key={id} onClick={() => setTypeFilter(id)} title={CAMPAIGN_TYPES[id].label} style={chipBtn(typeFilter === id)}>
              <Icon name={CAMPAIGN_TYPES[id].icon} size={16} style={{ color: typeFilter === id ? "var(--color-primary-ink)" : "var(--color-text-secondary)" }} />
            </button>
          ))}
        </div>
      </div>

      {/* Column header */}
      <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, padding: "9px 20px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        {["Campaña", "Estado", "Audiencia", "Destinatarios", "Apertura", "Clics", ""].map((h, i) => (
          <div key={i} style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" }}>{h}</div>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", background: "var(--color-surface)" }}>
        {filtered.map((c) => (
          <CampaignRow key={c.id} c={c} onEdit={(cc) => setEditor({ campaign: cc })} onDuplicate={duplicate} onDelete={(cc) => setConfirm(cc)} onToggle={toggle} />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-tertiary)" }}>
            <div style={{ display: "inline-flex", width: 56, height: 56, borderRadius: 9999, background: "var(--neutral-100)", alignItems: "center", justifyContent: "center", marginBottom: 14 }}><Icon name="megaphone" size={26} style={{ color: "var(--color-text-tertiary)" }} /></div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-secondary)" }}>No hay campañas aquí</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Crea tu primer mensaje proactivo.</div>
          </div>
        )}
      </div>

      {editor && <CampaignEditor initial={editor.campaign} products={CATALOG_PRODUCTS} onClose={() => setEditor(null)} onSave={save} />}
      {confirm && <ConfirmModal title="¿Eliminar campaña?" message={`“${confirm.name}” se eliminará permanentemente.`} onClose={() => setConfirm(null)} onConfirm={() => del(confirm)} />}
    </div>
  );
}
