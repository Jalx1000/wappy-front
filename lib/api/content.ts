import { api } from "./client";
import type { Approval, CalPost, Brief, Contract } from "@/lib/mocks/analyticsData";

export const contentApi = {
  // Posts
  getPosts: (brandId: string) =>
    api.get<unknown[]>(`/brands/${brandId}/posts`),

  // Calendar
  getCalendar: (brandId: string, year: number, month: number) =>
    api.get<{ year: number; month: number; posts: Record<number, CalPost[]>; statusMeta: unknown }>(
      `/brands/${brandId}/calendar?year=${year}&month=${month}`
    ),

  // Approvals
  getApprovals: (brandId: string) =>
    api.get<Approval[]>(`/brands/${brandId}/approvals`),

  updateApproval: (brandId: string, id: number, status: string, note?: string) =>
    api.patch<Approval>(`/brands/${brandId}/approvals/${id}`, { status, note }),

  // Campaigns
  getCampaigns: (brandId: string) =>
    api.get<unknown[]>(`/brands/${brandId}/campaigns`),

  // Influencers
  getInfluencers: (brandId: string) =>
    api.get<unknown[]>(`/brands/${brandId}/influencers`),

  createInfluencer: (brandId: string, payload: Record<string, unknown>) =>
    api.post<unknown>(`/brands/${brandId}/influencers`, payload),

  updateInfluencer: (brandId: string, id: string, payload: Record<string, unknown>) =>
    api.patch<unknown>(`/brands/${brandId}/influencers/${id}`, payload),

  deleteInfluencer: (brandId: string, id: string) =>
    api.delete(`/brands/${brandId}/influencers/${id}`),

  // Briefs
  getBriefs: (brandId: string) =>
    api.get<Brief[]>(`/brands/${brandId}/briefs`),

  createBrief: (brandId: string, payload: Omit<Brief, "id" | "createdAt">) =>
    api.post<Brief>(`/brands/${brandId}/briefs`, payload),

  updateBrief: (brandId: string, id: string, payload: Partial<Brief>) =>
    api.patch<Brief>(`/brands/${brandId}/briefs/${id}`, payload),

  deleteBrief: (brandId: string, id: string) =>
    api.delete(`/brands/${brandId}/briefs/${id}`),

  // Contracts
  getContracts: (brandId: string) =>
    api.get<Contract[]>(`/brands/${brandId}/contracts`),

  createContract: (brandId: string, payload: Omit<Contract, "id" | "createdAt">) =>
    api.post<Contract>(`/brands/${brandId}/contracts`, payload),

  updateContract: (brandId: string, id: string, payload: Partial<Contract>) =>
    api.patch<Contract>(`/brands/${brandId}/contracts/${id}`, payload),

  deleteContract: (brandId: string, id: string) =>
    api.delete(`/brands/${brandId}/contracts/${id}`),

  // Reports
  getReports: (brandId: string) =>
    api.get<unknown[]>(`/brands/${brandId}/reports`),

  createReport: (brandId: string, payload: Record<string, unknown>) =>
    api.post<unknown>(`/brands/${brandId}/reports`, payload),
};
