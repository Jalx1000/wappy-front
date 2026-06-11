import { api } from "./client";

export type RequestItem = {
  id: string;
  title: string;
  brand: string;
  pri: string;
  status: string;
  by: string;
  when: string;
  type: string;
};

export const requestsApi = {
  list: () =>
    api.get<RequestItem[]>("/requests"),

  create: (payload: Omit<RequestItem, "id" | "when">) =>
    api.post<RequestItem>("/requests", payload),

  updateStatus: (id: string, status: string) =>
    api.patch<RequestItem>(`/requests/${id}`, { status }),
};
