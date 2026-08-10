import { api } from "./client";

export type Availability = "online" | "away" | "busy" | "offline";

export type AuthMe = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  provider?: string;
  socialId?: string | null;
  photo?: { id: string; path: string } | null;
  availability?: Availability | null;
  role: { id: number; name: string };
  status: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type UpdateMeDto = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  oldPassword?: string;
  photo?: { id: string } | null;
  availability?: Availability;
};

export const authApi = {
  me: () => api.get<AuthMe>("/auth/me"),
  updateMe: (dto: UpdateMeDto) => api.patch<AuthMe>("/auth/me", dto),
  deleteMe: () => api.delete<void>("/auth/me"),
  logout: () => api.post<void>("/auth/logout", {}),
};
