"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { useIntegrationsStore, INTEGRATIONS_SEED } from "@/store/integrations";

const CATS = ["Todas", ...Array.from(new Set(INTEGRATIONS_SEED.map((i) => i.cat)))];

export function IntegrationsView() {
  const { items, toggle } = useIntegrationsStore();
  const toast = useToast();
  const [cat, setCat] = useState("Todas");

  const shown = cat === "Todas" ? items : items.filter((i) => i.cat === cat);
  const connectedCount = items.filter((i) => i.connected).length;

  const onToggle = (id: string) => {
    const it = items.find((i) => i.id === id);
    toggle(id);
    if (it) toast(it.connected ? it.name + " desconectado" : it.name + " conectado");
  };

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "var(--color-background)", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "18px 28px 16px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ paddingBottom: 12 }}><DemoBanner module="Integraciones" /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>Integraciones</h1>
          <Badge variant="success">{connectedCount} conectadas</Badge>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={"fobo-badge " + (cat === c ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary-ink)]" : "bg-[var(--neutral-200)] text-[var(--color-text-secondary)]")}
                style={{ height: 30, padding: "0 12px", cursor: "pointer", border: "none", fontSize: 12 }}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {shown.map((it) => (
            <div key={it.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: it.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, flex: "none" }}>{it.glyph}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>{it.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-tertiary)" }}>{it.cat}</div>
                </div>
                {it.connected && <span style={{ width: 9, height: 9, borderRadius: 9999, background: "var(--color-success)", flex: "none" }} />}
              </div>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, flex: 1, marginBottom: 14 }}>{it.desc}</div>
              <button className={it.connected ? "fobo-btn fobo-btn-secondary fobo-btn-sm" : "fobo-btn fobo-btn-primary fobo-btn-sm"} style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }} onClick={() => onToggle(it.id)}>
                {it.connected ? <><Icon name="check2" size={15} /> Conectado</> : "Conectar"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
