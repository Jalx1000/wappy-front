import { api } from "./client";

export interface AssetItem {
  id: number;
  brandId: number;
  name: string;
  type: string;
  mimeType: string;
  fileId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetInput {
  name: string;
  type: string;
  mimeType: string;
  fileId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export const assetsApi = {
  list: (type?: string, limit = 100) => {
    const qs = new URLSearchParams();
    if (type) qs.set("type", type);
    qs.set("limit", String(limit));
    return api.get<AssetItem[]>(`/assets?${qs.toString()}`);
  },
  get: (id: number) => api.get<AssetItem>(`/assets/${id}`),
  create: (payload: CreateAssetInput) =>
    api.post<AssetItem>(`/assets`, payload),
};
