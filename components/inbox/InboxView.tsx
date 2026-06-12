"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { Segmented } from "@/components/ui/Segmented";
import { useInbox, useInboxThread, useInboxReply } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import { DemoBanner } from "@/components/ui/DemoBanner";

type FilterKey = "all" | "unread" | "DM" | "Comentario";
const FILTERS: Array<{ v: FilterKey; l: string }> = [
  { v: "all", l: "Todo" },
  { v: "unread", l: "Sin leer" },
  { v: "DM", l: "DMs" },
  { v: "Comentario", l: "Comentarios" },
];

export function InboxView() {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: inboxItems = [] } = useInbox(brandId);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selId, setSelId] = useState<number | undefined>(undefined);
  const [reply, setReply] = useState("");

  const activeSelId = selId ?? inboxItems[0]?.id;
  const { data: thread = [] } = useInboxThread(brandId, activeSelId);
  const replyMutation = useInboxReply(brandId);

  const list = inboxItems.filter((x) => {
    if (filter === "unread") return x.unread;
    if (filter === "DM" || filter === "Comentario") return x.kind === filter;
    return true;
  });

  const active = inboxItems.find((x) => x.id === activeSelId) ?? inboxItems[0];
  const unreadCount = inboxItems.filter((x) => x.unread).length;

  return (
    <div className="flex flex-col h-full" style={{ padding: "28px 28px 0" }}>
      <DemoBanner module="Inbox" />
      <div className="flex items-end gap-4 mb-4 flex-wrap">
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
            Bandeja Social
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Comentarios y mensajes directos
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="primary">{unreadCount} sin leer</Badge>
        )}
      </div>

      <div className="fobo-card flex-1 min-h-0 overflow-hidden grid" style={{ gridTemplateColumns: "320px 1fr", marginBottom: 28 }}>
        {/* List pane */}
        <div className="flex flex-col min-h-0" style={{ borderRight: "1px solid var(--color-border)" }}>
          <div className="p-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <Segmented options={FILTERS} value={filter} onChange={(v) => setFilter(v as FilterKey)} sm />
          </div>
          <div className="overflow-y-auto flex-1">
            {list.map((item) => {
              const on = item.id === activeSelId;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelId(item.id as number)}
                  className="flex gap-3 w-full text-left border-none cursor-pointer p-[13px_14px]"
                  style={{
                    background: on ? "var(--color-primary-subtle)" : "transparent",
                    borderBottom: "1px solid var(--color-border)",
                    borderLeft: on ? "3px solid var(--color-primary)" : "3px solid transparent",
                    fontFamily: "var(--ff-ui)",
                  }}
                  onMouseEnter={(e) => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = "var(--color-background)"; }}
                  onMouseLeave={(e) => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <span
                      className="flex items-center justify-center text-white font-bold text-[12px] rounded-full"
                      style={{ width: 38, height: 38, background: item.tint }}
                    >
                      {item.avatar}
                    </span>
                    <span className="absolute -bottom-[2px] -right-[2px]" style={{ border: "2px solid var(--color-surface)", borderRadius: 9999 }}>
                      <ChannelDot channel={item.ch} size={16} radius={9999} />
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="flex-1 truncate text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        {item.who}
                      </span>
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--color-primary)" }} />
                      )}
                    </div>
                    <div className="truncate text-[12.5px] mt-[2px]" style={{ color: "var(--color-text-secondary)" }}>
                      {item.msg}
                    </div>
                    <div className="flex items-center gap-2 mt-[5px]">
                      <span className="text-[10.5px] font-medium px-[6px] py-[2px] rounded-full" style={{ background: "var(--color-background)", color: "var(--color-text-tertiary)", border: "1px solid var(--color-border)" }}>
                        {item.kind}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{item.when}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread pane */}
        <div className="flex flex-col min-h-0">
          {/* Thread header */}
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <span
              className="flex items-center justify-center text-white font-bold text-[12px] rounded-full flex-shrink-0"
              style={{ width: 36, height: 36, background: active.tint }}
            >
              {active.avatar}
            </span>
            <div className="flex-1">
              <div className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{active.who}</div>
              <div className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                {active.ch.charAt(0).toUpperCase() + active.ch.slice(1)} · {active.kind}
              </div>
            </div>
            <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex items-center gap-1">
              <Icon name="ext" size={14} /> Abrir en plataforma
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-5 flex flex-col gap-3"
            style={{ background: "var(--color-background)" }}
          >
            {thread.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div style={{ maxWidth: "72%" }}>
                  <div
                    className="px-[14px] py-[10px] text-[13.5px] leading-[1.45]"
                    style={{
                      borderRadius: m.from === "me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: m.from === "me" ? "var(--color-primary)" : "var(--color-surface)",
                      color: m.from === "me" ? "#fff" : "var(--color-text-primary)",
                      border: m.from === "me" ? "none" : "1px solid var(--color-border)",
                    }}
                  >
                    {m.text}
                  </div>
                  <div
                    className="text-[11px] mt-1"
                    style={{
                      color: "var(--color-text-tertiary)",
                      textAlign: m.from === "me" ? "right" : "left",
                    }}
                  >
                    {m.from === "me" && m.by ? `${m.by} · ` : ""}{m.when}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply input */}
          <div className="flex gap-3 p-4 items-center" style={{ borderTop: "1px solid var(--color-border)" }}>
            <input
              className="fobo-input flex-1"
              style={{ height: 44 }}
              placeholder="Escribe una respuesta…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && reply.trim() && activeSelId) {
                  replyMutation.mutate({ itemId: activeSelId, text: reply });
                  setReply("");
                }
              }}
            />
            <button
              className="fobo-btn fobo-btn-primary flex items-center gap-1"
              style={{ height: 44 }}
              onClick={() => {
                if (!reply.trim() || !activeSelId) return;
                replyMutation.mutate({ itemId: activeSelId, text: reply });
                setReply("");
              }}
            >
              <Icon name="send" size={15} /> Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
