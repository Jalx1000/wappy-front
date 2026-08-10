import { api } from "./client";

export type Invitation = {
  id: string;
  brandId: number;
  email: string | null;
  phone: string | null;
  role: string | null;
  status: string;
  token?: string;
  createdAt: string;
};

export type CreateInvitationDto = {
  brandId: number;
  email?: string;
  phone?: string;
  role?: "admin" | "member" | "client";
};

export const invitationsApi = {
  create: (dto: CreateInvitationDto) =>
    api.post<Invitation>("/invitations", dto),

  list: (brandId: string | number) =>
    api.get<Invitation[]>(`/invitations?brandId=${brandId}`),

  revoke: (id: string) => api.delete<void>(`/invitations/${id}`),

  byToken: (token: string) =>
    api.get<Invitation>(`/invitations/token/${encodeURIComponent(token)}`),

  accept: (token: string) =>
    api.post<Invitation>(
      `/invitations/token/${encodeURIComponent(token)}/accept`,
      {},
    ),
};
