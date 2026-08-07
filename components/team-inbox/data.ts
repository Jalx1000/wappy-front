import type { BadgeVariant } from "@/components/ui/Badge";

export interface Agent {
  id: string;
  name: string;
  role: string;
  online: boolean;
  tint: [string, string];
}

export type ConvoStatus = "Abierta" | "Resuelta" | "Pospuesta";

export interface TeamConvo {
  id: string;
  name: string;
  initials: string;
  channel: string;
  preview: string;
  status: ConvoStatus;
  assignee: string | null; // agent name, or null = unassigned
}

export const AGENTS: Agent[] = [
  { id: "ana",   name: "Ana García",   role: "Agente sénior", online: true,  tint: ["var(--color-success-bg)", "var(--color-success-dark)"] },
  { id: "marco", name: "Marco Rossi",  role: "Agente",        online: true,  tint: ["#E3F0FF", "#0A5BD0"] },
  { id: "sofia", name: "Sofia Petrova", role: "Agente",       online: false, tint: ["#FCE3EE", "#C01E5B"] },
  { id: "you",   name: "Tú",           role: "Agente de soporte", online: true, tint: ["var(--color-primary-subtle)", "var(--color-primary-ink)"] },
];

export const CHANNEL_COLOR: Record<string, string> = {
  whatsapp: "#25D366",
  messenger: "#0A7CFF",
  instagram: "#E1306C",
  email: "#5B6B7B",
  web: "var(--color-primary-ink)",
};

export const STATUS_VARIANT: Record<ConvoStatus, BadgeVariant> = {
  Abierta: "primary",
  Resuelta: "success",
  Pospuesta: "warning",
};

export const TEAM_CONVOS: TeamConvo[] = [
  { id: "c1",  name: "Amelia Wright",  initials: "AW", channel: "whatsapp",  preview: "Mi pago se rechazó al pagar…", status: "Abierta",   assignee: "Tú" },
  { id: "c2",  name: "Liam O'Brien",   initials: "LO", channel: "email",     preview: "¿Cuándo llega mi tarjeta física?", status: "Abierta", assignee: "Tú" },
  { id: "c3",  name: "Sofía Ruiz",     initials: "SR", channel: "instagram", preview: "Quiero un reembolso del pedido…", status: "Pospuesta", assignee: "Ana García" },
  { id: "c4",  name: "Marco Rossi",    initials: "MR", channel: "whatsapp",  preview: "La transferencia sigue pendiente", status: "Abierta", assignee: "Ana García" },
  { id: "c5",  name: "Chen Wei",       initials: "CW", channel: "messenger", preview: "No puedo iniciar sesión en la app", status: "Abierta", assignee: "Marco Rossi" },
  { id: "c6",  name: "Nadia Haddad",   initials: "NH", channel: "web",       preview: "¿Tienen plan para empresas?", status: "Resuelta", assignee: "Marco Rossi" },
  { id: "c7",  name: "Tom Becker",     initials: "TB", channel: "whatsapp",  preview: "Gracias por la ayuda de ayer 🙏", status: "Resuelta", assignee: "Sofia Petrova" },
  { id: "c8",  name: "Priya Nair",     initials: "PN", channel: "email",     preview: "Duplicaron un cargo en mi cuenta", status: "Abierta", assignee: null },
  { id: "c9",  name: "Diego Álvarez",  initials: "DA", channel: "instagram", preview: "¿Cómo cambio mi PIN?",           status: "Abierta", assignee: null },
  { id: "c10", name: "Emma Johansson", initials: "EJ", channel: "whatsapp",  preview: "Mi cuenta aparece bloqueada",    status: "Abierta", assignee: null },
];
