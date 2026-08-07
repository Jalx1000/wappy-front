"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { NAV, st } from "./data";
import { WorkspacePanel, ChannelsPanel, NotificationsPanel, HoursPanel, BillingPanel } from "./panels";
import { TeamPanel, RolesPanel } from "./team";

export function SupportSettingsView() {
  const [tab, setTab] = useState("workspace");
  return (
    <div className="flex h-full" style={{ background: "var(--color-background)" }}>
      <div className="flex-none overflow-y-auto" style={{ width: 220, background: "var(--color-surface)", borderRight: "1px solid var(--color-border)", padding: "20px 10px" }}>
        {NAV.map((grp) => (
          <div key={grp.group} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)", padding: "0 10px 10px" }}>{grp.group}</div>
            {grp.items.map(([id, label, icon]) => {
              const on = tab === id;
              return (
                <div key={id} onClick={() => setTab(id)} className="flex items-center gap-2.5 cursor-pointer" style={{ height: 38, padding: "0 12px", borderRadius: 10, fontSize: 13.5, fontWeight: 500, marginBottom: 2, background: on ? "var(--color-primary-subtle)" : "transparent", color: on ? "var(--color-primary-ink)" : "var(--color-text-secondary)" }}>
                  <Icon name={icon} size={18} /> {label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={st.content}>
        {tab === "workspace" && <WorkspacePanel />}
        {tab === "channels" && <ChannelsPanel />}
        {tab === "team" && <TeamPanel />}
        {tab === "roles" && <RolesPanel />}
        {tab === "notifications" && <NotificationsPanel />}
        {tab === "hours" && <HoursPanel />}
        {tab === "billing" && <BillingPanel />}
      </div>
    </div>
  );
}
