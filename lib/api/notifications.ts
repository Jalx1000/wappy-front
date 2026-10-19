import { api } from "./client";

/** Notificación tal como la devuelve el backend (`GET /api/v1/notifications`). */
export type ApiNotification = {
  id: number;
  userId: number;
  brandId?: number;
  type: string;
  title: string;
  body: string;
  read: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export const notificationsApi = {
  list: (opts?: { unreadOnly?: boolean; limit?: number }) => {
    const p = new URLSearchParams();
    if (opts?.unreadOnly) p.set("read", "false");
    if (opts?.limit != null) p.set("limit", String(opts.limit));
    const qs = p.toString();
    return api.get<ApiNotification[]>(`/notifications${qs ? `?${qs}` : ""}`);
  },
  markRead: (id: number) =>
    api.patch<{ success: boolean }>(`/notifications/${id}/read`, {}),
  markAllRead: () =>
    api.patch<{ success: boolean }>(`/notifications/read-all`, {}),
};
