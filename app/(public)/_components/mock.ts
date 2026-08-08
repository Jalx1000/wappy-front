// Decorative microcopy shown inside the product mockups (inbox cards, phone
// screens, copilot bubbles). Kept separate from the marketing prose in
// content.ts. Proper names and channel names are shared across languages.
import type { Lang } from "./content";

export interface MockCopy {
  inbox: string;
  you: string;
  all: string;
  open: string;
  resolved: string;
  snoozed: string;
  suggested: string;
  ameliaMsgLong: string;
  ameliaMsgShort: string;
  marcoMsg: string;
  sofiaMsg: string;
  copilotBubble: string;
  copilotDraft: string;
  useReply: string;
  csatWeek: string;
  helloThere: string;
  howHelp: string;
  sendMsg: string;
}

export const MOCK: Record<Lang, MockCopy> = {
  es: {
    inbox: "Bandeja",
    you: "Tú",
    all: "Todos",
    open: "Abierto",
    resolved: "Resuelto",
    snoozed: "Pospuesto",
    suggested: "sugerido",
    ameliaMsgLong: "Mi pago con tarjeta se rechazó dos veces hoy…",
    ameliaMsgShort: "Pago con tarjeta rechazado…",
    marcoMsg: "¡Gracias, funcionó!",
    sofiaMsg: "Sigo esperando la transferencia…",
    copilotBubble: "Subí el límite que lo bloqueaba — inténtalo de nuevo 💚",
    copilotDraft:
      "¡Lamento el pago rechazado! Revisé tu cuenta y subí el límite que lo bloqueaba — inténtalo de nuevo.",
    useReply: "Usar respuesta",
    csatWeek: "CSAT esta semana",
    helloThere: "Hola 👋",
    howHelp: "¿Cómo podemos ayudar?",
    sendMsg: "Envíanos un mensaje",
  },
  en: {
    inbox: "Inbox",
    you: "You",
    all: "All",
    open: "Open",
    resolved: "Resolved",
    snoozed: "Snoozed",
    suggested: "suggested",
    ameliaMsgLong: "My card payment was declined twice today…",
    ameliaMsgShort: "Card payment declined…",
    marcoMsg: "Thanks, that worked!",
    sofiaMsg: "Still waiting on transfer…",
    copilotBubble: "I've raised the limit that was blocking it — please try again 💚",
    copilotDraft:
      "I'm sorry about the declined payment! I've checked your account and raised the limit that was blocking it — please try again.",
    useReply: "Use reply",
    csatWeek: "CSAT this week",
    helloThere: "Hi there 👋",
    howHelp: "How can we help?",
    sendMsg: "Send us a message",
  },
};
