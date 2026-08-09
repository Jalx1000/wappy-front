"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/ui/Icon";
import { useUIStore } from "@/store/ui";
import { useAttributesStore } from "@/store/attributes";
import { useBrands } from "@/lib/hooks";
import { contactsApi } from "@/lib/api/contacts";
import { socialInboxApi } from "@/lib/api/socialInbox";
import { useHelpCenterStore } from "@/store/help-center";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";

// ── Command definitions ────────────────────────────────────────────────────────
type Cmd = {
  id: string;
  label: string;
  sub?: string;
  icon: string;
  href?: string;
  action?: () => void;
  section: string;
};

const NAV_CMDS: Omit<Cmd, "section">[] = [
  { id: "dashboard",    label: "Dashboard",         icon: "grid",      href: "/app" },
  { id: "brands",       label: "Marcas",             icon: "brands",    href: "/app/brands" },
  { id: "connections",  label: "Conexiones",         icon: "plug",      href: "/app/connections" },
  { id: "social",       label: "Social Analytics",   icon: "chart",     href: "/app/analytics/social" },
  { id: "web",          label: "Web (GA4)",           icon: "globe",     href: "/app/analytics/web" },
  { id: "ads",          label: "Paid Media / Ads",   icon: "megaphone", href: "/app/analytics/ads" },
  { id: "reports",      label: "Reportes",           icon: "file",      href: "/app/reports" },
  { id: "support-analytics", label: "Analytics de soporte", icon: "spark", href: "/app/analytics/support" },
  { id: "scheduled-reports", label: "Reportes programados", icon: "clock", href: "/app/reports/scheduled" },
  { id: "calendar",     label: "Calendario",         icon: "calendar",  href: "/app/calendar" },
  { id: "approvals",    label: "Aprobaciones",       icon: "check",     href: "/app/approvals" },
  { id: "posts",        label: "Publicaciones",      icon: "layers",    href: "/app/posts" },
  { id: "campaigns",    label: "Campañas",           icon: "target",    href: "/app/campaigns" },
  { id: "influencers",  label: "Influencers",        icon: "star",      href: "/app/influencers" },
  { id: "inbox",        label: "Bandeja Social",     icon: "inbox",     href: "/app/inbox" },
  { id: "team-inbox",   label: "Bandeja de equipo",  icon: "board",     href: "/app/team-inbox" },
  { id: "contacts",     label: "Contactos",          icon: "users",     href: "/app/contacts" },
  { id: "companies",    label: "Empresas",           icon: "building",  href: "/app/companies" },
  { id: "tags",         label: "Etiquetas",          icon: "tag",       href: "/app/tags" },
  { id: "attributes",   label: "Atributos",          icon: "database",  href: "/app/attributes" },
  { id: "help-center",  label: "Centro de ayuda",    icon: "book",      href: "/app/help-center" },
  { id: "bot-builder",  label: "Bot Builder",        icon: "bot",       href: "/app/bot-builder" },
  { id: "automations",  label: "Automatizaciones",   icon: "zap",       href: "/app/automations" },
  { id: "broadcasts",   label: "Mensajes proactivos", icon: "megaphone", href: "/app/broadcasts" },
  { id: "integrations", label: "Integraciones",      icon: "plug",      href: "/app/integrations" },
  { id: "requests",     label: "Solicitudes",        icon: "ticket",    href: "/app/requests" },
  { id: "insights",     label: "Insights AI",        icon: "spark",     href: "/app/insights" },
  { id: "settings",     label: "Configuración",      icon: "settings",  href: "/app/settings" },
  { id: "support-settings", label: "Ajustes de soporte", icon: "building", href: "/app/settings/support" },
  { id: "profile",      label: "Mi perfil",          icon: "user",      href: "/app/profile" },
];

const ACTION_CMDS: Omit<Cmd, "section">[] = [
  { id: "new-post",       label: "Nueva publicación",     icon: "plus",     href: "/app/posts" },
  { id: "new-report",     label: "Generar reporte",       icon: "file",     href: "/app/reports" },
  { id: "new-request",    label: "Nueva solicitud",       icon: "ticket",   href: "/app/requests" },
  { id: "new-tag",        label: "Nueva etiqueta",        icon: "tag",      href: "/app/tags" },
  { id: "new-automation", label: "Nueva automatización",  icon: "zap",      href: "/app/automations" },
  { id: "new-article",    label: "Nuevo artículo",        icon: "fileText", href: "/app/help-center" },
  { id: "new-campaign",   label: "Nueva campaña",         icon: "megaphone", href: "/app/broadcasts" },
  { id: "new-product",    label: "Nuevo producto",        icon: "box",      href: "/app/products" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function matches(cmd: Cmd, q: string) {
  const n = normalize(q);
  return normalize(cmd.label).includes(n) || normalize(cmd.sub ?? "").includes(n) || normalize(cmd.section).includes(n);
}

// ── Item component ─────────────────────────────────────────────────────────────
function CmdItem({
  cmd,
  active,
  onSelect,
  onHover,
}: {
  cmd: Cmd;
  active: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  return (
    <button
      onMouseEnter={onHover}
      onClick={onSelect}
      className="w-full flex items-center gap-3 px-4 py-[10px] text-left border-none cursor-pointer transition-colors"
      style={{
        background: active ? "var(--color-primary-subtle)" : "transparent",
        color: active ? "var(--color-primary-ink)" : "var(--color-text-primary)",
        fontFamily: "var(--ff-ui)",
      }}
    >
      <span
        className="flex items-center justify-center w-[30px] h-[30px] rounded-[8px] flex-none"
        style={{
          background: active ? "var(--color-primary)" : "var(--color-background)",
          color: active ? "#fff" : "var(--color-text-secondary)",
        }}
      >
        <Icon name={cmd.icon as Parameters<typeof Icon>[0]["name"]} size={15} strokeWidth={1.8} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="text-[13.5px] font-medium block truncate">{cmd.label}</span>
        {cmd.sub && (
          <span className="text-[11.5px] block truncate" style={{ color: "var(--color-text-tertiary)" }}>
            {cmd.sub}
          </span>
        )}
      </span>
      {active && (
        <span
          className="text-[11px] font-medium px-[6px] py-[2px] rounded-[5px] flex-none"
          style={{ background: "var(--color-primary)", color: "#fff" }}
        >
          ↵
        </span>
      )}
    </button>
  );
}

// ── Main palette ───────────────────────────────────────────────────────────────
export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveBrand, activeBrand } = useUIStore();
  const { data: brands = BRANDS_FALLBACK } = useBrands();

  // Cross-module search sources. Contacts/conversations are prefetched only
  // while the palette is open; help articles come from the client store.
  const brandId = activeBrand?.id;
  const articles = useHelpCenterStore((s) => s.articles);
  const customModules = useAttributesStore((s) => s.modules).filter((m) => !m.system);
  const { data: contactsPage } = useQuery({
    queryKey: ["contacts", "list", brandId, ""],
    queryFn: () => contactsApi.list({ limit: 50 }),
    enabled: commandPaletteOpen && !!brandId,
  });
  const { data: convos = [] } = useQuery({
    queryKey: ["social-inbox", "conversations", brandId],
    queryFn: () => socialInboxApi.getConversations({}),
    enabled: commandPaletteOpen && !!brandId,
  });

  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevQuery, setPrevQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset the highlighted row when the query changes (during render, not an effect).
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIdx(0);
  }

  const close = useCallback(() => {
    setCommandPaletteOpen(false);
    setQuery("");
    setActiveIdx(0);
  }, [setCommandPaletteOpen]);

  // Build full command list (including dynamic brand items)
  const brandCmds: Cmd[] = brands.map((b) => ({
    id: `brand-${b.id}`,
    label: b.name,
    sub: b.industry,
    icon: "brands",
    section: "Marcas",
    action: () => {
      setActiveBrand(b);
      close();
    },
  }));

  // Dynamic result commands — only added while there's a query so the empty
  // palette stays short.
  const articleCmds: Cmd[] = articles.map((a) => ({
    id: `art-${a.id}`, label: a.title, sub: a.excerpt, icon: "fileText", section: "Artículos", href: "/app/help-center",
  }));
  const contactCmds: Cmd[] = (contactsPage?.data || []).map((c) => ({
    id: `ct-${c.contact.id}`,
    label: c.contact.displayName || c.contact.phone || "Contacto",
    sub: c.contact.phone || c.contact.email || undefined,
    icon: "user", section: "Contactos", href: `/app/contacts?id=${c.contact.id}`,
  }));
  const convoCmds: Cmd[] = convos.map((c) => ({
    id: `cv-${c.id}`,
    label: c.contact?.displayName || c.peer,
    sub: `Conversación · ${c.accountHandle || c.channel}`,
    icon: "inbox", section: "Conversaciones",
    href: c.contact?.id ? `/app/inbox?contact=${c.contact.id}` : "/app/inbox",
  }));

  // Módulos personalizados (custom objects) → navegables desde ⌘K.
  const moduleCmds: Cmd[] = customModules.map((m) => ({
    id: `mod-${m.id}`,
    label: m.name,
    sub: "Módulo",
    icon: m.icon,
    section: "Módulos",
    href: `/app/objects/${m.id}`,
  }));

  const allCmds: Cmd[] = [
    ...NAV_CMDS.map((c) => ({ ...c, section: "Navegar" })),
    ...moduleCmds,
    ...brandCmds,
    ...ACTION_CMDS.map((c) => ({ ...c, section: "Acciones rápidas" })),
    ...(query.trim() ? [...contactCmds, ...convoCmds, ...articleCmds] : []),
  ];

  const filtered = query.trim() ? allCmds.filter((c) => matches(c, query)) : allCmds;

  // Group by section
  const sections = filtered.reduce<Record<string, Cmd[]>>((acc, cmd) => {
    (acc[cmd.section] ||= []).push(cmd);
    return acc;
  }, {});

  // Flat index for keyboard nav
  const flat = filtered;

  const selectCmd = useCallback(
    (cmd: Cmd) => {
      if (cmd.action) {
        cmd.action();
      } else if (cmd.href) {
        router.push(cmd.href);
        close();
      }
    },
    [router, close]
  );

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, flat.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const cmd = flat[activeIdx];
        if (cmd) selectCmd(cmd);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, flat, activeIdx, close, selectCmd]);

  // Track flat index per section for active-state mapping
  let globalIdx = 0;

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          key="palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]"
          style={{ backdropFilter: "blur(4px)", background: "var(--color-overlay-scrim)" }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <motion.div
            key="palette-panel"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
            className="w-full max-w-[560px] mx-4 rounded-[16px] overflow-hidden shadow-2xl"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            {/* Search input */}
            <div
              className="flex items-center gap-3 px-4 py-[14px]"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <Icon name="search" size={18} style={{ color: "var(--color-text-tertiary)", flex: "none" }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar páginas, marcas, acciones…"
                className="flex-1 border-none outline-none bg-transparent text-[14px]"
                style={{
                  fontFamily: "var(--ff-ui)",
                  color: "var(--color-text-primary)",
                }}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="flex-none border-none bg-transparent cursor-pointer p-1 rounded-[6px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <Icon name="x" size={14} />
                </button>
              )}
              <kbd
                className="flex-none text-[11px] font-medium px-[7px] py-[3px] rounded-[6px]"
                style={{
                  fontFamily: "var(--ff-mono)",
                  background: "var(--color-background)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="overflow-y-auto" style={{ maxHeight: "min(420px, 55vh)" }}>
              {flat.length === 0 ? (
                <div
                  className="py-12 text-center text-[13.5px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Sin resultados para &ldquo;{query}&rdquo;
                </div>
              ) : (
                Object.entries(sections).map(([section, cmds]) => (
                  <div key={section}>
                    <div
                      className="px-4 pt-[14px] pb-[6px] text-[10.5px] font-bold tracking-wider uppercase"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {section}
                    </div>
                    {cmds.map((cmd) => {
                      const idx = globalIdx++;
                      return (
                        <CmdItem
                          key={cmd.id}
                          cmd={cmd}
                          active={idx === activeIdx}
                          onHover={() => setActiveIdx(idx)}
                          onSelect={() => selectCmd(cmd)}
                        />
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div
              className="flex items-center gap-4 px-4 py-[10px] text-[11px]"
              style={{
                borderTop: "1px solid var(--color-border)",
                color: "var(--color-text-tertiary)",
                fontFamily: "var(--ff-ui)",
              }}
            >
              <span className="flex items-center gap-1">
                <kbd className="font-mono px-[5px] py-[2px] rounded-[4px]" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}>↑↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono px-[5px] py-[2px] rounded-[4px]" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}>↵</kbd>
                abrir
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono px-[5px] py-[2px] rounded-[4px]" style={{ background: "var(--color-background)", border: "1px solid var(--color-border)" }}>ESC</kbd>
                cerrar
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
