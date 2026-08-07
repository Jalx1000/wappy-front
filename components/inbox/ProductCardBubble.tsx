"use client";

import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import type { ThreadCard } from "@/store/threadCards";

/** A product rendered as a rich card inside a message bubble (m.type === "product"). */
export function ProductCardBubble({ card, agent = true }: { card: ThreadCard; agent?: boolean }) {
  const price = card.price != null ? "$" + Number(card.price).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—";
  return (
    <div style={{ width: 280, borderRadius: agent ? "16px 4px 16px 16px" : "4px 16px 16px 16px", overflow: "hidden",
      background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
        background: agent ? "var(--color-primary)" : "var(--neutral-100)",
        color: agent ? "var(--color-on-primary)" : "var(--color-text-secondary)" }}>
        <Icon name="box" size={15} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Producto</span>
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>{card.name}</div>
        {card.sku && <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{card.sku}</div>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <span className="tnum" style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>{price}</span>
          {card.category && <Badge variant="neutral">{card.category}</Badge>}
        </div>
      </div>
    </div>
  );
}
