// copilotEngine.ts — scripted heuristics for the agent AI assistant.
// Swap suggestReplies / rewrite for a real LLM call in production.

export type Tone = "friendly" | "formal" | "shorter" | "grammar";

export interface ConvMeta {
  name: string;
  channelLabel: string;
  inCount: number;
  outCount: number;
  firstCustomerMsg?: string;
  resolved?: boolean;
}

const REPLY_BANK: { kw: string[]; replies: string[] }[] = [
  { kw: ["pago", "tarjeta", "cobro", "rechaz", "declin"], replies: [
    "¡Lamento la molestia! Veo que el pago se rechazó porque se alcanzó tu límite diario — ya lo he ampliado, así que prueba de nuevo, por favor.",
    "Gracias por avisar. He revisado tu cuenta y quité el límite que bloqueaba el pago. Inténtalo otra vez y cuéntame cómo va.",
  ] },
  { kw: ["reembolso", "devoluc", "devolver", "dinero"], replies: [
    "Claro que sí — ya inicié tu reembolso. Suele reflejarse en tu tarjeta en 5 días hábiles. Lo dejo monitoreado de mi lado.",
    "Sin problema. He procesado el reembolso; recibirás un correo de confirmación en breve y los fondos en unos días hábiles.",
  ] },
  { kw: ["transferencia", "enviar dinero", "beneficiario"], replies: [
    "Con gusto te ayudo. Las transferencias internacionales pueden tardar hasta 3 días hábiles — veo que la tuya está en curso y va bien.",
    "Revisé la transferencia y se está procesando con normalidad. Recibirás una notificación en cuanto se complete.",
  ] },
  { kw: ["pin", "contraseña", "acceso", "bloquead", "login", "2fa"], replies: [
    "Vamos a recuperar tu acceso. Te envié un enlace seguro de restablecimiento a tu correo — válido por 30 minutos. Síguelo y quedarás listo.",
    "Por tu seguridad no puedo compartir el PIN aquí, pero puedes restablecerlo al instante desde Ajustes → Seguridad. Aquí sigo si necesitas ayuda.",
  ] },
];

const GENERIC_REPLIES = [
  "¡Gracias por escribirnos! Con gusto te ayudo con esto. ¿Podrías darme un poco más de detalle para revisarlo de inmediato?",
  "Entendido — me pongo con ello. Dame un momento para revisar tu cuenta y te respondo enseguida.",
];

export function suggestReplies(customerText: string): string[] {
  const text = customerText.toLowerCase();
  for (const g of REPLY_BANK) if (g.kw.some((k) => text.includes(k))) return g.replies;
  return GENERIC_REPLIES;
}

export function summarize(meta: ConvMeta): string[] {
  return [
    `${meta.name} escribió por ${meta.channelLabel}.`,
    `Motivo: ${meta.firstCustomerMsg || "sin mensaje inicial"}`,
    `${meta.inCount} mensaje${meta.inCount !== 1 ? "s" : ""} del cliente, ${meta.outCount} del equipo.`,
    meta.resolved ? "Estado: resuelto." : "Estado: abierto — a la espera de respuesta.",
  ];
}

export function rewrite(text: string, tone: Tone): string {
  const t = text.trim();
  if (!t) return t;
  if (tone === "formal")
    return "Estimado cliente:\n\n" + t.replace(/\bgracias\b/gi, "muchas gracias").replace(/!+/g, ".") + "\n\nUn cordial saludo,\nEquipo Wappy";
  if (tone === "friendly")
    return "¡Hola! 😊 " + t.replace(/\.$/, "") + " — ¡aquí estoy para lo que necesites!";
  if (tone === "shorter") {
    const s = t.split(/(?<=[.!?])\s+/);
    return s.slice(0, Math.max(1, Math.ceil(s.length / 2))).join(" ");
  }
  // grammar: capitalize, collapse spaces, space after punctuation
  return t.charAt(0).toUpperCase() + t.slice(1).replace(/\s+/g, " ").replace(/([.!?])([A-Za-zÁÉÍÓÚÑ])/g, "$1 $2");
}
