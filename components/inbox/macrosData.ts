export interface Macro {
  id: string;
  shortcut: string;
  title: string;
  category: string;
  body: string;
}

export const MACRO_CATEGORIES = ["General", "Pagos", "Cierre", "Cuenta", "Técnico"];

export const DEFAULT_MACROS: Macro[] = [
  { id: "m1", shortcut: "saludo", title: "Saludo cordial", category: "General",
    body: "¡Hola {{contact.firstName}}! 👋 Gracias por escribir a Wappy. ¿En qué puedo ayudarte hoy?" },
  { id: "m2", shortcut: "rechazo", title: "Pago rechazado", category: "Pagos",
    body: "Hola {{contact.firstName}}, lamento el pago rechazado. Revisé tu cuenta {{contact.plan}} y amplié el límite que lo bloqueaba — inténtalo de nuevo y cuéntame cómo va." },
  { id: "m3", shortcut: "reembolso", title: "Reembolso iniciado", category: "Pagos",
    body: "Buenas noticias {{contact.firstName}} — inicié tu reembolso. Suele reflejarse en tu tarjeta en 5 días hábiles. Recibirás una confirmación por correo en breve." },
  { id: "m4", shortcut: "transferencia", title: "Tiempos de transferencia", category: "Pagos",
    body: "¡Gracias por tu paciencia! Las transferencias internacionales pueden tardar hasta 3 días hábiles. Veo que la tuya se procesa con normalidad." },
  { id: "m5", shortcut: "resuelto", title: "Cierre — resuelto", category: "Cierre",
    body: "¡Me alegra haber ayudado, {{contact.firstName}}! Cierro por ahora, pero escríbeme cuando quieras y lo retomamos. ¡Buen día! 💚 — {{agent.name}}" },
  { id: "m6", shortcut: "espera", title: "Un momento", category: "General",
    body: "Gracias {{contact.firstName}} — dame solo un momento mientras lo reviso para ti." },
];

export interface FillContext {
  name?: string | null;
  plan?: string | null;
  email?: string | null;
}

/** Interpolate {{contact.x}} / {{agent.x}} tokens against the live conversation. */
export function fillVars(body: string, ctx: FillContext, agentName?: string | null): string {
  const firstName = (ctx.name || "").trim().split(/\s+/)[0] || "";
  const map: Record<string, string> = {
    "contact.firstName": firstName || "",
    "contact.name": ctx.name || "",
    "contact.plan": ctx.plan || "tu",
    "contact.email": ctx.email || "",
    "agent.name": agentName && agentName !== "Tú" ? agentName : "el equipo de Wappy",
  };
  return body.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k: string) => (map[k] != null ? map[k] : m));
}

export const MACRO_VARS = ["contact.firstName", "contact.name", "contact.plan", "agent.name"];
