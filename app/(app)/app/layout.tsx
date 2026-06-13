"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { ToastProvider } from "@/components/ui/Toast";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { useUIStore } from "@/store/ui";

function AppShell({ children }: { children: React.ReactNode }) {
  const { toggleSidebar, setCommandPaletteOpen } = useUIStore();
  const [hydrated, setHydrated] = useState(false);

  // Hidratar zustand persist solo después del mount → evita el hydration
  // mismatch (React error #418) entre SSR y client. El store está marcado
  // como `skipHydration: true` para que NO se lea localStorage en el primer
  // render del cliente.
  useEffect(() => {
    void useUIStore.persist.rehydrate();
    setHydrated(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSidebar, setCommandPaletteOpen]);

  // Antes de hidratar el store, no rendereamos el shell — los componentes
  // hijos asumen que activeBrand y demás ya están cargados de localStorage.
  if (!hydrated) return null;

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--color-background)" }}
    >
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
