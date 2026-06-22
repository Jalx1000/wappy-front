import { api } from "./client";

export interface ApprovalRecord {
  id: number;
  brandId: number;
  assetId: number;
  calendarItemId?: number;
  requestedByUserId: number;
  reviewedByUserId?: number;
  status: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export const approvalsApi = {
  list: (status?: string) =>
    api.get<ApprovalRecord[]>(`/approvals${status ? `?status=${status}` : ""}`),
  create: (payload: { assetId: number; calendarItemId?: number }) =>
    api.post<ApprovalRecord>(`/approvals`, payload),
  review: (id: number, payload: { status: string; feedback?: string }) =>
    api.patch<ApprovalRecord>(`/approvals/${id}/review`, payload),
};
