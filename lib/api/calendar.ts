import { api } from "./client";

export interface CalendarItem {
  id: number;
  brandId: number;
  connectionId?: number;
  title: string;
  description?: string;
  scheduledAt: string;
  status: string;
  type?: string;
  mediaUrls?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarItemInput {
  title: string;
  description?: string;
  scheduledAt: string; // ISO 8601
  type?: string;
  mediaUrls?: string[];
  metadata?: Record<string, unknown>;
}

export interface PublishNetworkResult {
  ok: boolean;
  publishId?: string;
  mode?: string;
  error?: string;
  at: string;
}

export interface PublishResult {
  itemId: number;
  status: string;
  results: Record<string, PublishNetworkResult>;
}

export const calendarApi = {
  list: (from?: string, to?: string) => {
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    const q = qs.toString();
    return api.get<CalendarItem[]>(`/calendar${q ? `?${q}` : ""}`);
  },
  get: (id: number) => api.get<CalendarItem>(`/calendar/${id}`),
  create: (payload: CalendarItemInput) =>
    api.post<CalendarItem>(`/calendar`, payload),
  update: (
    id: number,
    payload: Partial<CalendarItemInput> & { status?: string },
  ) => api.patch<CalendarItem>(`/calendar/${id}`, payload),
  remove: (id: number) => api.delete<{ success: boolean }>(`/calendar/${id}`),
  publish: (itemId: number) =>
    api.post<PublishResult>(`/publishing/calendar/${itemId}/publish`, {}),
};
