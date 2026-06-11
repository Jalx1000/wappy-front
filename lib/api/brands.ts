import { api } from "./client";
import type { Brand } from "@/store/ui";
import type { ConnRecord } from "@/lib/mocks/data";

export const brandsApi = {
  list: () =>
    api.get<Brand[]>("/brands"),

  getConnections: (brandId: string) =>
    api.get<ConnRecord[]>(`/brands/${brandId}/connections`),

  connect: (brandId: string, channel: string, accountId: string) =>
    api.post<{ ok: boolean; account: string }>(`/brands/${brandId}/connections/${channel}/connect`, { accountId }),

  disconnect: (brandId: string, channel: string) =>
    api.delete<{ ok: boolean }>(`/brands/${brandId}/connections/${channel}`),

  getDashboard: (brandId: string) =>
    api.get<{ kpis: unknown[]; alerts: unknown[] }>(`/brands/${brandId}/dashboard`),
};
