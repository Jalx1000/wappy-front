"use client";

import { Icon, type IconName } from "@/components/ui/Icon";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { channelLabel, metaKey } from "@/lib/channels";
import { useConvoStateStore } from "@/store/convoState";
import { useTagsStore } from "@/store/tags";
import { tagDot } from "@/components/tags/data";
import { useContactTagsStore } from "@/store/contactTags";
import { matchesView } from "./views";
import type { UnifiedConversation } from "@/lib/api/socialInbox";

const PRIMARY: { id: string; label: string; icon: IconName }[] = [
  { id: "open", label: "Abiertas", icon: "inbox" },
  { id: "unassigned", label: "Sin asignar", icon: "user" },
  { id: "mine", label: "Míos", icon: "userPlus" },
  { id: "snoozed", label: "Pospuestas", icon: "clock" },
  { id: "resolved", label: "Resueltas", icon: "check" },
  { id: "all", label: "Todas", icon: "layers" },
];

function Row({ active, icon, dot, label, count, onClick }: {
  active: boolean; icon?: IconName; dot?: React.ReactNode; label: string; count: number; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-2.5 w-full text-left cursor-pointer border-none"
      style={{ padding: "7px 10px", borderRadius: 8, marginBottom: 1, background: active ? "var(--color-primary-subtle)" : "transparent", color: active ? "var(--color-primary-ink)" : "var(--color-text-secondary)" }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--neutral-100)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      {dot ?? (icon && <Icon name={icon} size={16} className="flex-none" />)}
      <span className="flex-1 truncate text-[13px]" style={{ fontWeight: active ? 600 : 500 }}>{label}</span>
      <span className="text-[12px] tnum" style={{ color: active ? "var(--color-primary-ink)" : "var(--color-text-tertiary)" }}>{count}</span>
    </button>
  );
}

export function InboxViewsRail({ conversations, view, onSelect }: {
  conversations: UnifiedConversation[]; view: string; onSelect: (v: string) => void;
}) {
  const byId = useConvoStateStore((s) => s.byId);
  const tags = useTagsStore((s) => s.tags);
  const contactTagsById = useContactTagsStore((s) => s.byContact);
  const count = (v: string) => conversations.filter((c) => matchesView(c, v, byId, contactTagsById)).length;

  const channels = [...new Set(conversations.map((c) => c.channel))];
  const label = "text-[10.5px] font-bold uppercase";

  return (
    <aside className="flex flex-col min-h-0" style={{ background: "var(--color-sidebar)", borderRight: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-2 flex-none" style={{ padding: "16px 16px 10px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)", margin: 0 }}>Bandeja</h1>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: "0 8px 12px" }}>
        {PRIMARY.map((v) => (
          <Row key={v.id} active={view === v.id} icon={v.icon} label={v.label} count={count(v.id)} onClick={() => onSelect(v.id)} />
        ))}

        {channels.length > 0 && (
          <>
            <div className={label} style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)", padding: "14px 10px 6px" }}>Canales</div>
            {channels.map((ch) => (
              <Row key={ch} active={view === `channel:${ch}`} dot={<ChannelDot channel={metaKey(ch)} size={16} radius={5} />} label={channelLabel(ch)} count={count(`channel:${ch}`)} onClick={() => onSelect(`channel:${ch}`)} />
            ))}
          </>
        )}

        {tags.length > 0 && (
          <>
            <div className={label} style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)", padding: "14px 10px 6px" }}>Etiquetas</div>
            {tags.map((t) => (
              <Row key={t.id} active={view === `tag:${t.id}`} dot={<span className="rounded-full flex-none" style={{ width: 10, height: 10, background: tagDot(t.color) }} />} label={t.name} count={count(`tag:${t.id}`)} onClick={() => onSelect(`tag:${t.id}`)} />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
