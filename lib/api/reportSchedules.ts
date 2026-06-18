import { api } from "./client";

export type ReportFrequency =
  | "daily"
  | "weekdays"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly";

export type ReportSchedule = {
  id: number;
  brandId: number;
  type: string;
  frequency: ReportFrequency;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  hour: number;
  timezone: string;
  sections: string[];
  memberUserIds: number[];
  extraEmails: string[];
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdByUserId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateReportSchedulePayload = {
  frequency: ReportFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  timezone?: string;
  sections?: string[];
  memberUserIds?: number[];
  extraEmails?: string[];
  enabled?: boolean;
};

export const reportSchedulesApi = {
  list: () => api.get<ReportSchedule[]>("/report-schedules"),
  create: (payload: CreateReportSchedulePayload) =>
    api.post<ReportSchedule>("/report-schedules", payload),
  update: (id: number, payload: Partial<CreateReportSchedulePayload>) =>
    api.patch<ReportSchedule>(`/report-schedules/${id}`, payload),
  remove: (id: number) => api.delete<void>(`/report-schedules/${id}`),
};
