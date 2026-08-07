"use client";

import { create } from "zustand";

export interface Integration {
  id: string;
  name: string;
  cat: string;
  color: string;
  glyph: string;
  desc: string;
  connected: boolean;
}

export const INTEGRATIONS_SEED: Integration[] = [
  { id: "slack", name: "Slack", cat: "Productividad", color: "#4A154B", glyph: "S", desc: "Recibe alertas de conversaciones y responde desde tus canales de Slack.", connected: true },
  { id: "jira", name: "Jira", cat: "Ingeniería", color: "#0052CC", glyph: "J", desc: "Convierte reportes de bugs en incidencias de Jira sin salir de la bandeja.", connected: false },
  { id: "shopify", name: "Shopify", cat: "E-commerce", color: "#5E8E3E", glyph: "S", desc: "Ve pedidos, reembolsos y el LTV del cliente junto a cada chat.", connected: true },
  { id: "zapier", name: "Zapier", cat: "Automatización", color: "#FF4F00", glyph: "Z", desc: "Conecta Wappy con más de 6,000 apps mediante flujos personalizados.", connected: false },
  { id: "hubspot", name: "HubSpot", cat: "CRM", color: "#FF7A59", glyph: "H", desc: "Sincroniza contactos y negocios de forma bidireccional con tu CRM.", connected: false },
  { id: "stripe", name: "Stripe", cat: "Pagos", color: "#635BFF", glyph: "S", desc: "Consulta suscripciones y emite reembolsos desde el panel de contacto.", connected: true },
  { id: "github", name: "GitHub", cat: "Ingeniería", color: "#181717", glyph: "G", desc: "Vincula conversaciones con incidencias y pull requests.", connected: false },
  { id: "salesforce", name: "Salesforce", cat: "CRM", color: "#00A1E0", glyph: "S", desc: "Envía el contexto de soporte a los registros de Salesforce.", connected: false },
  { id: "webhook", name: "Webhooks", cat: "Desarrollo", color: "#2C2C2C", glyph: "{}", desc: "Envía un payload firmado por POST en cada evento de conversación.", connected: true },
];

interface IntegrationsState {
  items: Integration[];
  toggle: (id: string) => void;
}

export const useIntegrationsStore = create<IntegrationsState>((set) => ({
  items: INTEGRATIONS_SEED,
  toggle: (id) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)) })),
}));
