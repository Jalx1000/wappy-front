"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import {
  AGENTS, TEAM_CONVOS, CHANNEL_COLOR, STATUS_VARIANT, type TeamConvo,
} from "./data";

interface Column {
  id: string;
  name: string;
  online: boolean | null;
  tint: [string, string];
  role?: string;
}

function ConvoCard({ c, onOpen }: { c: TeamConvo; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      className="cursor-pointer"
      style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid var(--color-border)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div className="flex items-center gap-[7px]" style={{ marginBottom: 4 }}>
        <span className="flex items-center justify-center rounded-full flex-none" style={{ width: 22, height: 22, fontSize: 9, fontWeight: 700, background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}>{c.initials}</span>
        <span className="flex-1 min-w-0 truncate" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-primary)" }}>{c.name}</span>
        <span title={c.channel} className="rounded-full flex-none" style={{ width: 14, height: 14, background: CHANNEL_COLOR[c.channel] || "var(--neutral-400)" }} />
      </div>
      <div className="truncate" style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 5 }}>{c.preview}</div>
      <Badge variant={STATUS_VARIANT[c.status]} className="text-[10px]">{c.status}</Badge>
    </div>
  );
}

export function TeamInboxView() {
  const router = useRouter();
  const convos = TEAM_CONVOS;
  const open = () => router.push("/app/inbox");

  const forAgent = (name: string) => convos.filter((c) => c.assignee === name);
  const unassigned = convos.filter((c) => !c.assignee);
  const onlineCount = AGENTS.filter((a) => a.online).length;

  const cols: Column[] = [
    { id: "unassigned", name: "Sin asignar", online: null, tint: ["var(--neutral-200)", "var(--color-text-secondary)"] },
    ...AGENTS.map((a) => ({ id: a.id, name: a.name, online: a.online, tint: a.tint, role: a.role })),
  ];

  return (
    <div className="flex flex-col" style={{ flex: 1, minWidth: 0, background: "var(--color-background)", height: "100%" }}>
      <div className="flex items-center gap-3 flex-none" style={{ padding: "18px 28px 16px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>Bandeja de equipo</h1>
        <Badge variant="neutral">{convos.length} total</Badge>
        <span style={{ fontSize: 12.5, color: "var(--color-text-tertiary)" }}>{onlineCount} agentes en línea</span>
      </div>
      <div className="flex gap-4 items-start" style={{ flex: 1, overflowX: "auto", overflowY: "hidden", padding: "24px 28px" }}>
        {cols.map((col) => {
          const list = col.id === "unassigned" ? unassigned : forAgent(col.name);
          return (
            <div key={col.id} className="flex flex-col" style={{ width: 280, flex: "none", background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", maxHeight: "100%" }}>
              <div className="flex items-center gap-2.5 flex-none" style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
                {col.id === "unassigned" ? (
                  <span className="flex items-center justify-center rounded-full flex-none" style={{ width: 32, height: 32, background: col.tint[0], color: col.tint[1] }}><Icon name="user" size={16} /></span>
                ) : (
                  <span className="flex items-center justify-center rounded-full relative flex-none" style={{ width: 32, height: 32, fontSize: 11, fontWeight: 700, background: col.tint[0], color: col.tint[1] }}>
                    {col.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    <span className="absolute rounded-full" style={{ bottom: -1, right: -1, width: 9, height: 9, background: col.online ? "var(--color-success)" : "var(--color-text-disabled)", boxShadow: "0 0 0 2px var(--color-surface)" }} />
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{col.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-tertiary)" }}>{list.length} conversación{list.length !== 1 ? "es" : ""}</div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ flex: 1, padding: 8 }}>
                {list.map((c) => <ConvoCard key={c.id} c={c} onOpen={open} />)}
                {list.length === 0 && <div className="text-center" style={{ padding: "24px 0", fontSize: 12, color: "var(--color-text-tertiary)" }}>Vacío</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
