"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useReport } from "@/lib/hooks";
import type {
  ReportData,
  ReportKpi,
  ReportNetworkSection,
  ReportTopPost,
} from "@/lib/api/reports";

// ── formatters ──────────────────────────────────────────────────────────────
function fmtNumber(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(".", ",")} mill.`;
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1).replace(".", ",")} mil`;
  return new Intl.NumberFormat("es-BO").format(Math.round(v));
}
function fmtKpi(k: ReportKpi): string {
  if (k.unit === "currency") return `$${new Intl.NumberFormat("es-BO").format(Math.round(k.value))}`;
  if (k.unit === "percent") return `${k.value.toString().replace(".", ",")}%`;
  return fmtNumber(k.value);
}

const BLUE = "#0D5CA6";
const BLUE_GRAD = "linear-gradient(135deg, #0a4d8c 0%, #1aa6c4 100%)";

// ── small sparkline ─────────────────────────────────────────────────────────
function Sparkline({ data, color = BLUE }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return <div style={{ height: 38 }} />;
  const w = 150;
  const h = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Delta({ pct, goodDown = false }: { pct?: number | null; goodDown?: boolean }) {
  if (pct == null) return null;
  const positive = goodDown ? pct < 0 : pct >= 0;
  const col = positive ? "var(--color-success)" : "var(--color-error)";
  return (
    <span className="inline-flex items-center gap-[2px] text-[12px] font-semibold" style={{ color: col }}>
      <Icon name={pct >= 0 ? "arrowUp" : "arrowDown"} size={12} />
      {Math.abs(pct).toString().replace(".", ",")}%
    </span>
  );
}

// ── KPI card (deck style: big number + delta + trend) ───────────────────────
function KpiCard({ kpi, goodDown }: { kpi: ReportKpi; goodDown?: boolean }) {
  return (
    <div className="fobo-card px-5 py-4 print:page-break-inside-avoid">
      <div className="text-[12px] font-medium mb-1" style={{ color: "var(--color-text-tertiary)" }}>
        {kpi.label}
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-[26px] font-bold leading-none" style={{ color: "var(--color-text-primary)" }}>
          {fmtKpi(kpi)}
        </div>
        <Delta pct={kpi.deltaPct} goodDown={goodDown} />
      </div>
      {kpi.series && kpi.series.length > 1 ? (
        <Sparkline data={kpi.series.map((s) => s.value)} />
      ) : (
        <div style={{ height: 40 }} />
      )}
    </div>
  );
}

// ── section heading ─────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[20px] font-bold uppercase mb-5 pb-2 inline-block"
      style={{ color: BLUE, letterSpacing: "-0.01em", borderBottom: `3px solid ${BLUE}` }}
    >
      {children}
    </h2>
  );
}

function Page({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`report-page px-10 py-9 ${className}`}>{children}</section>;
}

// ── covers ──────────────────────────────────────────────────────────────────
function Cover({ data }: { data: ReportData }) {
  return (
    <section
      className="report-page report-fill flex flex-col justify-center px-14"
      style={{ background: BLUE_GRAD, minHeight: 520, position: "relative", overflow: "hidden" }}
    >
      <div
        aria-hidden
        className="absolute select-none"
        style={{ right: -20, bottom: -60, fontSize: 260, fontWeight: 800, color: "rgba(255,255,255,0.08)", lineHeight: 1, fontFamily: "var(--ff-display)" }}
      >
        fobo
      </div>
      <div style={{ position: "relative" }}>
        <div className="text-white/80 text-[15px] font-semibold tracking-widest mb-3">FOBO · AGENCY</div>
        <div className="text-white font-bold leading-tight" style={{ fontFamily: "var(--ff-display)", fontSize: 46, letterSpacing: "-0.02em" }}>
          {data.brand.name}
        </div>
        <div className="text-white text-[22px] font-bold mt-6 tracking-wide">INFORME DE RESULTADOS</div>
        <div className="text-white/85 text-[16px] mt-1">{data.period.label}</div>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section
      className="report-page report-fill flex items-center justify-center"
      style={{ background: BLUE_GRAD, minHeight: 360, position: "relative", overflow: "hidden" }}
    >
      <div className="text-white font-bold" style={{ fontFamily: "var(--ff-display)", fontSize: 44 }}>
        ¡Gracias!
      </div>
    </section>
  );
}

// ── executive summary ───────────────────────────────────────────────────────
function Executive({ data }: { data: ReportData }) {
  const { executive } = data;
  return (
    <Page>
      <SectionTitle>Resumen Ejecutivo</SectionTitle>
      {executive.kpis.length > 0 && (
        <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(executive.kpis.length, 4)}, 1fr)` }}>
          {executive.kpis.slice(0, 4).map((k) => (
            <div key={k.key} className="fobo-card px-4 py-3">
              <div className="text-[11px] font-medium mb-1" style={{ color: "var(--color-text-tertiary)" }}>{k.label}</div>
              <div className="text-[22px] font-bold" style={{ color: "var(--color-text-primary)" }}>{fmtKpi(k)}</div>
            </div>
          ))}
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {executive.narrative.map((line, i) => (
          <li key={i} className="flex gap-2 text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
            <span style={{ color: BLUE, fontWeight: 700 }}>•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </Page>
  );
}

function PostsTable({ rows }: { rows: ReportData["executive"]["postsTable"] }) {
  if (!rows.length) return null;
  const cols = [
    { key: "fecha", label: "Fecha" },
    { key: "formato", label: "Formato" },
    { key: "alcance", label: "Alcance" },
    { key: "interacciones", label: "Interacc." },
    { key: "likes", label: "Me gusta" },
    { key: "comentarios", label: "Coment." },
    { key: "compartidos", label: "Comp." },
    { key: "guardados", label: "Guard." },
  ];
  return (
    <Page>
      <SectionTitle>Detalle de Publicaciones</SectionTitle>
      <div className="fobo-card overflow-hidden">
        <table className="w-full text-[12px]" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: BLUE }}>
              {cols.map((c) => (
                <th key={c.key} className="text-left px-3 py-2 text-white font-semibold text-[11px] uppercase">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                {cols.map((c) => (
                  <td key={c.key} className="px-3 py-[7px]" style={{ color: "var(--color-text-secondary)" }}>
                    {typeof r[c.key] === "number" ? new Intl.NumberFormat("es-BO").format(r[c.key] as number) : (r[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}

// ── social network section ──────────────────────────────────────────────────
function NetworkSection({ net }: { net: ReportNetworkSection }) {
  return (
    <Page>
      <SectionTitle>Desempeño {net.label}</SectionTitle>
      {net.handle && (
        <div className="text-[13px] mb-4 -mt-3" style={{ color: "var(--color-text-tertiary)" }}>@{net.handle}</div>
      )}
      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: `repeat(${Math.min(net.kpis.length, 4)}, 1fr)` }}>
        {net.kpis.slice(0, 4).map((k) => (
          <KpiCard key={k.key} kpi={k} />
        ))}
      </div>
      {net.kpis.length > 4 && (
        <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: `repeat(${Math.min(net.kpis.length - 4, 4)}, 1fr)` }}>
          {net.kpis.slice(4, 8).map((k) => (
            <KpiCard key={k.key} kpi={k} />
          ))}
        </div>
      )}
      {net.note && (
        <div className="fobo-card px-5 py-4 text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
          <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>Comentarios: </span>
          {net.note}
        </div>
      )}
    </Page>
  );
}

function PostCard({ post }: { post: ReportTopPost }) {
  const eng = post.metrics?.engagement ?? 0;
  return (
    <div className="fobo-card overflow-hidden print:page-break-inside-avoid">
      <div style={{ aspectRatio: "1 / 1", background: "var(--color-background)", position: "relative", overflow: "hidden" }}>
        {post.mediaUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.mediaUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
          />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ color: "var(--color-text-tertiary)" }}>
            <Icon name="image" size={28} />
          </div>
        )}
      </div>
      <div className="px-3 py-2">
        {post.channel && <div className="text-[10.5px] font-semibold uppercase mb-1" style={{ color: BLUE }}>{post.channel}</div>}
        <div className="text-[12px] line-clamp-2 mb-1" style={{ color: "var(--color-text-secondary)" }}>{post.caption ?? "—"}</div>
        <div className="text-center text-[12px] font-bold py-1 rounded" style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}>
          {fmtNumber(eng)} interacciones
        </div>
      </div>
    </div>
  );
}

function TopContent({ networks }: { networks: ReportNetworkSection[] }) {
  const posts = networks
    .flatMap((n) => n.topPosts)
    .sort((a, b) => (b.metrics?.engagement ?? 0) - (a.metrics?.engagement ?? 0))
    .slice(0, 8);
  if (!posts.length) return null;
  return (
    <Page>
      <SectionTitle>Análisis de Contenidos</SectionTitle>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {posts.map((p) => (
          <PostCard key={`${p.channel}-${p.externalId}`} post={p} />
        ))}
      </div>
    </Page>
  );
}

// ── web ─────────────────────────────────────────────────────────────────────
function WebSection({ web }: { web: NonNullable<ReportData["web"]> }) {
  const maxSrc = Math.max(1, ...web.sources.map((s) => s.value));
  const maxCty = Math.max(1, ...web.countries.map((c) => c.sessions));
  return (
    <Page>
      <SectionTitle>Desempeño Web · GA4</SectionTitle>
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(web.kpis.length, 4)}, 1fr)` }}>
        {web.kpis.slice(0, 4).map((k) => (
          <KpiCard key={k.key} kpi={k} />
        ))}
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className="fobo-card px-5 py-4">
          <div className="text-[13px] font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>Fuentes de tráfico</div>
          {web.sources.slice(0, 6).map((s) => (
            <div key={s.label} className="mb-2">
              <div className="flex justify-between text-[12px] mb-1" style={{ color: "var(--color-text-secondary)" }}>
                <span className="truncate">{s.label}</span>
                <span className="font-semibold">{new Intl.NumberFormat("es-BO").format(s.value)}</span>
              </div>
              <div style={{ height: 6, borderRadius: 4, background: "var(--color-background)" }}>
                <div className="report-fill" style={{ height: 6, borderRadius: 4, width: `${(s.value / maxSrc) * 100}%`, background: BLUE }} />
              </div>
            </div>
          ))}
        </div>
        <div className="fobo-card px-5 py-4">
          <div className="text-[13px] font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>Top países</div>
          {web.countries.slice(0, 6).map((c) => (
            <div key={c.country} className="mb-2">
              <div className="flex justify-between text-[12px] mb-1" style={{ color: "var(--color-text-secondary)" }}>
                <span className="truncate">{c.country}</span>
                <span className="font-semibold">{new Intl.NumberFormat("es-BO").format(c.sessions)}</span>
              </div>
              <div style={{ height: 6, borderRadius: 4, background: "var(--color-background)" }}>
                <div className="report-fill" style={{ height: 6, borderRadius: 4, width: `${(c.sessions / maxCty) * 100}%`, background: "#1aa6c4" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

// ── ads ─────────────────────────────────────────────────────────────────────
function AdsSection({ ads }: { ads: NonNullable<ReportData["ads"]> }) {
  return (
    <Page>
      <SectionTitle>Paid Media · Ads</SectionTitle>
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(ads.kpis.length, 5)}, 1fr)` }}>
        {ads.kpis.slice(0, 5).map((k) => (
          <KpiCard key={k.key} kpi={k} goodDown={k.key === "cpa"} />
        ))}
      </div>
      {ads.campaigns.length > 0 && (
        <div className="fobo-card overflow-hidden">
          <table className="w-full text-[12px]" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: BLUE }}>
                {["Campaña", "Estado", "Inversión", "Impresiones", "Clics", "CTR", "Conv."].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-white font-semibold text-[11px] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ads.campaigns.slice(0, 12).map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <td className="px-3 py-[7px] font-medium" style={{ color: "var(--color-text-primary)" }}>{c.name}</td>
                  <td className="px-3 py-[7px]" style={{ color: "var(--color-text-secondary)" }}>{c.status ?? "—"}</td>
                  <td className="px-3 py-[7px]" style={{ color: "var(--color-text-secondary)" }}>${new Intl.NumberFormat("es-BO").format(Number(c.spend))}</td>
                  <td className="px-3 py-[7px]" style={{ color: "var(--color-text-secondary)" }}>{new Intl.NumberFormat("es-BO").format(Number(c.impressions))}</td>
                  <td className="px-3 py-[7px]" style={{ color: "var(--color-text-secondary)" }}>{new Intl.NumberFormat("es-BO").format(Number(c.clicks))}</td>
                  <td className="px-3 py-[7px]" style={{ color: "var(--color-text-secondary)" }}>{String(c.ctr).replace(".", ",")}%</td>
                  <td className="px-3 py-[7px]" style={{ color: "var(--color-text-secondary)" }}>{new Intl.NumberFormat("es-BO").format(Number(c.conversions))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}

function Conclusions({ items }: { items: string[] }) {
  return (
    <Page>
      <SectionTitle>Conclusiones</SectionTitle>
      <ul className="flex flex-col gap-3">
        {items.map((line, i) => (
          <li key={i} className="flex gap-2 text-[15px]" style={{ color: "var(--color-text-secondary)" }}>
            <span style={{ color: BLUE, fontWeight: 700 }}>•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </Page>
  );
}

// ── main ────────────────────────────────────────────────────────────────────
export function ReportDocument({ id }: { id: number }) {
  const router = useRouter();
  const { data: report, isLoading } = useReport(id);

  const status = report?.status;
  const data = report?.data ?? null;

  return (
    <div className="h-full overflow-y-auto" style={{ background: "var(--color-background)" }}>
      {/* Action bar (not printed) */}
      <div
        className="print:hidden sticky top-0 z-10 flex items-center gap-3 px-7 py-3"
        style={{ background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}
      >
        <button className="fobo-btn fobo-btn-ghost fobo-btn-sm flex items-center gap-1" onClick={() => router.push("/app/reports")}>
          <Icon name="chevronL" size={15} /> Volver
        </button>
        <div className="font-semibold text-[15px]" style={{ color: "var(--color-text-primary)" }}>
          {data ? `Reporte · ${data.brand.name}` : "Reporte"}
        </div>
        <div className="ml-auto">
          <button
            className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1"
            onClick={() => window.print()}
            disabled={status !== "ready"}
          >
            <Icon name="download" size={15} /> Descargar PDF
          </button>
        </div>
      </div>

      {(isLoading || status === "pending" || status === "processing") && (
        <div className="flex flex-col items-center justify-center gap-3 py-32" style={{ color: "var(--color-text-tertiary)" }}>
          <Icon name="refresh" size={28} className="animate-spin" />
          <div className="text-[14px]">Generando reporte… recopilando datos de todas las redes.</div>
        </div>
      )}

      {status === "failed" && (
        <div className="flex flex-col items-center justify-center gap-2 py-32">
          <Icon name="warning" size={28} style={{ color: "var(--color-error)" }} />
          <div className="text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
            No se pudo generar el reporte. {report?.errorMessage}
          </div>
        </div>
      )}

      {status === "ready" && data && (
        <div className="mx-auto my-6" style={{ maxWidth: 1040, background: "var(--color-surface)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-2)" }}>
          <Cover data={data} />
          <Executive data={data} />
          {data.executive.postsTable.length > 0 && <PostsTable rows={data.executive.postsTable} />}
          {data.social?.networks.map((net) => <NetworkSection key={net.channel} net={net} />)}
          {data.social && <TopContent networks={data.social.networks} />}
          {data.web && <WebSection web={data.web} />}
          {data.ads && <AdsSection ads={data.ads} />}
          <Conclusions items={data.conclusions} />
          <Closing />
        </div>
      )}
    </div>
  );
}
