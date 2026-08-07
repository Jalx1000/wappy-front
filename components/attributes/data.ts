import type { IconName } from "@/components/ui/Icon";

// ── Field types ──────────────────────────────────────────────────────────────
export type FieldType =
  | "text" | "number" | "decimal" | "currency" | "percent" | "boolean"
  | "date" | "select" | "multiselect" | "email" | "phone" | "url";

export interface FieldTypeDef {
  id: FieldType;
  label: string;
  icon: IconName;
  hint: string;
  hasOptions?: boolean;
}

export const FIELD_TYPES: Record<FieldType, FieldTypeDef> = {
  text:        { id: "text",        label: "Texto",         icon: "type",         hint: "Una línea de texto" },
  number:      { id: "number",      label: "Número",        icon: "hash",         hint: "Números enteros" },
  decimal:     { id: "decimal",     label: "Decimal",       icon: "hash",         hint: "Números con decimales" },
  currency:    { id: "currency",    label: "Moneda",        icon: "dollar",       hint: "Importe monetario" },
  percent:     { id: "percent",     label: "Porcentaje",    icon: "percent",      hint: "0–100 con sufijo %" },
  boolean:     { id: "boolean",     label: "Sí / No",       icon: "toggleLeft",   hint: "Un interruptor sí/no" },
  date:        { id: "date",        label: "Fecha",         icon: "calendarDays", hint: "Una fecha de calendario" },
  select:      { id: "select",      label: "Desplegable",   icon: "chevronDown",  hint: "Elige uno de una lista", hasOptions: true },
  multiselect: { id: "multiselect", label: "Multi-selección", icon: "list",       hint: "Elige varios de una lista", hasOptions: true },
  email:       { id: "email",       label: "Email",         icon: "at",           hint: "Una dirección de correo" },
  phone:       { id: "phone",       label: "Teléfono",      icon: "phone",        hint: "Un número de teléfono" },
  url:         { id: "url",         label: "URL",           icon: "link",         hint: "Un enlace web" },
};

export const FIELD_TYPE_ORDER: FieldType[] = [
  "text", "number", "decimal", "currency", "percent", "boolean",
  "date", "select", "multiselect", "email", "phone", "url",
];

// ── Module presentation ──────────────────────────────────────────────────────
export type ModuleColor = "primary" | "success" | "warning" | "error" | "blue" | "pink";

export const MODULE_ICONS: IconName[] = [
  "layers", "database", "box", "briefcase", "cart", "building",
  "car", "home", "star", "heart", "ticket", "tag",
];

export const MODULE_COLORS: { id: ModuleColor; dot: string }[] = [
  { id: "primary", dot: "var(--color-primary)" },
  { id: "success", dot: "var(--color-success)" },
  { id: "warning", dot: "var(--color-warning)" },
  { id: "error",   dot: "var(--color-error)" },
  { id: "blue",    dot: "#0A7CFF" },
  { id: "pink",    dot: "#E1306C" },
];

export const colorTint: Record<ModuleColor, { bg: string; fg: string }> = {
  primary: { bg: "var(--color-primary-subtle)", fg: "var(--color-primary-ink)" },
  success: { bg: "var(--color-success-bg)",     fg: "var(--color-success-dark)" },
  warning: { bg: "var(--color-warning-bg)",     fg: "var(--color-warning)" },
  error:   { bg: "var(--color-error-bg)",       fg: "var(--color-error)" },
  blue:    { bg: "#E3F0FF",                      fg: "#0A5BD0" },
  pink:    { bg: "#FCE3EE",                      fg: "#C01E5B" },
};

// ── Data model types ─────────────────────────────────────────────────────────
export interface FieldDef {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  symbol?: string;
}

export type AttrValue = string | number | boolean | string[] | null | undefined;
export type AttrRecord = { id: string } & Record<string, AttrValue>;

export interface ModuleDef {
  id: string;
  name: string;
  icon: IconName;
  color: ModuleColor;
  system?: boolean;
  core?: boolean;
  titleKey?: string;
  description?: string;
  fields: FieldDef[];
  records: AttrRecord[];
}

// ── Value formatting for the records table ───────────────────────────────────
export function formatValue(field: FieldDef, v: AttrValue): string {
  if (v == null || v === "" || (Array.isArray(v) && v.length === 0)) return "—";
  switch (field.type) {
    case "currency":
      return (field.symbol || "$") + Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case "number":
      return Number(v).toLocaleString();
    case "decimal":
      return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 });
    case "percent":
      return v + "%";
    case "boolean":
      return v ? "Sí" : "No";
    case "multiselect":
      return Array.isArray(v) ? v.join(", ") : String(v);
    default:
      return String(v);
  }
}

export const slugify = (s: string): string =>
  s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field";

// ── Sample data model ────────────────────────────────────────────────────────
export const ATTR_MODULES: ModuleDef[] = [
  {
    id: "contacts", name: "Contactos", icon: "users", color: "primary", system: true,
    description: "Los perfiles de tus clientes. Los atributos personalizados aquí aparecen en cada ficha de contacto.",
    fields: [
      { id: "f_plan",  key: "plan",  label: "Plan",           type: "select",   options: ["Standard", "Premium", "Metal"], required: false },
      { id: "f_spend", key: "spend", label: "Gasto total",    type: "currency", symbol: "€", required: false },
      { id: "f_vip",   key: "vip",   label: "VIP",            type: "boolean",  required: false },
      { id: "f_nps",   key: "nps",   label: "NPS",            type: "number",   required: false },
      { id: "f_since", key: "since", label: "Cliente desde",  type: "date",     required: false },
    ],
    records: [
      { id: "r1", plan: "Metal",    spend: 3120.40, vip: true,  nps: 9, since: "2024-01-03" },
      { id: "r2", plan: "Premium",  spend: 842.10,  vip: false, nps: 7, since: "2024-05-12" },
      { id: "r3", plan: "Standard", spend: 210.00,  vip: false, nps: 8, since: "2025-06-02" },
    ],
  },
  {
    id: "products", name: "Productos", icon: "box", color: "warning", system: true, core: true, titleKey: "name",
    description: "Tu catálogo. Los atributos que añadas aquí aparecen automáticamente en cada formulario de producto.",
    fields: [
      { id: "pr_name",  key: "name",     label: "Nombre",    type: "text",     required: true },
      { id: "pr_sku",   key: "sku",      label: "SKU",       type: "text",     required: true },
      { id: "pr_price", key: "price",    label: "Precio",    type: "currency", symbol: "$", required: true },
      { id: "pr_cat",   key: "category", label: "Categoría", type: "select",   options: ["Electrónica", "Ropa", "Servicios", "Suscripciones"], required: true },
      { id: "pr_stock", key: "stock",    label: "Stock",     type: "number",   required: false },
      { id: "pr_active",key: "active",   label: "Activo",    type: "boolean",  required: false },
    ],
    records: [
      { id: "p1", name: "Wappy Pro Plan",       sku: "WPY-PRO",   price: 49.00,  category: "Suscripciones", stock: null, active: true },
      { id: "p2", name: "Starter Hardware Kit", sku: "KIT-001",   price: 129.00, category: "Electrónica",   stock: 240,  active: true },
      { id: "p3", name: "Camiseta de marca",    sku: "APP-TS-01", price: 25.00,  category: "Ropa",          stock: 1500, active: true },
      { id: "p4", name: "Servicio de onboarding", sku: "SVC-ONB", price: 300.00, category: "Servicios",     stock: null, active: false },
    ],
  },
  {
    id: "deals", name: "Oportunidades", icon: "briefcase", color: "success", system: false,
    description: "Oportunidades de venta ligadas a un contacto. Sigue el valor y la etapa por el pipeline.",
    fields: [
      { id: "d_title",  key: "title",  label: "Título",     type: "text",     required: true },
      { id: "d_amount", key: "amount", label: "Importe",    type: "currency", symbol: "$", required: true },
      { id: "d_stage",  key: "stage",  label: "Etapa",      type: "select",   options: ["Nuevo", "Calificado", "Propuesta", "Ganado", "Perdido"], required: true },
      { id: "d_prob",   key: "prob",   label: "Prob. cierre", type: "percent",  required: false },
      { id: "d_close",  key: "close",  label: "Fecha cierre", type: "date",     required: false },
      { id: "d_owner",  key: "owner",  label: "Responsable", type: "text",     required: false },
    ],
    records: [
      { id: "dr1", title: "Rediseño de web",   amount: 12000, stage: "Calificado", prob: 60, close: "2026-07-01", owner: "Tú" },
      { id: "dr2", title: "Upgrade plan anual", amount: 4800, stage: "Propuesta", prob: 75, close: "2026-06-20", owner: "Ana" },
      { id: "dr3", title: "Paquete onboarding", amount: 2400, stage: "Ganado", prob: 100, close: "2026-05-30", owner: "Tú" },
    ],
  },
  {
    id: "properties", name: "Propiedades", icon: "home", color: "blue", system: false,
    description: "Inmuebles gestionados para tus clientes, con precio y disponibilidad.",
    fields: [
      { id: "p_addr",  key: "addr",  label: "Dirección",     type: "text",     required: true },
      { id: "p_price", key: "price", label: "Precio",        type: "currency", symbol: "€", required: true },
      { id: "p_type",  key: "type",  label: "Tipo",          type: "select",   options: ["Piso", "Casa", "Oficina", "Terreno"], required: true },
      { id: "p_rooms", key: "rooms", label: "Habitaciones",  type: "number",   required: false },
      { id: "p_avail", key: "avail", label: "Disponible",    type: "boolean",  required: false },
    ],
    records: [
      { id: "pr1", addr: "12 Gran Vía, Madrid",   price: 420000,  type: "Piso",    rooms: 3, avail: true },
      { id: "pr2", addr: "8 Passeig de Gràcia",   price: 1250000, type: "Oficina", rooms: 6, avail: false },
    ],
  },
];
