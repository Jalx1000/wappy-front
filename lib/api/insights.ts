import { api } from "./client";

export const insightsApi = {
  get: (brandId: string) =>
    api.get<unknown[]>(`/brands/${brandId}/insights`),

  chat: (brandId: string, message: string) =>
    api.post<{ role: string; content: string }>(`/brands/${brandId}/insights/chat`, { message }),
};
