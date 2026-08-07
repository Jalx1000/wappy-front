"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { uid } from "@/lib/id";
import { useAttributesStore } from "@/store/attributes";
import { FieldFormModal, RecordFormModal } from "@/components/attributes/AttributesModals";
import { formatValue, type AttrRecord, type AttrValue, type FieldDef, type ModuleDef } from "@/components/attributes/data";

const BASE_KEYS = ["name", "sku", "price", "category", "stock", "active"];

const catTint: Record<string, { bg: string; fg: string }> = {
  "Electrónica": { bg: "#E3F0FF", fg: "#0A5BD0" },
  "Ropa": { bg: "#FCE3EE", fg: "#C01E5B" },
  "Servicios": { bg: "var(--color-primary-subtle)", fg: "var(--color-primary-ink)" },
  "Suscripciones": { bg: "var(--color-success-bg)", fg: "var(--color-success-dark)" },
};
const defaultTint = { bg: "var(--neutral-100)", fg: "var(--color-text-secondary)" };
const miniBtn: CSSProperties = { width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };

/** Self-contained pill switch — inline styles so it renders regardless of the
 *  global .fobo-toggle class resolution inside this grid row. */
function PillToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label="Activo" onClick={onToggle}
      style={{ position: "relative", width: 38, height: 22, flex: "none", padding: 0, border: "none", borderRadius: 9999, cursor: "pointer",
        background: on ? "var(--color-primary)" : "var(--neutral-300)", transition: "background-color 150ms ease" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: 9999,
        background: on ? "var(--color-on-primary)" : "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.25)", transition: "left 160ms ease" }} />
    </button>
  );
}

function ProductRow({ p, extraFields, gridCols, onEdit, onDelete, onToggleActive }: {
  p: AttrRecord; extraFields: FieldDef[]; gridCols: string;
  onEdit: (p: AttrRecord) => void; onDelete: (p: AttrRecord) => void; onToggleActive: (p: AttrRecord) => void;
}) {
  const [hover, setHover] = useState(false);
  const category = typeof p.category === "string" ? p.category : "";
  const tint = catTint[category] || defaultTint;
  const price = p.price != null && p.price !== "" ? "$" + Number(p.price).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—";
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => onEdit(p)}
      style={{ display: "grid", gridTemplateColumns: gridCols, gap: 12, alignItems: "center",
        padding: "12px 20px", borderBottom: "1px solid var(--color-border)", cursor: "pointer", background: hover ? "var(--neutral-100)" : "transparent" }}>
      {/* thumb + name + sku */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <span style={{ width: 40, height: 40, borderRadius: 10, background: tint.bg, color: tint.fg, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon name="box" size={20} /></span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{typeof p.name === "string" && p.name ? p.name : "Sin título"}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>{typeof p.sku === "string" && p.sku ? p.sku : "—"}</div>
        </div>
      </div>
      {/* price */}
      <div className="tnum" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{price}</div>
      {/* category */}
      <div>{category ? <span className="fobo-badge" style={{ background: tint.bg, color: tint.fg }}>{category}</span> : "—"}</div>
      {/* stock */}
      <div className="tnum" style={{ fontSize: 13.5, color: "var(--color-text-secondary)" }}>{p.stock != null && p.stock !== "" ? Number(p.stock).toLocaleString() : "—"}</div>
      {/* active toggle */}
      <div onClick={(e) => e.stopPropagation()}>
        <PillToggle on={!!p.active} onToggle={() => onToggleActive(p)} />
      </div>
      {/* extra custom fields */}
      {extraFields.map((f) => (
        <div key={f.id} style={{ fontSize: 13, color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {f.type === "boolean" ? <Badge variant={p[f.key] ? "success" : "neutral"}>{p[f.key] ? "Sí" : "No"}</Badge> : formatValue(f, p[f.key])}
        </div>
      ))}
      {/* actions */}
      <div style={{ display: "flex", gap: 2, justifyContent: "flex-end", opacity: hover ? 1 : 0, transition: "opacity 120ms" }}>
        <button title="Editar" onClick={(e) => { e.stopPropagation(); onEdit(p); }} style={miniBtn}><Icon name="edit" size={16} /></button>
        <button title="Eliminar" onClick={(e) => { e.stopPropagation(); onDelete(p); }} style={{ ...miniBtn, color: "var(--color-error)" }}><Icon name="trash" size={16} /></button>
      </div>
    </div>
  );
}

type Modal =
  | { type: "record"; data?: AttrRecord }
  | { type: "field" }
  | { type: "confirm"; product: AttrRecord }
  | null;

export function CatalogView() {
  const { modules, setModules } = useAttributesStore();
  const toast = useToast();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Todas");
  const [modal, setModal] = useState<Modal>(null);

  const mod = modules.find((m) => m.id === "products") as ModuleDef | undefined;

  const extraFields = useMemo(() => (mod ? mod.fields.filter((f) => !BASE_KEYS.includes(f.key)) : []), [mod]);
  const categories = useMemo(() => {
    const opts = mod?.fields.find((f) => f.key === "category")?.options || [];
    return ["Todas", ...opts];
  }, [mod]);

  const products = useMemo(() => {
    if (!mod) return [];
    return mod.records.filter((p) => {
      if (cat !== "Todas" && p.category !== cat) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const name = typeof p.name === "string" ? p.name.toLowerCase() : "";
        const sku = typeof p.sku === "string" ? p.sku.toLowerCase() : "";
        return name.includes(q) || sku.includes(q);
      }
      return true;
    });
  }, [mod, query, cat]);

  if (!mod) {
    return <div style={{ padding: 40, color: "var(--color-text-tertiary)" }}>El módulo de productos no está disponible.</div>;
  }

  const gridCols = `2.4fr 1fr 1.1fr 0.8fr 0.8fr ${extraFields.map(() => "1fr").join(" ")} 80px`;

  // CRUD on the products module's records (shared Attributes data model)
  const saveProduct = (data: Record<string, AttrValue> & { id?: string }) => {
    setModules((prev) => prev.map((m) => {
      if (m.id !== "products") return m;
      if (data.id) return { ...m, records: m.records.map((r) => (r.id === data.id ? { ...r, ...data } as AttrRecord : r)) };
      return { ...m, records: [{ ...data, id: uid("prod_") } as AttrRecord, ...m.records] };
    }));
    toast(data.id ? "Producto guardado" : "Producto añadido"); setModal(null);
  };
  const deleteProduct = (p: AttrRecord) => {
    setModules((prev) => prev.map((m) => (m.id === "products" ? { ...m, records: m.records.filter((r) => r.id !== p.id) } : m)));
    setModal(null); toast("Producto eliminado");
  };
  const toggleActive = (p: AttrRecord) => {
    setModules((prev) => prev.map((m) => (m.id === "products" ? { ...m, records: m.records.map((r) => (r.id === p.id ? { ...r, active: !r.active } : r)) } : m)));
  };
  // create a custom attribute straight from the catalog
  const saveField = (data: FieldDef) => {
    setModules((prev) => prev.map((m) => (m.id === "products" ? { ...m, fields: [...m.fields, { ...data, id: uid("fld_") }] } : m)));
    toast("Atributo añadido a Productos"); setModal(null);
  };

  const activeCount = mod.records.filter((p) => p.active).length;

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--color-background)", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "18px 24px 0", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ paddingBottom: 12 }}><DemoBanner module="Catálogo" /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>Catálogo</h1>
          <Badge variant="neutral">{mod.records.length}</Badge>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{activeCount} activos</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex items-center gap-1" onClick={() => setModal({ type: "field" })}><Icon name="database" size={16} /> Añadir atributo</button>
            <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex items-center gap-1" onClick={() => router.push("/app/attributes")}><Icon name="settings" size={16} /> Gestionar campos</button>
            <button className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1" onClick={() => setModal({ type: "record" })}><Icon name="plus" size={16} /> Nuevo producto</button>
          </div>
        </div>
        {/* toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 38, background: "var(--color-background)", borderRadius: 10, padding: "0 12px", minWidth: 220, flex: "0 1 260px" }}>
            <Icon name="search" size={17} style={{ color: "var(--color-text-tertiary)" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar nombre o SKU…"
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-primary)" }} />
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={"fobo-badge " + (cat === c ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary-ink)]" : "bg-[var(--neutral-200)] text-[var(--color-text-secondary)]")}
                style={{ height: 30, padding: "0 12px", fontSize: 12, cursor: "pointer", border: "none" }}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Column header */}
      <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 12, padding: "9px 20px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        {["Producto", "Precio", "Categoría", "Stock", "Activo", ...extraFields.map((f) => f.label), ""].map((h, i) => (
          <div key={i} style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" }}>{h}</div>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", background: "var(--color-surface)" }}>
        {products.map((p) => (
          <ProductRow key={p.id} p={p} extraFields={extraFields} gridCols={gridCols}
            onEdit={(pp) => setModal({ type: "record", data: pp })} onDelete={(pp) => setModal({ type: "confirm", product: pp })} onToggleActive={toggleActive} />
        ))}
        {products.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0", color: "var(--color-text-tertiary)" }}>
            <div style={{ display: "inline-flex", width: 56, height: 56, borderRadius: 9999, background: "var(--neutral-100)", alignItems: "center", justifyContent: "center", marginBottom: 14 }}><Icon name="box" size={26} style={{ color: "var(--color-text-tertiary)" }} /></div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-secondary)" }}>No se encontraron productos</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Prueba otra búsqueda o añade un producto.</div>
          </div>
        )}
      </div>

      {/* Modals — reuse the Attributes modals (dynamic from the products schema) */}
      {modal?.type === "record" && <RecordFormModal module={mod} initial={modal.data} onClose={() => setModal(null)} onSave={saveProduct} />}
      {modal?.type === "field" && <FieldFormModal onClose={() => setModal(null)} onSave={saveField} />}
      {modal?.type === "confirm" && <ConfirmModal title="¿Eliminar producto?" message={`«${typeof modal.product.name === "string" ? modal.product.name : "Producto"}» se eliminará permanentemente de tu catálogo.`} onClose={() => setModal(null)} onConfirm={() => deleteProduct(modal.product)} />}
    </div>
  );
}
