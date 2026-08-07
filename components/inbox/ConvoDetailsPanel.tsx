"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { channelLabel } from "@/lib/channels";
import { ContactTagsCard, ContactAttributesCard, ContactSharedCard } from "@/components/contacts/ContactExtras";
import { useConvoStateStore, convoStateOf } from "@/store/convoState";
import { AGENTS } from "@/components/team-inbox/data";
import { summarize, type ConvMeta } from "./copilotEngine";
import type { UnifiedConversation } from "@/lib/api/socialInbox";

const initialsOf = (s: string) => s.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

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

function AssignSection({ convoId }: { convoId: string }) {
  const byId = useConvoStateStore((s) => s.byId);
  const setAssignee = useConvoStateStore((s) => s.setAssignee);
  const st = convoStateOf(byId, convoId);
  const [open, setOpen] = useState(false);

  return (
    <SectionCard title="Asignación">
      <div className="relative">
        <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2.5 w-full text-left cursor-pointer rounded-[10px]" style={{ padding: "8px 10px", border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
          {st.assignee ? (
            <span className="flex items-center justify-center rounded-full flex-none" style={{ width: 26, height: 26, fontSize: 10, fontWeight: 700, background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}>{initialsOf(st.assignee)}</span>
          ) : (
            <span className="flex items-center justify-center rounded-full flex-none" style={{ width: 26, height: 26, background: "var(--neutral-200)", color: "var(--color-text-secondary)" }}><Icon name="user" size={14} /></span>
          )}
          <span className="flex-1 text-[13px] font-medium" style={{ color: st.assignee ? "var(--color-text-primary)" : "var(--color-text-tertiary)" }}>{st.assignee || "Sin asignar"}</span>
          <Icon name="chevronDown" size={15} style={{ color: "var(--color-text-tertiary)" }} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-[40]" onClick={() => setOpen(false)} />
            <div className="absolute z-[41]" style={{ top: "calc(100% + 6px)", left: 0, right: 0, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "var(--shadow-3)", padding: 6 }}>
              {[{ id: "none", name: "Sin asignar" }, ...AGENTS].map((a) => (
                <button key={a.id} onClick={() => { setAssignee(convoId, a.name === "Sin asignar" ? null : a.name); setOpen(false); }}
                  className="flex items-center gap-2 w-full text-left rounded-[8px] cursor-pointer" style={{ padding: "7px 9px", background: "transparent", border: "none", color: "var(--color-text-primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <span className="text-[13px]">{a.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-2" style={{ marginTop: 8, fontSize: 12.5, color: "var(--color-text-tertiary)" }}>
        <Icon name="users" size={13} /> Bandeja de equipo: <span style={{ color: "var(--color-text-secondary)" }}>Sin asignar</span>
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
            <AssignSection convoId={conversation.id} />
            <SectionCard title="Datos de contacto" action={contactId ? <Link href={`/app/contacts?id=${contactId}`} className="text-[12px] font-semibold" style={{ color: "var(--color-primary-ink)" }}>Ver ficha</Link> : undefined}>
              <div className="flex flex-col gap-1.5 text-[13px]">
                <div className="flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}><Icon name="user" size={14} style={{ color: "var(--color-text-tertiary)" }} /> {conversation.contact?.displayName || conversation.peer}</div>
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
