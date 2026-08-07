"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { useNotificationsStore } from "@/store/notifications";
import { NOTIF_ICON, type NotifItem } from "./data";

function NotifRow({ n, onOpen }: { n: NotifItem; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      className="flex gap-[11px] cursor-pointer"
      style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", background: n.read ? "transparent" : "var(--color-primary-subtle)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = n.read ? "var(--neutral-100)" : "var(--color-primary-subtle)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? "transparent" : "var(--color-primary-subtle)")}
    >
      {n.who ? (
        <span className="flex items-center justify-center rounded-full flex-none relative" style={{ width: 36, height: 36, fontSize: 12, fontWeight: 700, background: n.tint?.[0], color: n.tint?.[1] }}>
          {n.who}
          <span className="absolute flex items-center justify-center rounded-full" style={{ bottom: -2, right: -2, width: 17, height: 17, background: "var(--color-surface)" }}>
            <Icon name={NOTIF_ICON[n.type]} size={10} style={{ color: "var(--color-text-secondary)" }} />
          </span>
        </span>
      ) : (
        <span className="flex items-center justify-center rounded-full flex-none" style={{ width: 36, height: 36, background: "var(--neutral-100)", color: "var(--color-text-secondary)" }}>
          <Icon name={n.icon || NOTIF_ICON[n.type]} size={17} />
        </span>
      )}
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{n.title}</div>
        <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.4, marginTop: 1 }}>{n.body}</div>
        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 3 }}>{n.time}</div>
      </div>
      {!n.read && <span className="rounded-full flex-none" style={{ width: 8, height: 8, background: "var(--color-primary)", marginTop: 6 }} />}
    </div>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const { items, setItems } = useNotificationsStore();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unread = items.filter((n) => !n.read).length;
  const shown = filter === "unread" ? items.filter((n) => !n.read) : items;
  const markAll = () => setItems((p) => p.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) => setItems((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notificaciones"
        title="Notificaciones"
        className="relative flex items-center justify-center w-[40px] h-[40px] rounded-[10px] border-none cursor-pointer transition-colors"
        style={{ background: open ? "var(--color-primary-subtle)" : "transparent", color: open ? "var(--color-primary-ink)" : "var(--color-text-secondary)" }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = "var(--neutral-100)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "transparent"; }}
      >
        <Icon name="bell" size={19} />
        {unread > 0 && (
          <span className="absolute flex items-center justify-center rounded-full" style={{ top: 2, right: 2, minWidth: 16, height: 16, padding: "0 4px", background: "var(--color-error)", color: "#fff", fontSize: 10, fontWeight: 700, border: "2px solid var(--color-surface)" }}>
            {unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div onMouseDown={() => setOpen(false)} className="fixed inset-0 z-[90]" />
          <div
            className="absolute z-[91] flex flex-col overflow-hidden"
            style={{ top: "calc(100% + 8px)", right: 0, width: 380, maxHeight: "70vh", background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-3)", animation: "fadeUp .16s var(--ease-spring)" }}
          >
            <div className="flex items-center gap-2.5" style={{ padding: "14px 16px 10px" }}>
              <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)", letterSpacing: "-0.01em", color: "var(--color-text-primary)" }}>Notificaciones</span>
              {unread > 0 && <Badge variant="primary">{unread} nuevas</Badge>}
              <button onClick={markAll} className="ml-auto border-none bg-transparent cursor-pointer" style={{ color: "var(--color-primary-ink)", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-ui)" }}>Marcar todo</button>
            </div>
            <div className="flex gap-1" style={{ padding: "0 14px 10px", borderBottom: "1px solid var(--color-border)" }}>
              {([["all", "Todas"], ["unread", "No leídas"]] as const).map(([id, lbl]) => (
                <button key={id} onClick={() => setFilter(id)} className="cursor-pointer border-none rounded-full"
                  style={{ height: 28, padding: "0 12px", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-ui)",
                    background: filter === id ? "var(--color-primary-subtle)" : "var(--neutral-200)", color: filter === id ? "var(--color-primary-ink)" : "var(--color-text-secondary)" }}>{lbl}</button>
              ))}
            </div>
            <div className="overflow-y-auto flex-1">
              {shown.length === 0 && <div className="text-center" style={{ padding: "40px 0", color: "var(--color-text-tertiary)", fontSize: 13 }}>Estás al día 🎉</div>}
              {shown.map((n) => (
                <NotifRow key={n.id} n={n} onOpen={() => { markOne(n.id); setOpen(false); router.push("/app/inbox"); }} />
              ))}
            </div>
            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
              <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Preferencias en <b style={{ color: "var(--color-text-secondary)" }}>Configuración</b></span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
