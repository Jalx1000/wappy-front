import type { IconName } from "@/components/ui/Icon";

export type BotNodeType = "trigger" | "message" | "question" | "condition" | "action" | "article" | "end";
export type BotColor = "primary" | "success" | "warning" | "neutral";

export interface BotNodeTypeDef {
  id: BotNodeType;
  label: string;
  icon: IconName;
  color: BotColor;
  outputs: string[];
  fixed?: boolean;
}

export const BOT_NODE_TYPES: Record<BotNodeType, BotNodeTypeDef> = {
  trigger:   { id: "trigger",   label: "Disparador", icon: "rocket",        color: "neutral", outputs: ["out"], fixed: true },
  message:   { id: "message",   label: "Mensaje",    icon: "messageCircle", color: "primary", outputs: ["out"] },
  question:  { id: "question",  label: "Pregunta",   icon: "helpCircle",    color: "warning", outputs: [] },
  condition: { id: "condition", label: "Condición",  icon: "filter",        color: "success", outputs: ["true", "false"] },
  action:    { id: "action",    label: "Asignar",    icon: "userPlus",      color: "primary", outputs: ["out"] },
  article:   { id: "article",   label: "Artículo",   icon: "book",          color: "primary", outputs: ["out"] },
  end:       { id: "end",       label: "Fin",        icon: "check",         color: "neutral", outputs: [] },
};

export const BOT_NODE_PALETTE: BotNodeType[] = ["message", "question", "condition", "action", "article", "end"];

export const BOT_NODE_TINT: Record<BotColor, { bg: string; fg: string; line: string }> = {
  primary: { bg: "var(--color-primary-subtle)", fg: "var(--color-primary-ink)", line: "var(--color-primary)" },
  success: { bg: "var(--color-success-bg)", fg: "var(--color-success-dark)", line: "var(--color-success)" },
  warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)", line: "var(--color-warning)" },
  neutral: { bg: "var(--neutral-200)", fg: "var(--color-text-secondary)", line: "var(--neutral-400)" },
};

export const PORT_LABEL: Record<string, string> = { out: "Siguiente", true: "Sí", false: "No" };

export interface QuestionOption { id: string; label: string; to: string | null }

export interface FlowNode {
  id: string;
  type: BotNodeType;
  x: number;
  y: number;
  title: string;
  body?: string;
  options?: QuestionOption[];
  field?: string;
  operator?: "eq" | "contains";
  value?: string;
}

export interface Edge { from: string; out: string; to: string }

export interface Flow {
  id: string;
  name: string;
  trigger: string;
  active: boolean;
  updated: string;
  replies: number;
  nodes: FlowNode[];
  edges: Edge[];
}

export const BOT_FLOWS: Flow[] = [
  {
    id: "flow_triage", name: "Triaje de soporte", trigger: "conversation_started", active: true, updated: "2 jun 2026", replies: 1840,
    nodes: [
      { id: "n_trigger", type: "trigger", x: 60, y: 200, title: "Conversación iniciada", body: "Cuando un visitante abre el chat" },
      { id: "n_welcome", type: "message", x: 320, y: 200, title: "Bienvenida", body: "¡Hola! 👋 Soy el bot de Wappy. ¿Con qué necesitas ayuda?" },
      { id: "n_ask", type: "question", x: 600, y: 180, title: "Preguntar tema", body: "Elige un tema:", options: [
        { id: "o_pay", label: "Pagos", to: "n_cond" },
        { id: "o_acct", label: "Mi cuenta", to: "n_article" },
        { id: "o_human", label: "Hablar con una persona", to: "n_assign" },
      ] },
      { id: "n_cond", type: "condition", x: 900, y: 80, title: "¿Es VIP?", field: "contact.plan", operator: "eq", value: "Metal" },
      { id: "n_article", type: "article", x: 900, y: 300, title: "Enviar artículo", body: "Activar la verificación en dos pasos" },
      { id: "n_assign", type: "action", x: 900, y: 460, title: "Asignar a agente", body: "Enrutar al equipo de soporte" },
      { id: "n_vip", type: "message", x: 1180, y: 30, title: "Respuesta VIP", body: "Eres cliente prioritario — te conecto ahora mismo." },
      { id: "n_end", type: "end", x: 1180, y: 200, title: "Fin", body: "" },
    ],
    edges: [
      { from: "n_trigger", out: "out", to: "n_welcome" },
      { from: "n_welcome", out: "out", to: "n_ask" },
      { from: "n_cond", out: "true", to: "n_vip" },
      { from: "n_cond", out: "false", to: "n_assign" },
      { from: "n_article", out: "out", to: "n_end" },
      { from: "n_vip", out: "out", to: "n_assign" },
    ],
  },
  {
    id: "flow_hours", name: "Fuera de horario", trigger: "always", active: false, updated: "20 may 2026", replies: 410,
    nodes: [
      { id: "h_trigger", type: "trigger", x: 60, y: 160, title: "Conversación iniciada", body: "Fuera del horario de oficina" },
      { id: "h_msg", type: "message", x: 320, y: 160, title: "Mensaje de ausencia", body: "¡Gracias por escribir! Ahora estamos desconectados y responderemos por la mañana." },
      { id: "h_end", type: "end", x: 600, y: 160, title: "Fin", body: "" },
    ],
    edges: [
      { from: "h_trigger", out: "out", to: "h_msg" },
      { from: "h_msg", out: "out", to: "h_end" },
    ],
  },
];
