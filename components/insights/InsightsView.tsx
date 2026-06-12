"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { useInsights, useInsightsChat } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import { AI_TONE } from "@/lib/mocks/analyticsData";
import type { IconName } from "@/components/ui/Icon";
import { DemoBanner } from "@/components/ui/DemoBanner";

const AI_REPLIES: Record<string, string> = {
  default: "Analizando los datos de tu cuenta… El engagement orgánico de TikTok sigue siendo tu mayor oportunidad. Recomiendo aumentar la frecuencia de publicación de 3 a 5 videos semanales en el rango horario 19:00–21:00.",
  roas: "El ROAS de tus campañas de Google ha caído un 18% en las últimas 2 semanas. La causa probable es fatiga de creativos — los banners llevan más de 21 días activos. Te recomiendo rotar los assets y pausar 'Branding Q2' hasta tener nuevas piezas.",
  horario: "El análisis de las últimas 90 publicaciones muestra que los posts entre 19:00–21:00 obtienen 34% más engagement y 2.1× más saves que el promedio. Los miércoles y jueves son tus mejores días.",
};

function getReply(q: string): string {
  if (q.toLowerCase().includes("roas") || q.toLowerCase().includes("pauta")) return AI_REPLIES.roas;
  if (q.toLowerCase().includes("horario") || q.toLowerCase().includes("hora")) return AI_REPLIES.horario;
  return AI_REPLIES.default;
}

export function InsightsView() {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: insights = [] } = useInsights(brandId);
  const chatMutation = useInsightsChat(brandId);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<Array<{ from: "me" | "ai"; text: string }>>([]);
  const loading = chatMutation.isPending;

  const ask = () => {
    if (!question.trim()) return;
    const q = question.trim();
    setQuestion("");
    setChat((p) => [...p, { from: "me", text: q }]);
    chatMutation.mutate(q, {
      onSuccess: (res) => {
        const r = res as unknown as { content?: string; reply?: string };
        const content = r.content ?? r.reply ?? getReply(q);
        setChat((p) => [...p, { from: "ai", text: content }]);
      },
      onError: () => {
        setChat((p) => [...p, { from: "ai", text: getReply(q) }]);
      },
    });
  };

  return (
    <div className="p-7 overflow-y-auto h-full">
      <DemoBanner module="Insights IA" />
      {/* Header */}
      <div className="flex items-end gap-3 mb-6">
        <div
          className="flex items-center justify-center rounded-[14px]"
          style={{ width: 44, height: 44, background: "var(--color-brand-gradient)" }}
        >
          <Icon name="spark" size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--ff-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
            Insights AI · Think Tank
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Hallazgos y recomendaciones basados en tus datos
          </p>
        </div>
      </div>

      {/* AI question input */}
      <div
        className="fobo-card flex items-center gap-3 px-4 py-3 mb-6"
        style={{ background: "var(--color-primary-subtle)", border: "1px solid var(--color-primary-light)" }}
      >
        <Icon name="spark" size={18} color="var(--color-primary-ink)" />
        <input
          className="flex-1 bg-transparent border-none outline-none text-[14px]"
          style={{ fontFamily: "var(--ff-ui)", color: "var(--color-text-primary)" }}
          placeholder="Pregúntale a Fobo AI… ej: ¿cuándo es el mejor horario para publicar?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") ask(); }}
        />
        <button
          className="fobo-btn fobo-btn-primary fobo-btn-sm gap-1"
          onClick={ask}
          disabled={!question.trim() || loading}
        >
          <Icon name="send" size={14} /> Preguntar
        </button>
      </div>

      {/* Chat thread */}
      {chat.length > 0 && (
        <div className="fobo-card mb-6 overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>Conversación</div>
          </div>
          <div className="flex flex-col gap-3 p-4" style={{ background: "var(--color-background)" }}>
            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div style={{ maxWidth: "80%" }}>
                  {m.from === "ai" && (
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{ width: 20, height: 20, background: "var(--color-brand-gradient)" }}
                      >
                        <Icon name="spark" size={12} color="#fff" />
                      </div>
                      <span className="text-[11px] font-semibold" style={{ color: "var(--color-text-tertiary)" }}>Fobo AI</span>
                    </div>
                  )}
                  <div
                    className="px-4 py-3 text-[13.5px] leading-relaxed"
                    style={{
                      borderRadius: m.from === "me" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: m.from === "me" ? "var(--color-primary)" : "var(--color-surface)",
                      color: m.from === "me" ? "#fff" : "var(--color-text-primary)",
                      border: m.from === "me" ? "none" : "1px solid var(--color-border)",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: 20, height: 20, background: "var(--color-brand-gradient)" }}
                >
                  <Icon name="spark" size={12} color="#fff" />
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="rounded-full"
                      style={{ width: 6, height: 6, background: "var(--color-text-tertiary)" }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insight cards */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(2,1fr)" }}>
        {insights.map((ins, i) => {
          const tone = AI_TONE[ins.kind];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="fobo-card p-5 cursor-pointer"
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-2)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "")}
            >
              <div className="flex items-start gap-3 mb-3">
                <span
                  className="flex items-center justify-center rounded-[10px] flex-shrink-0"
                  style={{ width: 36, height: 36, background: tone.bg }}
                >
                  <Icon name={ins.icon as IconName} size={17} color={tone.color} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>
                    {ins.title}
                  </div>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>
                {ins.body}
              </p>
              <div
                className="flex items-center gap-2 pt-3"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                <Icon name="spark" size={13} color={tone.color} />
                <span className="text-[12.5px] font-medium flex-1" style={{ color: tone.color }}>
                  {ins.action}
                </span>
                <button className="fobo-btn fobo-btn-ghost fobo-btn-sm text-[12px]">Aplicar →</button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
