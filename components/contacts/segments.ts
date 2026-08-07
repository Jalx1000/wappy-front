import type { ContactWithIdentities } from "@/lib/api/contacts";

const within = (iso: string | null | undefined, days: number) =>
  !!iso && Date.now() - new Date(iso).getTime() < days * 86_400_000;

export const contactChannels = (c: ContactWithIdentities) =>
  [...new Set(c.identities.map((i) => i.channel))];

const labelOf = (c: ContactWithIdentities) =>
  c.contact.displayName || c.contact.phone || c.identities[0]?.handle || c.identities[0]?.profileName || "";

export function matchesSegment(
  c: ContactWithIdentities,
  segment: string,
  contactTagsById: Record<string, string[]>,
): boolean {
  const tags = contactTagsById[c.contact.id] || [];
  switch (true) {
    case segment === "all": return true;
    case segment === "active": return within(c.contact.updatedAt, 30);
    case segment === "new": return within(c.contact.createdAt, 7);
    case segment === "untagged": return tags.length === 0;
    case segment.startsWith("tag:"): return tags.includes(segment.slice(4));
    case segment.startsWith("channel:"): return contactChannels(c).includes(segment.slice(8));
    default: return true;
  }
}

// ── Compound filter rules (Add filter builder) ───────────────────────────────
export type FilterField = "name" | "channel" | "tag" | "created" | "activity";
export type FilterOp = "contains" | "is" | "has" | "not_has" | "within" | "older";

export interface FilterRule {
  id: string;
  field: FilterField;
  op: FilterOp;
  value: string;
}

export const FILTER_FIELDS: { id: FilterField; label: string; ops: FilterOp[]; kind: "text" | "channel" | "tag" | "days" }[] = [
  { id: "name",     label: "Nombre",           ops: ["contains"],        kind: "text" },
  { id: "channel",  label: "Canal",            ops: ["is"],              kind: "channel" },
  { id: "tag",      label: "Etiqueta",         ops: ["has", "not_has"],  kind: "tag" },
  { id: "created",  label: "Creado",           ops: ["within", "older"], kind: "days" },
  { id: "activity", label: "Última actividad", ops: ["within", "older"], kind: "days" },
];

export const OP_LABEL: Record<FilterOp, string> = {
  contains: "contiene",
  is: "es",
  has: "tiene",
  not_has: "no tiene",
  within: "en los últimos (días)",
  older: "hace más de (días)",
};

function matchesRule(c: ContactWithIdentities, r: FilterRule, tagsById: Record<string, string[]>): boolean {
  const tags = tagsById[c.contact.id] || [];
  switch (r.field) {
    case "name": return labelOf(c).toLowerCase().includes(r.value.toLowerCase());
    case "channel": return contactChannels(c).includes(r.value);
    case "tag": return r.op === "not_has" ? !tags.includes(r.value) : tags.includes(r.value);
    case "created": {
      const days = Number(r.value) || 0;
      return r.op === "older" ? !within(c.contact.createdAt, days) : within(c.contact.createdAt, days);
    }
    case "activity": {
      const days = Number(r.value) || 0;
      return r.op === "older" ? !within(c.contact.updatedAt, days) : within(c.contact.updatedAt, days);
    }
    default: return true;
  }
}

/** All rules must match (AND). Empty-value rules are ignored. */
export function matchesRules(c: ContactWithIdentities, rules: FilterRule[], tagsById: Record<string, string[]>): boolean {
  return rules.every((r) => !r.value.trim() || matchesRule(c, r, tagsById));
}
