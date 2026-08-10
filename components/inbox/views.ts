import { convoStateOf, type ConvoState } from "@/store/convoState";
import type { UnifiedConversation } from "@/lib/api/socialInbox";

export const ME = "Tú";

export function matchesView(
  c: UnifiedConversation,
  view: string,
  byId: Record<string, ConvoState>,
  contactTagsById: Record<string, string[]>,
  meId?: number,
): boolean {
  const st = convoStateOf(byId, c.id);
  const a = c.assignment;
  const assigned = !!a && (a.userId != null || a.teamId != null);
  switch (true) {
    case view === "all": return true;
    case view === "open": return st.status === "open";
    case view === "unassigned": return st.status !== "resolved" && !assigned;
    case view === "mine": return meId != null && a?.userId === meId;
    case view === "snoozed": return st.status === "snoozed";
    case view === "resolved": return st.status === "resolved";
    case view.startsWith("channel:"): return c.channel === view.slice(8);
    case view.startsWith("tag:"): {
      const tid = view.slice(4);
      const tids = c.contact ? contactTagsById[c.contact.id] || [] : [];
      return tids.includes(tid);
    }
    default: return true;
  }
}
