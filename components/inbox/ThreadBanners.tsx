"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { UnifiedMessage } from "@/lib/api/socialInbox";

const SLA_MIN = 10;
const COLLIDE = ["Ana García", "Marco Rossi", "Sofia Petrova"];

const initials = (n: string) => n.split(" ").map((w) => w[0]).join("").toUpperCase();
const fmt = (ms: number) => {
  const s = Math.floor(Math.abs(ms) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Mock SLA countdown + agent-collision banner shown under the thread header. */
export function ThreadBanners({ convoId, messages, resolved }: { convoId: string; messages: UnifiedMessage[]; resolved: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const last = messages[messages.length - 1];
  const awaiting = !resolved && !!last && last.direction === "in";
  const remain = awaiting ? new Date(last.sentAt).getTime() + SLA_MIN * 60000 - now : 0;
  const overdue = remain < 0;
  const urgent = remain < 2 * 60000;

  const hash = [...convoId].reduce((a, c) => a + c.charCodeAt(0), 0);
  const collides = hash % 3 === 0;
  const who = COLLIDE[hash % COLLIDE.length];

  if (!awaiting && !collides) return null;

  return (
    <div className="flex flex-col flex-none">
      {awaiting && (
        <div
          className="flex items-center gap-2"
          style={{
            padding: "7px 18px", borderBottom: "1px solid var(--color-border)",
            background: overdue ? "var(--color-error-bg)" : urgent ? "var(--color-warning-bg)" : "var(--color-background)",
            color: overdue ? "var(--color-error)" : urgent ? "var(--color-warning)" : "var(--color-text-secondary)",
            fontSize: 12.5, fontWeight: 600,
          }}
        >
          <Icon name="clock" size={14} />
          {overdue ? `SLA vencido hace ${fmt(remain)}` : `Responder en ${fmt(remain)}`}
        </div>
      )}
      {collides && (
        <div className="flex items-center gap-2" style={{ padding: "7px 18px", borderBottom: "1px solid var(--color-border)", background: "var(--color-warning-bg)", color: "var(--color-warning)", fontSize: 12.5, fontWeight: 600 }}>
          <span className="flex items-center justify-center rounded-full flex-none" style={{ width: 18, height: 18, fontSize: 8, fontWeight: 700, background: "var(--color-warning)", color: "#fff" }}>{initials(who)}</span>
          {who} también está viendo esta conversación
        </div>
      )}
    </div>
  );
}
