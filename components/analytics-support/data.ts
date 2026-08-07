export type Range = "7 days" | "30 days" | "90 days";
export interface Kpi { id: string; label: string; value: string; delta: number; good?: "down"; spark: number[] }
export interface AgentRow { name: string; tint: "primary" | "success" | "warning"; convos: number; avg: string; csat: number; resolved: number }

export const CHAN_COLOR: Record<string, string> = { whatsapp: "#25D366", web: "#C7F303", email: "#5B6B7B", messenger: "#0A7CFF", instagram: "#E1306C" };
export const CHAN_LABEL: Record<string, string> = { whatsapp: "WhatsApp", web: "Widget web", email: "Email", messenger: "Messenger", instagram: "Instagram" };
export const A_TINT: Record<AgentRow["tint"], { bg: string; fg: string }> = {
  primary: { bg: "var(--color-primary-subtle)", fg: "var(--color-primary-ink)" },
  success: { bg: "var(--color-success-bg)", fg: "var(--color-success-dark)" },
  warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)" },
};

export const RANGES: Range[] = ["7 days", "30 days", "90 days"];
export const RANGE_LABEL: Record<Range, string> = { "7 days": "7 días", "30 days": "30 días", "90 days": "90 días" };
export const RANGE_TOTAL: Record<Range, string> = { "7 days": "1,3k", "30 days": "5,4k", "90 days": "16k" };

export const ANALYTICS = {
  kpis: {
    "7 days": [
      { id: "conv", label: "Conversaciones", value: "1,284", delta: +12.4, spark: [42, 50, 47, 63, 58, 71, 80] },
      { id: "resp", label: "1ª respuesta (mediana)", value: "2m 14s", delta: -8.1, good: "down", spark: [180, 172, 165, 150, 148, 140, 134] },
      { id: "res", label: "Resueltas", value: "1,209", delta: +9.7, spark: [38, 44, 41, 55, 52, 64, 72] },
      { id: "csat", label: "CSAT", value: "97%", delta: +1.2, spark: [94, 95, 95, 96, 96, 97, 97] },
    ],
    "30 days": [
      { id: "conv", label: "Conversaciones", value: "5,402", delta: +18.9, spark: [120, 140, 135, 160, 175, 168, 190, 210] },
      { id: "resp", label: "1ª respuesta (mediana)", value: "2m 40s", delta: -5.3, good: "down", spark: [200, 195, 188, 180, 176, 170, 165, 160] },
      { id: "res", label: "Resueltas", value: "5,021", delta: +15.2, spark: [110, 130, 128, 150, 165, 160, 182, 200] },
      { id: "csat", label: "CSAT", value: "96%", delta: +0.6, spark: [95, 95, 96, 96, 95, 96, 96, 96] },
    ],
    "90 days": [
      { id: "conv", label: "Conversaciones", value: "15,980", delta: +24.1, spark: [300, 340, 360, 400, 420, 460, 510, 560] },
      { id: "resp", label: "1ª respuesta (mediana)", value: "3m 02s", delta: -2.1, good: "down", spark: [220, 215, 210, 205, 198, 192, 188, 182] },
      { id: "res", label: "Resueltas", value: "14,712", delta: +21.0, spark: [280, 320, 340, 380, 400, 440, 490, 540] },
      { id: "csat", label: "CSAT", value: "96%", delta: +0.9, spark: [94, 95, 95, 96, 96, 96, 96, 96] },
    ],
  } as Record<Range, Kpi[]>,
  volume: {
    "7 days": { labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"], newC: [210, 245, 232, 268, 255, 140, 120], resolved: [190, 230, 225, 250, 248, 132, 118] },
    "30 days": { labels: ["S1", "S2", "S3", "S4"], newC: [1180, 1320, 1290, 1610], resolved: [1100, 1250, 1240, 1430] },
    "90 days": { labels: ["Abr", "May", "Jun"], newC: [4800, 5200, 5980], resolved: [4500, 4900, 5310] },
  } as Record<Range, { labels: string[]; newC: number[]; resolved: number[] }>,
  channels: [
    { ch: "whatsapp", value: 38 }, { ch: "web", value: 27 }, { ch: "email", value: 18 }, { ch: "messenger", value: 11 }, { ch: "instagram", value: 6 },
  ],
  responseDist: { labels: ["<1m", "1–5m", "5–15m", "15–60m", ">1h"], values: [620, 410, 168, 62, 24] },
  agents: [
    { name: "Ana García", tint: "success", convos: 412, avg: "1m 52s", csat: 98, resolved: 401 },
    { name: "Tú", tint: "primary", convos: 388, avg: "2m 04s", csat: 97, resolved: 372 },
    { name: "Carlos Ruiz", tint: "warning", convos: 305, avg: "2m 41s", csat: 95, resolved: 289 },
    { name: "Sofia Lind", tint: "primary", convos: 179, avg: "3m 12s", csat: 96, resolved: 147 },
  ] as AgentRow[],
};
