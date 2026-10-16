"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/ui/Icon";
import { WappyLogo } from "@/components/shell/WappyLogo";
import { useUIStore } from "@/store/ui";
import { useAttributesStore } from "@/store/attributes";
import { useMe } from "@/lib/hooks";
import { socialInboxApi } from "@/lib/api/socialInbox";
import { cn } from "@/lib/utils";
import { sidebarSections } from "@/components/shell/nav";
import { WorkspaceSwitcher } from "@/components/shell/WorkspaceSwitcher";

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, activeBrand, activeWorkspace, workspacePrefs } =
    useUIStore();
  const sections = sidebarSections(activeWorkspace, workspacePrefs[activeWorkspace]);

  // Módulos personalizados (custom objects) creados en Atributos → nav dinámico.
  const modules = useAttributesStore((s) => s.modules);
  const customModules = modules.filter((m) => !m.system);

  // Live Inbox count — shares the same query cache as the inbox view.
  const brandId = activeBrand?.id;
  const { data: convos = [] } = useQuery({
    queryKey: ["social-inbox", "conversations", brandId],
    queryFn: () => socialInboxApi.getConversations({}),
    enabled: !!brandId,
  });
  const inboxCount = convos.length;

  const width = sidebarCollapsed ? 68 : 248;

  return (
    <motion.nav
      animate={{ width }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="flex-none flex flex-col h-full overflow-hidden print:hidden"
      style={{
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center gap-[10px] px-5 py-[18px] flex-none">
        <WappyLogo collapsed={sidebarCollapsed} />
        {!sidebarCollapsed && (
          <span
            className="ml-auto text-[10px] font-bold rounded-[5px] px-[6px] py-[2px]"
            style={{
              color: "var(--color-primary-ink)",
              background: "var(--color-primary-subtle)",
              letterSpacing: "0.07em",
            }}
          >
            AGENCY
          </span>
        )}
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Expandir sidebar (⌘B)" : "Colapsar sidebar (⌘B)"}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-[7px] border-none cursor-pointer transition-colors",
            sidebarCollapsed ? "mx-auto" : "ml-auto"
          )}
          style={{
            background: "transparent",
            color: "var(--color-text-tertiary)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--neutral-100)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <Icon name={sidebarCollapsed ? "chevronR" : "chevronL"} size={15} strokeWidth={2} />
        </button>
      </div>

      {/* Workspace switcher (CRM ↔ Pautas) */}
      <div className="px-[12px] pb-2 flex-none">
        <WorkspaceSwitcher collapsed={sidebarCollapsed} />
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-[12px] pb-4" style={{ scrollbarWidth: "none" }}>
        {sections.map((group) => (
          <div key={group.section || "all"} className="mb-[14px]">
            {!sidebarCollapsed && group.section && (
              <div
                className="text-[10.5px] font-bold uppercase px-[10px] pb-[6px] pt-1"
                style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}
              >
                {group.section}
              </div>
            )}
            {group.items.map((item) => {
              const isActive =
                item.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(item.href);
              const badge = item.id === "inbox" ? (inboxCount || undefined) : item.badge;
              return (
                <Link key={item.id} href={item.href} className="block mb-[1px]">
                  <span
                    className={cn("fobo-nav-item", isActive && "active")}
                    style={sidebarCollapsed ? { justifyContent: "center", padding: "0 0" } : {}}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      strokeWidth={isActive ? 2 : 1.8}
                      className="flex-shrink-0"
                    />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {badge && (
                          <span
                            className="text-[11px] font-bold rounded-full min-w-[18px] h-[18px] px-[5px] flex items-center justify-center"
                            style={{
                              // On the solid black/white active row the badge
                              // inverts so it stays visible; inactive rows keep
                              // the lime accent with dark text.
                              background: isActive
                                ? "var(--color-on-primary)"
                                : "var(--color-secondary)",
                              color: isActive ? "var(--color-primary)" : "#0E1300",
                            }}
                          >
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Módulos personalizados (dinámico, desde el store de Atributos) */}
        {customModules.length > 0 && (
          <div className="mb-[14px]">
            {!sidebarCollapsed && (
              <div
                className="text-[10.5px] font-bold uppercase px-[10px] pb-[6px] pt-1"
                style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}
              >
                Módulos
              </div>
            )}
            {customModules.map((m) => {
              const href = `/app/objects/${m.id}`;
              const isActive = pathname.startsWith(href);
              return (
                <Link key={m.id} href={href} className="block mb-[1px]">
                  <span
                    className={cn("fobo-nav-item", isActive && "active")}
                    style={sidebarCollapsed ? { justifyContent: "center", padding: "0 0" } : {}}
                    title={sidebarCollapsed ? m.name : undefined}
                  >
                    <Icon
                      name={m.icon}
                      size={18}
                      strokeWidth={isActive ? 2 : 1.8}
                      className="flex-shrink-0"
                    />
                    {!sidebarCollapsed && <span className="flex-1 truncate">{m.name}</span>}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer: settings + user */}
      <div
        className="flex-none px-3 pb-3 pt-2"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <Link href="/app/settings" className="block mb-1">
          <span
            className={cn(
              "fobo-nav-item",
              pathname.startsWith("/app/settings") && "active"
            )}
            style={sidebarCollapsed ? { justifyContent: "center" } : {}}
            title={sidebarCollapsed ? "Configuración" : undefined}
          >
            <Icon name="settings" size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>Configuración</span>}
          </span>
        </Link>
        <SidebarUser collapsed={sidebarCollapsed} onLogout={onLogout} />
      </div>
    </motion.nav>
  );
}

function SidebarUser({
  collapsed,
  onLogout,
}: {
  collapsed: boolean;
  onLogout?: () => void;
}) {
  const { data: me } = useMe();
  const fullName =
    [me?.firstName, me?.lastName].filter(Boolean).join(" ").trim() ||
    me?.email ||
    "Mi cuenta";
  const roleName = me?.role?.name ?? "";
  const initials =
    ((me?.firstName?.[0] ?? "") + (me?.lastName?.[0] ?? "")).toUpperCase() ||
    (me?.email?.[0] ?? "U").toUpperCase();
  return (
    <div
      className="flex items-center gap-[10px] px-[10px] py-2 rounded-[9px] mt-1"
      style={{ background: "transparent" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--color-background)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Link
        href="/app/profile"
        title="Mi perfil"
        className="flex items-center gap-[10px] flex-1 min-w-0 cursor-pointer"
        style={{ color: "inherit" }}
      >
        <span
          className="flex items-center justify-center text-[12px] font-bold rounded-full flex-shrink-0"
          style={{
            width: 32,
            height: 32,
            background: "var(--color-secondary-subtle)",
            color: "var(--color-secondary-ink)",
          }}
        >
          {initials}
        </span>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div
              className="text-[13px] font-semibold truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              {fullName}
            </div>
            {roleName && (
              <div className="text-[11px] capitalize" style={{ color: "var(--color-text-tertiary)" }}>
                {roleName}
              </div>
            )}
          </div>
        )}
      </Link>
      {!collapsed && (
        <>
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-[7px] border-none cursor-pointer transition-colors"
            style={{ background: "transparent", color: "var(--color-text-tertiary)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-error-bg)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
            }
          >
            <Icon name="logout" size={15} />
          </button>
        </>
      )}
    </div>
  );
}
