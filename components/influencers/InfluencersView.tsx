"use client";

import { useState } from "react";
import { RosterTab } from "./RosterTab";
import { BriefsTab } from "./BriefsTab";
import { ContractsTab } from "./ContractsTab";
import { DashboardTab } from "./DashboardTab";
import { AvailabilityTab } from "./AvailabilityTab";
import { CompareTab } from "./CompareTab";
import { PaymentsTab } from "./PaymentsTab";
import { Icon } from "@/components/ui/Icon";

type TabId = "tablero" | "roster" | "disponibilidad" | "comparar" | "cobros" | "briefs" | "contratos";

const TABS = [
  { id: "tablero", label: "Tablero", icon: "grid" },
  { id: "roster", label: "Roster", icon: "users" },
  { id: "disponibilidad", label: "Disponibilidad", icon: "calendar" },
  { id: "comparar", label: "Comparar", icon: "barChart3" },
  { id: "cobros", label: "Cobros", icon: "file" },
  { id: "briefs", label: "Briefs", icon: "fileText" },
  { id: "contratos", label: "Contratos", icon: "fileText" },
];

export function InfluencersView() {
  const [activeTab, setActiveTab] = useState<TabId>("tablero");

  return (
    <div className="p-7 overflow-hidden h-full flex flex-col">
      <div className="mb-6">
        <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
          Influencers
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
          CRM de creadores · métricas, roster, disponibilidad, comparación y pagos
        </p>
      </div>

      <div className="flex gap-1 mb-6 border-b overflow-x-auto" style={{ borderColor: "var(--color-border)" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className="px-4 py-3 text-[13px] font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap"
            style={{
              borderColor: activeTab === tab.id ? "var(--color-primary)" : "transparent",
              color: activeTab === tab.id ? "var(--color-primary)" : "var(--color-text-secondary)",
            }}
          >
            <Icon name={tab.icon as any} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "tablero" && <DashboardTab />}
        {activeTab === "roster" && <RosterTab onBriefClick={() => setActiveTab("briefs")} />}
        {activeTab === "disponibilidad" && <AvailabilityTab />}
        {activeTab === "comparar" && <CompareTab />}
        {activeTab === "cobros" && <PaymentsTab />}
        {activeTab === "briefs" && <BriefsTab />}
        {activeTab === "contratos" && <ContractsTab />}
      </div>
    </div>
  );
}
