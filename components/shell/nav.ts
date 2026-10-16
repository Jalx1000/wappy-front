import type { IconName } from "@/components/ui/Icon";

/**
 * Workspaces split the platform into two product areas that share the same
 * codebase. The active workspace filters which nav modules the sidebar shows;
 * users can further customize visibility/order per workspace in Settings.
 */
export type WorkspaceId = "crm" | "ads";

export const WORKSPACES: { id: WorkspaceId; label: string; icon: IconName; blurb: string }[] = [
  { id: "crm", label: "CRM", icon: "users", blurb: "Clientes y soporte" },
  { id: "ads", label: "Pautas", icon: "megaphone", blurb: "Publicidad en redes" },
];

export type NavItem = {
  id: string;
  label: string;
  icon: IconName;
  href: string;
  /** Workspaces this module belongs to. Items in both are "shared". */
  ws: WorkspaceId[];
  badge?: number;
};

export type NavSection = {
  section: string;
  items: NavItem[];
};

const BOTH: WorkspaceId[] = ["crm", "ads"];

export const NAV: NavSection[] = [
  {
    section: "Operación",
    items: [
      { id: "dashboard",   label: "Dashboard",   icon: "grid",   href: "/app",            ws: BOTH },
      { id: "brands",      label: "Marcas",       icon: "brands", href: "/app/brands",      ws: BOTH },
      { id: "connections", label: "Conexiones",   icon: "plug",   href: "/app/connections", ws: BOTH },
    ],
  },
  {
    section: "Analítica",
    items: [
      { id: "support-analytics", label: "Analytics soporte",     icon: "spark",     href: "/app/analytics/support", ws: ["crm"] },
      { id: "social",            label: "Social Analytics",       icon: "chart",     href: "/app/analytics/social",  ws: ["ads"] },
      { id: "web",               label: "Web (GA4)",              icon: "globe",     href: "/app/analytics/web",     ws: ["ads"] },
      { id: "ads",               label: "Paid Media / Ads",       icon: "megaphone", href: "/app/analytics/ads",     ws: ["ads"] },
      { id: "reports",           label: "Reportes",               icon: "file",      href: "/app/reports",           ws: ["ads"] },
      { id: "scheduled-reports", label: "Reportes programados",   icon: "clock",     href: "/app/reports/scheduled", ws: ["ads"] },
    ],
  },
  {
    section: "Contenido",
    items: [
      { id: "calendar",    label: "Calendario",   icon: "calendar", href: "/app/calendar",    ws: ["ads"] },
      { id: "assets",      label: "Artes (DAM)",  icon: "image",    href: "/app/assets",      ws: ["ads"] },
      { id: "approvals",   label: "Aprobaciones", icon: "check",    href: "/app/approvals",   ws: ["ads"], badge: 3 },
      { id: "campaigns",   label: "Campañas",     icon: "target",   href: "/app/campaigns",   ws: ["ads"] },
      { id: "influencers", label: "Influencers",  icon: "star",     href: "/app/influencers", ws: ["ads"] },
    ],
  },
  {
    section: "Colaboración",
    items: [
      { id: "inbox",       label: "Bandeja Social",     icon: "inbox",    href: "/app/inbox",       ws: ["crm"] },
      { id: "team-inbox",  label: "Bandeja de equipo",  icon: "board",    href: "/app/team-inbox",  ws: ["crm"] },
      { id: "contacts",    label: "Contactos",          icon: "users",    href: "/app/contacts",    ws: ["crm"] },
      { id: "companies",   label: "Empresas",           icon: "building", href: "/app/companies",   ws: ["crm"] },
      { id: "tags",        label: "Etiquetas",          icon: "tag",      href: "/app/tags",        ws: ["crm"] },
      { id: "help-center", label: "Centro de ayuda",    icon: "book",     href: "/app/help-center", ws: ["crm"] },
      { id: "requests",    label: "Solicitudes",        icon: "ticket",   href: "/app/requests",    ws: ["crm"] },
      { id: "insights",    label: "Insights AI",        icon: "spark",    href: "/app/insights",    ws: ["crm"] },
    ],
  },
  {
    section: "Automatización",
    items: [
      { id: "agents",           label: "Agentes IA",         icon: "spark",     href: "/app/agents",           ws: ["crm"] },
      { id: "bot-builder",      label: "Bot Builder",        icon: "bot",       href: "/app/bot-builder",      ws: ["crm"] },
      { id: "automations",      label: "Automatizaciones",   icon: "zap",       href: "/app/automations",      ws: ["crm"] },
      { id: "broadcasts",       label: "Mensajes proactivos",icon: "megaphone", href: "/app/broadcasts",       ws: ["crm"] },
      { id: "integrations",     label: "Integraciones",      icon: "plug",      href: "/app/integrations",     ws: BOTH },
      { id: "support-settings", label: "Ajustes de soporte", icon: "building",  href: "/app/settings/support", ws: ["crm"] },
    ],
  },
  {
    section: "Venta",
    items: [
      { id: "products",   label: "Productos", icon: "products", href: "/app/products",   ws: ["crm"] },
      { id: "attributes", label: "Atributos", icon: "database", href: "/app/attributes", ws: ["crm"] },
    ],
  },
];

/** Sections (with their items) that belong to the given workspace. */
export function navForWorkspace(ws: WorkspaceId): NavSection[] {
  return NAV.map((group) => ({
    ...group,
    items: group.items.filter((it) => it.ws.includes(ws)),
  })).filter((group) => group.items.length > 0);
}
