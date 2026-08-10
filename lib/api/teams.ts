import { api } from "./client";

export type TeamMember = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
};

export type Team = {
  id: string;
  brandId: number;
  name: string;
  members?: TeamMember[];
  createdAt: string;
};

export const teamsApi = {
  list: (brandId: string | number) =>
    api.get<Team[]>(`/teams?brandId=${brandId}`),

  create: (dto: { brandId: number; name: string }) =>
    api.post<Team>("/teams", dto),

  rename: (id: string, name: string) =>
    api.patch<Team>(`/teams/${id}`, { name }),

  remove: (id: string) => api.delete<void>(`/teams/${id}`),

  addMember: (id: string, userId: number) =>
    api.post<Team>(`/teams/${id}/members`, { userId }),

  removeMember: (id: string, userId: number) =>
    api.delete<void>(`/teams/${id}/members/${userId}`),
};
