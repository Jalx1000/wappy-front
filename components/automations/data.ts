export const TRIGGERS = [
  "Conversación creada",
  "Conversación resuelta",
  "Etiqueta añadida",
  "Sin respuesta en 1h",
  "CSAT recibido",
];

export const ACTIONS = [
  "Asignar a equipo",
  "Añadir etiqueta",
  "Enviar auto-respuesta",
  "Posponer",
  "Notificar en Slack",
  "Marcar prioridad",
];

export interface Rule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  actionValue: string;
  active: boolean;
  runs: number;
}

export const RULES_SEED: Rule[] = [
  { id: "r1", name: "Enrutar clientes VIP a prioridad", trigger: "Conversación creada", action: "Marcar prioridad", actionValue: "", active: true, runs: 142 },
  { id: "r2", name: "Auto-asignar dudas de facturación", trigger: "Etiqueta añadida", action: "Asignar a equipo", actionValue: "Equipo de facturación", active: true, runs: 88 },
  { id: "r3", name: "Seguimiento sin respuesta", trigger: "Sin respuesta en 1h", action: "Enviar auto-respuesta", actionValue: "¿Sigues ahí? ¡Estamos para ayudarte!", active: false, runs: 24 },
];
