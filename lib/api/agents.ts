import { api } from "./client";

export type Agent = {
  id: string;
  brandId: number;
  name: string;
  enabled: boolean;
  /** 'anthropic' (Claude) | 'openai' (ChatGPT) */
  provider: string;
  model: string;
  systemPrompt: string | null;
  effort: string | null;
  toolsEnabled: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type AgentInput = {
  name: string;
  provider?: string;
  model?: string;
  systemPrompt?: string | null;
  enabled?: boolean;
};

export type AgentTestResult = {
  text: string;
  usage?: { inputTokens: number; outputTokens: number };
};

export const agentsApi = {
  list: () => api.get<Agent[]>("/agents"),
  create: (dto: AgentInput) => api.post<Agent>("/agents", dto),
  update: (id: string, dto: Partial<AgentInput>) =>
    api.patch<Agent>(`/agents/${id}`, dto),
  remove: (id: string) => api.delete<void>(`/agents/${id}`),
  test: (id: string, message: string) =>
    api.post<AgentTestResult>(`/agents/${id}/test`, { message }),
};
