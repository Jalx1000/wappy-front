"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { FieldInput } from "@/components/attributes/AttributesModals";
import { useAttributesStore } from "@/store/attributes";
import { useCustomValuesStore, recordValues } from "@/store/customValues";
import { useTagsStore } from "@/store/tags";
import { tagDot } from "@/components/tags/data";
import { useContactTagsStore } from "@/store/contactTags";
import { useSharedItemsStore } from "@/store/sharedItems";

// Stable empty default — returning a fresh [] inside a zustand selector triggers
// an infinite render loop ("getSnapshot should be cached").
const EMPTY: never[] = [];

function ExtrasCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[14px]" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)", padding: "16px 18px" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-bold uppercase" style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>{title}</div>
        {action}
      </div>
      {children}
    </div>
  );
}

const manageLink = (href: string, label: string) => (
  <Link href={href} className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: "var(--color-primary-ink)" }}>
    <Icon name="settings" size={13} /> {label}
  </Link>
);

// ── Tags ─────────────────────────────────────────────────────────────────────
export function ContactTagsCard({ contactId }: { contactId: string }) {
  const tags = useTagsStore((s) => s.tags);
  const applied = useContactTagsStore((s) => s.byContact[contactId]) ?? EMPTY;
  const toggle = useContactTagsStore((s) => s.toggle);
  const [adding, setAdding] = useState(false);

  const appliedTags = tags.filter((t) => applied.includes(t.id));
  const available = tags.filter((t) => !applied.includes(t.id));

  return (
    <ExtrasCard title="Etiquetas" action={manageLink("/app/tags", "Gestionar")}>
      <div className="flex flex-wrap items-center gap-2">
        {appliedTags.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-1.5 rounded-full" style={{ padding: "4px 10px 4px 8px", background: "var(--neutral-100)" }}>
            <span className="rounded-full" style={{ width: 8, height: 8, background: tagDot(t.color) }} />
            <span className="text-[12.5px] font-medium" style={{ color: "var(--color-text-primary)" }}>{t.name}</span>
            <button onClick={() => toggle(contactId, t.id)} aria-label={`Quitar ${t.name}`} className="border-none bg-transparent cursor-pointer" style={{ color: "var(--color-text-tertiary)", lineHeight: 1 }}>
              <Icon name="x" size={13} />
            </button>
          </span>
        ))}
        {appliedTags.length === 0 && <span className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>Sin etiquetas.</span>}
        <div className="relative">
          <button onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-1 rounded-full cursor-pointer" style={{ padding: "4px 10px", border: "1px dashed var(--color-border-strong)", background: "transparent", color: "var(--color-text-secondary)", fontSize: 12.5, fontWeight: 600 }}>
            <Icon name="plus" size={13} /> etiqueta
          </button>
          {adding && (
            <>
              <div className="fixed inset-0 z-[40]" onClick={() => setAdding(false)} />
              <div className="absolute z-[41]" style={{ top: "calc(100% + 6px)", left: 0, minWidth: 180, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "var(--shadow-3)", padding: 6 }}>
                {available.length === 0 ? (
                  <div className="text-center text-[12.5px]" style={{ padding: "8px 6px", color: "var(--color-text-tertiary)" }}>Todas aplicadas</div>
                ) : available.map((t) => (
                  <button key={t.id} onClick={() => { toggle(contactId, t.id); setAdding(false); }} className="flex items-center gap-2 w-full text-left rounded-[8px] cursor-pointer" style={{ padding: "7px 9px", background: "transparent", border: "none", color: "var(--color-text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <span className="rounded-full" style={{ width: 8, height: 8, background: tagDot(t.color) }} />
                    <span className="text-[13px]">{t.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </ExtrasCard>
  );
}

// ── Custom attributes (Attributes → Contacts) ────────────────────────────────
export function ContactAttributesCard({ contactId }: { contactId: string }) {
  const mod = useAttributesStore((s) => s.modules.find((m) => m.id === "contacts"));
  const values = useCustomValuesStore((s) => s.values);
  const setFieldValue = useCustomValuesStore((s) => s.setFieldValue);
  const fields = mod?.fields || [];
  const rv = recordValues(values, "contacts", contactId);

  return (
    <ExtrasCard title="Atributos personalizados" action={manageLink("/app/attributes?module=contacts", "Gestionar")}>
      {fields.length === 0 ? (
        <span className="text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>
          Sin atributos. Añádelos en <Link href="/app/attributes?module=contacts" style={{ color: "var(--color-primary-ink)", fontWeight: 600 }}>Atributos → Contactos</Link>.
        </span>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((f) => (
            <div key={f.id} style={{ display: f.type === "boolean" ? "flex" : "block", alignItems: "center", gap: 12 }}>
              <label className="block text-[12px] font-medium" style={{ color: "var(--color-text-secondary)", marginBottom: f.type === "boolean" ? 0 : 6, flex: f.type === "boolean" ? 1 : "none" }}>{f.label}</label>
              <FieldInput field={f} value={rv[f.key]} onChange={(v) => setFieldValue("contacts", contactId, f.key, v)} />
            </div>
          ))}
        </div>
      )}
    </ExtrasCard>
  );
}

// ── Shared history (articles / products shared in the inbox) ──────────────────
function relTime(iso: string): string {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  return new Date(iso).toLocaleDateString();
}

export function ContactSharedCard({ contactId }: { contactId: string }) {
  const items = useSharedItemsStore((s) => s.byContact[contactId]) ?? EMPTY;
  if (items.length === 0) return null;
  return (
    <ExtrasCard title={`Compartidos (${items.length})`}>
      <div className="flex flex-col gap-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 rounded-[10px]" style={{ padding: "9px 11px", border: "1px solid var(--color-border)", background: "var(--color-background)" }}>
            <span className="flex items-center justify-center rounded-[9px] flex-none" style={{ width: 32, height: 32, background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}><Icon name={it.kind === "article" ? "book" : "box"} size={16} /></span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{it.title}</div>
              {it.subtitle && <div className="text-[12px] truncate" style={{ color: "var(--color-text-tertiary)" }}>{it.subtitle}</div>}
            </div>
            <span className="text-[11px] flex-none" style={{ color: "var(--color-text-tertiary)" }}>{relTime(it.at)}</span>
          </div>
        ))}
      </div>
    </ExtrasCard>
  );
}
