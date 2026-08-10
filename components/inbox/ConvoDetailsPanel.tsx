"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/ui/Icon";
import { channelLabel } from "@/lib/channels";
import { ContactTagsCard, ContactAttributesCard, ContactSharedCard } from "@/components/contacts/ContactExtras";
import { useMe, useBrandMembers } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { teamsApi } from "@/lib/api/teams";
import { socialInboxApi } from "@/lib/api/socialInbox";
import { useToast } from "@/components/ui/Toast";
import { summarize, type ConvMeta } from "./copilotEngine";
import type { UnifiedConversation } from "@/lib/api/socialInbox";

const initialsOf = (s: string) => s.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

/** Contact photo (Meta CDN when available) with initials fallback. Plain <img>
 *  because Meta avatar URLs are arbitrary/expiring hosts next/image can't optimise. */
function PeerPhoto({ label, avatarUrl, size }: { label: string; avatarUrl?: string | null; size: number }) {
  const [broken, setBroken] = useState(false);
  if (avatarUrl && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={label} onError={() => setBroken(true)} className="rounded-full object-cover flex-none" style={{ width: size, height: size }} />
    );
  }
  return (
    <span className="flex items-center justify-center rounded-full flex-none text-white font-bold" style={{ width: size, height: size, background: "#8891a7", fontSize: Math.round(size * 0.34) }}>
      {initialsOf(label)}
    </span>
  );
}

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <div className="text-[11px] font-bold uppercase" style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

const menuItemStyle = { padding: "7px 9px", background: "transparent", border: "none", color: "var(--color-text-primary)" } as const;
const menuLabelStyle = { padding: "6px 9px 3px", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" } as const;

function AssignSection({ conversation }: { conversation: UnifiedConversation }) {
  const { activeBrand } = useUIStore();
  const { data: me } = useMe();
  const { data: members = [] } = useBrandMembers(activeBrand?.id);
  const { data: teams = [] } = useQuery({
    queryKey: ["teams", activeBrand?.id],
    queryFn: () => teamsApi.list(activeBrand!.id),
    enabled: !!activeBrand,
  });
  const qc = useQueryClient();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const a = conversation.assignment;
  const memberName = (userId: number) => (me?.id === userId ? "Tú" : `Usuario #${userId}`);
  const currentTeam = a?.teamId ? teams.find((t) => t.id === a.teamId) : undefined;
  const currentLabel =
    a?.userId != null ? memberName(a.userId) : a?.teamId ? currentTeam?.name ?? "Equipo" : null;

  const doAssign = async (payload: { assigneeUserId?: number | null; teamId?: string | null }) => {
    setBusy(true);
    try {
      await socialInboxApi.assign(conversation.id, conversation.channel, payload);
      await qc.invalidateQueries({ queryKey: ["social-inbox", "conversations"] });
      setOpen(false);
    } catch {
      toast("No se pudo asignar", "error");
    } finally {
      setBusy(false);
    }
  };

  const item = (label: React.ReactNode, onClick: () => void, key: string) => (
    <button
      key={key}
      onClick={onClick}
      disabled={busy}
      className="flex items-center gap-2 w-full text-left rounded-[8px] cursor-pointer"
      style={menuItemStyle}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span className="text-[13px]">{label}</span>
    </button>
  );

  return (
    <SectionCard title="Asignación">
      <div className="relative">
        <button onClick={() => setOpen((v) => !v)} disabled={busy} className="flex items-center gap-2.5 w-full text-left cursor-pointer rounded-[10px]" style={{ padding: "8px 10px", border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
          <span className="flex items-center justify-center rounded-full flex-none" style={{ width: 26, height: 26, fontSize: 10, fontWeight: 700, background: currentLabel ? "var(--color-primary-subtle)" : "var(--neutral-200)", color: currentLabel ? "var(--color-primary-ink)" : "var(--color-text-secondary)" }}>
            {a?.teamId ? <Icon name="users" size={13} /> : currentLabel ? initialsOf(currentLabel) : <Icon name="user" size={14} />}
          </span>
          <span className="flex-1 text-[13px] font-medium" style={{ color: currentLabel ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>{currentLabel || "Sin asignar"}</span>
          <Icon name="chevronDown" size={15} style={{ color: "var(--color-text-tertiary)" }} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-[40]" onClick={() => setOpen(false)} />
            <div className="absolute z-[41] max-h-[280px] overflow-y-auto" style={{ top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "var(--shadow-3)", padding: 6 }}>
              {item("Sin asignar", () => doAssign({ assigneeUserId: null, teamId: null }), "none")}
              <div style={menuLabelStyle}>Agentes</div>
              {members.length === 0 && <div className="text-[12px]" style={{ padding: "4px 9px", color: "var(--color-text-tertiary)" }}>Sin miembros</div>}
              {members.map((m) => item(memberName(m.userId), () => doAssign({ assigneeUserId: m.userId, teamId: null }), `u${m.userId}`))}
              {teams.length > 0 && <div style={menuLabelStyle}>Equipos</div>}
              {teams.map((t) =>
                item(
                  <span className="flex items-center gap-1.5"><Icon name="users" size={13} /> {t.name}</span>,
                  () => doAssign({ assigneeUserId: null, teamId: t.id }),
                  `t${t.id}`,
                ),
              )}
            </div>
          </>
        )}
      </div>
    </SectionCard>
  );
}

export function ConvoDetailsPanel({ conversation, copilotMeta }: { conversation: UnifiedConversation; copilotMeta: ConvMeta }) {
  const [tab, setTab] = useState<"details" | "copilot">("details");
  const contactId = conversation.contact?.id;

  return (
    <aside className="flex flex-col min-h-0" style={{ background: "var(--color-surface)", borderLeft: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-1 flex-none" style={{ padding: "12px 14px 0" }}>
        {([["details", "Detalles"], ["copilot", "Copilot"]] as [typeof tab, string][]).map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} className="cursor-pointer border-none bg-transparent" style={{ fontSize: 13.5, fontWeight: 600, padding: "8px 8px 12px", position: "relative", color: tab === id ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>
            {lbl}
            {tab === id && <span className="absolute left-0 right-0 bottom-0" style={{ height: 2, background: "var(--color-primary)", borderRadius: 2 }} />}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto" style={{ borderTop: "1px solid var(--color-border)" }}>
        {tab === "details" ? (
          <>
            <AssignSection conversation={conversation} />
            <SectionCard title="Datos de contacto" action={contactId ? <Link href={`/app/contacts?id=${contactId}`} className="text-[12px] font-semibold" style={{ color: "var(--color-primary-ink)" }}>Ver ficha</Link> : undefined}>
              <div className="flex flex-col gap-1.5 text-[13px]">
                <div className="flex items-center gap-2.5" style={{ marginBottom: 2 }}>
                  <PeerPhoto label={conversation.contact?.displayName || conversation.peer} avatarUrl={conversation.contact?.avatarUrl} size={40} />
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{conversation.contact?.displayName || conversation.peer}</div>
                    {conversation.profileUrl && (
                      <a href={conversation.profileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: "var(--color-primary-ink)" }}>
                        <Icon name="link" size={12} /> Ver perfil
                      </a>
                    )}
                  </div>
                </div>
                {conversation.peer && <div className="flex items-center gap-2" style={{ color: "var(--color-text-secondary)" }}><Icon name="phone" size={14} style={{ color: "var(--color-text-tertiary)" }} /> {conversation.peer}</div>}
                <div className="flex items-center gap-2" style={{ color: "var(--color-text-secondary)" }}><Icon name="inbox" size={14} style={{ color: "var(--color-text-tertiary)" }} /> {channelLabel(conversation.channel)} · {conversation.accountHandle}</div>
              </div>
            </SectionCard>
            {contactId ? (
              <div className="flex flex-col gap-2.5" style={{ padding: 12 }}>
                <ContactTagsCard contactId={contactId} />
                <ContactAttributesCard contactId={contactId} />
                <ContactSharedCard contactId={contactId} />
              </div>
            ) : (
              <div className="text-center" style={{ padding: "24px 16px", fontSize: 13, color: "var(--color-text-tertiary)" }}>Esta conversación no está vinculada a un contacto.</div>
            )}
          </>
        ) : (
          <div style={{ padding: "16px" }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <span className="flex items-center justify-center" style={{ width: 24, height: 24, borderRadius: 7, background: "var(--color-primary)", color: "var(--color-on-primary)" }}><Icon name="spark" size={14} /></span>
              <span className="text-[13px] font-bold" style={{ color: "var(--color-text-primary)" }}>Resumen de Copilot</span>
            </div>
            <ul className="m-0 flex flex-col gap-2" style={{ paddingLeft: 18 }}>
              {summarize(copilotMeta).map((s, i) => <li key={i} style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{s}</li>)}
            </ul>
            <div className="flex items-center gap-2" style={{ marginTop: 14, fontSize: 12, color: "var(--color-text-tertiary)" }}>
              <Icon name="info" size={13} /> Abre Copilot (✦) en el composer para sugerencias y reescritura.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
