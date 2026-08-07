"use client";

import { useTheme } from "next-themes";
import { BrandSwitcher } from "./BrandSwitcher";
import { Icon } from "@/components/ui/Icon";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useUIStore } from "@/store/ui";

export function Topbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { setCommandPaletteOpen } = useUIStore();

  return (
    <div
      className="flex items-center gap-[14px] px-[22px] flex-none h-[62px] z-20 print:hidden"
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <BrandSwitcher />

      {/* Search → opens Command Palette */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-[9px] h-[40px] px-3 rounded-[10px] w-[280px] cursor-pointer border-none text-left transition-colors"
        style={{ background: "var(--color-background)", fontFamily: "var(--ff-ui)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "var(--neutral-200)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "var(--color-background)")
        }
        title="Abrir búsqueda (⌘K)"
      >
        <Icon name="search" size={17} style={{ color: "var(--color-text-tertiary)", flex: "none" }} />
        <span
          className="flex-1 text-[13px] truncate"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Buscar marcas, reportes… ⌘K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="flex items-center justify-center w-[40px] h-[40px] rounded-[10px] border-none cursor-pointer transition-colors"
          style={{
            background: "transparent",
            color: "var(--color-text-secondary)",
          }}
          title="Cambiar tema"
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "var(--neutral-100)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
          }
        >
          <Icon name={resolvedTheme === "dark" ? "sun" : "moon"} size={19} />
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Quick export CTA */}
        <button
          className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-[6px] ml-1"
        >
          <Icon name="download" size={15} />
          Reporte
        </button>
      </div>
    </div>
  );
}
