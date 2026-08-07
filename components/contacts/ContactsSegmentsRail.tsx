"use client";

import { Icon, type IconName } from "@/components/ui/Icon";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { channelLabel, metaKey } from "@/lib/channels";
import { useTagsStore } from "@/store/tags";
import { tagDot } from "@/components/tags/data";
import { useContactTagsStore } from "@/store/contactTags";
import { useSavedSegmentsStore, type SavedSegment } from "@/store/savedSegments";
import { matchesSegment, matchesRules, contactChannels } from "./segments";
import type { ContactWithIdentities } from "@/lib/api/contacts";

const PEOPLE: { id: string; label: string; icon: IconName }[] = [
  { id: "all", label: "Todos", icon: "users" },
  { id: "active", label: "Activos", icon: "spark" },
  { id: "new", label: "Nuevos", icon: "star" },
  { id: "untagged", label: "Sin etiqueta", icon: "user" },
];

function Row({ active, icon, dot, label, count, onClick, onRemove }: {
  active: boolean; icon?: IconName; dot?: React.ReactNode; label: string; count: number; onClick: () => void; onRemove?: () => void;
}) {
  return (
    <button onClick={onClick} className="group flex items-center gap-2.5 w-full text-left cursor-pointer border-none"
      style={{ padding: "7px 10px", borderRadius: 8, marginBottom: 1, background: active ? "var(--color-primary-subtle)" : "transparent", color: active ? "var(--color-primary-ink)" : "var(--color-text-secondary)" }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--neutral-100)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
      {dot ?? (icon && <Icon name={icon} size={16} className="flex-none" />)}
      <span className="flex-1 truncate text-[13px]" style={{ fontWeight: active ? 600 : 500 }}>{label}</span>
      {onRemove ? (
        <span
          role="button"
          tabIndex={0}
          aria-label="Eliminar segmento"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="opacity-0 group-hover:opacity-100 flex-none"
          style={{ color: "var(--color-text-tertiary)", cursor: "pointer", display: "inline-flex" }}
        >
          <Icon name="x" size={13} />
        </span>
      ) : (
        <span className="text-[12px] tnum" style={{ color: active ? "var(--color-primary-ink)" : "var(--color-text-tertiary)" }}>{count}</span>
      )}
    </button>
  );
}

export function ContactsSegmentsRail({ contacts, segment, savedId, onSelect, onSelectSaved }: {
  contacts: ContactWithIdentities[];
  segment: string;
  savedId?: string;
  onSelect: (s: string) => void;
  onSelectSaved: (seg: SavedSegment) => void;
}) {
  const tags = useTagsStore((s) => s.tags);
  const contactTagsById = useContactTagsStore((s) => s.byContact);
  const saved = useSavedSegmentsStore((s) => s.segments);
  const removeSaved = useSavedSegmentsStore((s) => s.remove);
  const count = (s: string) => contacts.filter((c) => matchesSegment(c, s, contactTagsById)).length;
  const savedCount = (seg: SavedSegment) => contacts.filter((c) => matchesRules(c, seg.rules, contactTagsById)).length;
  const channels = [...new Set(contacts.flatMap(contactChannels))];
  const lbl = "text-[10.5px] font-bold uppercase";
  const active = (s: string) => segment === s && !savedId;

  return (
    <aside className="flex flex-col min-h-0" style={{ background: "var(--color-sidebar)", borderRight: "1px solid var(--color-border)" }}>
      <div className="flex items-center flex-none" style={{ padding: "16px 16px 10px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)", margin: 0 }}>Segmentos</h1>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ padding: "0 8px 12px" }}>
        <div className={lbl} style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)", padding: "4px 10px 6px" }}>Personas</div>
        {PEOPLE.map((s) => (
          <Row key={s.id} active={active(s.id)} icon={s.icon} label={s.label} count={count(s.id)} onClick={() => onSelect(s.id)} />
        ))}

        {saved.length > 0 && (
          <>
            <div className={lbl} style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)", padding: "14px 10px 6px" }}>Segmentos guardados</div>
            {saved.map((seg) => (
              <Row key={seg.id} active={savedId === seg.id} icon="filter" label={seg.name} count={savedCount(seg)} onClick={() => onSelectSaved(seg)} onRemove={() => removeSaved(seg.id)} />
            ))}
          </>
        )}

        {channels.length > 0 && (
          <>
            <div className={lbl} style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)", padding: "14px 10px 6px" }}>Canales</div>
            {channels.map((ch) => (
              <Row key={ch} active={active(`channel:${ch}`)} dot={<ChannelDot channel={metaKey(ch)} size={16} radius={5} />} label={channelLabel(ch)} count={count(`channel:${ch}`)} onClick={() => onSelect(`channel:${ch}`)} />
            ))}
          </>
        )}
        {tags.length > 0 && (
          <>
            <div className={lbl} style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)", padding: "14px 10px 6px" }}>Etiquetas</div>
            {tags.map((t) => (
              <Row key={t.id} active={active(`tag:${t.id}`)} dot={<span className="rounded-full flex-none" style={{ width: 10, height: 10, background: tagDot(t.color) }} />} label={t.name} count={count(`tag:${t.id}`)} onClick={() => onSelect(`tag:${t.id}`)} />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
