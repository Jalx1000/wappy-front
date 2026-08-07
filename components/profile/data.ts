export type Availability = "Disponible" | "Ausente" | "Ocupado";

export interface AgentProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  timezone: string;
  language: string;
  bio: string;
  availability: Availability;
}

export const AVAIL_COLORS: Record<Availability, string> = {
  Disponible: "var(--color-success)",
  Ausente: "var(--color-warning)",
  Ocupado: "var(--color-error)",
};

export const DEFAULT_PROFILE: AgentProfile = {
  name: "Super Admin",
  role: "Agente de soporte",
  email: "admin@wappy.dev",
  phone: "+34 600 123 456",
  timezone: "Europe/Madrid",
  language: "Español",
  bio: "Ayudo a los clientes a sacar el máximo partido de Wappy.",
  availability: "Disponible",
};
