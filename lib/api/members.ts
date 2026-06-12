import { api } from "./client";

export type MemberRole = "admin" | "member" | "client";

export type BrandMember = {
  id: number;
  userId: number;
  brandId: number;
  role: MemberRole;
  createdAt: string;
  updatedAt: string;
};

export const membersApi = {
  list: (brandId: string) =>
    api.get<BrandMember[]>(`/brands/${brandId}/members`),

  add: (brandId: string, dto: { userId: number; role?: MemberRole }) =>
    api.post<BrandMember>(`/brands/${brandId}/members`, dto),

  remove: (brandId: string, userId: number) =>
    api.delete<void>(`/brands/${brandId}/members/${userId}`),
};
