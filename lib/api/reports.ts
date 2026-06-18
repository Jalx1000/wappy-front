import { api } from "./client";

export type ReportStatus = "pending" | "processing" | "ready" | "failed";
export type ReportType = "summary" | "channel" | "campaign";

export type ReportKpi = {
  key: string;
  label: string;
  value: number;
  unit?: "number" | "percent" | "currency";
  deltaPct?: number | null;
  series?: { date: string; value: number }[];
};

export type ReportTopPost = {
  externalId: string;
  channel?: string;
  publishedAt: string;
  type: string;
  caption: string | null;
  mediaUrl: string | null;
  metrics: Record<string, number>;
};

export type ReportNetworkSection = {
  channel: string;
  label: string;
  handle?: string | null;
  kpis: ReportKpi[];
  topPosts: ReportTopPost[];
  note?: string;
};

export type ReportData = {
  brand: { id: number; name: string; logoUrl?: string | null };
  period: { from: string; to: string; label: string };
  generatedAt: string;
  sections: string[];
  executive: {
    kpis: ReportKpi[];
    narrative: string[];
    postsTable: Array<Record<string, string | number | null>>;
  };
  social?: { networks: ReportNetworkSection[] };
  web?: {
    kpis: ReportKpi[];
    sources: { label: string; value: number }[];
    countries: {
      country: string;
      sessions: number;
      users: number;
      conversions: number;
    }[];
    cities: { city: string; sessions: number }[];
  };
  ads?: {
    kpis: ReportKpi[];
    campaigns: Array<Record<string, string | number | null>>;
  };
  conclusions: string[];
};

export type Report = {
  id: number;
  brandId: number;
  type: ReportType;
  status: ReportStatus;
  params: { from: string; to: string; channelIds?: number[]; sections?: string[] };
  fileUrl: string | null;
  data: ReportData | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateReportPayload = {
  type: ReportType;
  from: string;
  to: string;
  sections?: string[];
  channelIds?: number[];
};

export const reportsApi = {
  list: () => api.get<Report[]>("/reports"),
  get: (id: number) => api.get<Report>(`/reports/${id}`),
  create: (payload: CreateReportPayload) =>
    api.post<Report>("/reports", payload),
};
