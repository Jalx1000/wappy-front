"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { useCompaniesStore, PLAN_META, type Company } from "@/store/companies";

const GRID = "34px 2.2fr 1.1fr 1fr 0.8fr 1fr 0.9fr";

const initials = (s: string) => s.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
const money = (n: number) => (n > 0 ? "$" + n.toLocaleString() : "—");

const colHead = { fontSize: 11, fontWeight: 600 as const, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: "var(--color-text-tertiary)" };

export function CompaniesView() {
  const companies = useCompaniesStore((s) => s.companies);
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("Todas");
  const [selId, setSelId] = useState<string | undefined>(undefined);

  const industries = useMemo(() => ["Todas", ...Array.from(new Set(companies.map((c) => c.industry)))], [companies]);
  const filtered = useMemo(() => companies.filter((c) => {
    if (industry !== "Todas" && c.industry !== industry) return false;
    if (query.trim()) { const q = query.toLowerCase(); return c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q); }
    return true;
  }), [companies, industry, query]);

  const selected = filtered.find((c) => c.id === selId) ?? filtered[0];

  return (
    <div className="h-full overflow-hidden" style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr" }}>
      {/* List pane */}
      <div className="flex flex-col min-h-0" style={{ background: "var(--color-background)" }}>
        {/* Header */}
        <div className="flex-none" style={{ padding: "18px 24px 0", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          <div style={{ paddingBottom: 12 }}><DemoBanner module="Empresas" /></div>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 14 }}>
            <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>Empresas</h1>
            <Badge variant="neutral">{companies.length}</Badge>
            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2" style={{ height: 36, background: "var(--color-background)", borderRadius: 10, padding: "0 12px", minWidth: 200 }}>
                <Icon name="search" size={16} style={{ color: "var(--color-text-tertiary)" }} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar empresa o dominio…"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-primary)" }} />
              </div>
            </div>
          </div>
          <div className="flex gap-1 flex-wrap" style={{ paddingBottom: 12 }}>
            {industries.map((ind) => (
              <button key={ind} onClick={() => setIndustry(ind)}
                className={"fobo-badge " + (industry === ind ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary-ink)]" : "bg-[var(--neutral-200)] text-[var(--color-text-secondary)]")}
                style={{ height: 30, padding: "0 12px", fontSize: 12, cursor: "pointer", border: "none" }}>{ind}</button>
            ))}
          </div>
        </div>

        {/* Column header */}
        <div className="grid items-center flex-none" style={{ gridTemplateColumns: GRID, gap: 12, padding: "9px 24px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          <span />
          {["Empresa", "Industria", "Plan", "Asientos", "MRR", "Contactos"].map((h) => <div key={h} style={colHead}>{h}</div>)}
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto" style={{ background: "var(--color-surface)" }}>
          {filtered.map((c) => {
            const on = selected?.id === c.id;
            return (
              <div key={c.id} onClick={() => setSelId(c.id)} className="grid items-center cursor-pointer"
                style={{ gridTemplateColumns: GRID, gap: 12, padding: "12px 24px", borderBottom: "1px solid var(--color-border)", background: on ? "var(--color-primary-subtle)" : "transparent" }}
                onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = "var(--neutral-50)"; }}
                onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = "transparent"; }}>
                <span className="flex items-center justify-center rounded-[9px] flex-none text-[11px] font-bold" style={{ width: 32, height: 32, background: "var(--color-secondary-subtle)", color: "var(--color-secondary-ink)" }}>{initials(c.name)}</span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{c.name}</div>
                  <div className="text-[11.5px] truncate" style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>{c.domain}</div>
                </div>
                <div className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>{c.industry}</div>
                <div><Badge variant={PLAN_META[c.plan].variant}>{c.plan}</Badge></div>
                <div className="tnum text-[13px]" style={{ color: "var(--color-text-primary)" }}>{c.seats}</div>
                <div className="tnum text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>{money(c.mrr)}</div>
                <div className="flex items-center gap-1.5 text-[13px]" style={{ color: "var(--color-text-secondary)" }}><Icon name="users" size={14} style={{ color: "var(--color-text-tertiary)" }} /> {c.people.length}</div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center" style={{ padding: "64px 0", color: "var(--color-text-tertiary)" }}>
              <div className="inline-flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 9999, background: "var(--neutral-100)", marginBottom: 14 }}><Icon name="building" size={26} style={{ color: "var(--color-text-tertiary)" }} /></div>
              <div className="text-[15px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>Sin empresas</div>
              <div className="text-[13px] mt-1">Prueba otra búsqueda o filtro.</div>
            </div>
          )}
        </div>
      </div>

      {/* Detail pane */}
      {selected && <CompanyDetail company={selected} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px]" style={{ border: "1px solid var(--color-border)", background: "var(--color-background)", padding: "10px 12px" }}>
      <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{label}</div>
      <div className="text-[15px] font-semibold tnum" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>{value}</div>
    </div>
  );
}

function CompanyDetail({ company }: { company: Company }) {
  return (
    <div className="flex flex-col min-h-0 overflow-y-auto" style={{ borderLeft: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center rounded-[12px] flex-none text-[15px] font-bold" style={{ width: 48, height: 48, background: "var(--color-secondary-subtle)", color: "var(--color-secondary-ink)" }}>{initials(company.name)}</span>
          <div className="min-w-0">
            <div className="text-[17px] font-semibold truncate" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>{company.name}</div>
            <a href={`https://${company.domain}`} target="_blank" rel="noreferrer" className="text-[12.5px] truncate flex items-center gap-1" style={{ color: "var(--color-primary-ink)", fontFamily: "var(--font-mono)" }}>
              <Icon name="link" size={12} /> {company.domain}
            </a>
          </div>
        </div>
        <div style={{ marginTop: 14 }}><Badge variant={PLAN_META[company.plan].variant}>Plan {company.plan}</Badge></div>
      </div>

      <div className="flex flex-col gap-4" style={{ padding: 18 }}>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="MRR" value={money(company.mrr)} />
          <Stat label="Asientos" value={String(company.seats)} />
          <Stat label="Ubicación" value={company.location} />
          <Stat label="Cliente desde" value={company.since} />
        </div>

        {/* Atributos */}
        <div className="rounded-[14px]" style={{ border: "1px solid var(--color-border)", background: "var(--color-background)", padding: "14px 16px" }}>
          <div className="text-[11px] font-bold uppercase mb-2" style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>Atributos</div>
          {[["Industria", company.industry], ["Dominio", company.domain]].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-1.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <span className="text-[12.5px]" style={{ color: "var(--color-text-tertiary)" }}>{k}</span>
              <span className="text-[13px]" style={{ color: "var(--color-text-primary)" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Personas asociadas */}
        <div className="rounded-[14px]" style={{ border: "1px solid var(--color-border)", background: "var(--color-background)", padding: "14px 16px" }}>
          <div className="text-[11px] font-bold uppercase mb-3" style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>Personas ({company.people.length})</div>
          <div className="flex flex-col gap-2">
            {company.people.map((p) => (
              <div key={p.email} className="flex items-center gap-2.5">
                <span className="flex items-center justify-center rounded-full flex-none text-[10px] font-bold" style={{ width: 30, height: 30, background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}>{initials(p.name)}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{p.name}</div>
                  <div className="text-[11.5px] truncate" style={{ color: "var(--color-text-tertiary)" }}>{p.role} · {p.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
