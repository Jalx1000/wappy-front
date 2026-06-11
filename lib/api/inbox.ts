import { api } from "./client";

export const inboxApi = {
  getItems: (brandId: string) =>
    api.get<unknown[]>(`/brands/${brandId}/inbox`),

  getThread: (brandId: string, itemId: number) =>
    api.get<unknown[]>(`/brands/${brandId}/inbox/${itemId}/thread`),

  reply: (brandId: string, itemId: number, text: string) =>
    api.post<{ ok: boolean; message: unknown }>(`/brands/${brandId}/inbox/${itemId}/reply`, { text }),
};
