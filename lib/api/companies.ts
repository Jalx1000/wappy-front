import { api } from "./client";

export type Company = {
  id: string;
  brandId: number;
  name: string;
  domain: string | null;
  industry: string | null;
  location: string | null;
  plan: string | null;
  seats: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CompanyInput = {
  name: string;
  domain?: string | null;
  industry?: string | null;
  location?: string | null;
  plan?: string | null;
  seats?: number | null;
  notes?: string | null;
};

export const companiesApi = {
  list: () => api.get<Company[]>("/companies"),
  create: (dto: CompanyInput) => api.post<Company>("/companies", dto),
  update: (id: string, dto: Partial<CompanyInput>) =>
    api.patch<Company>(`/companies/${id}`, dto),
  remove: (id: string) => api.delete<void>(`/companies/${id}`),
};
