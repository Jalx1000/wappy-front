import { api } from "./client";

/** Base URL integrators call (already includes /api/v1). */
export const INTEGRATION_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100";

export type ApiKeyEnvironment = "sandbox" | "production";

/** Masked key as shown in the listing (never the plaintext). */
export interface ApiKeySummary {
  id: string;
  keyPrefix: string;
  environment: ApiKeyEnvironment;
  label: string | null;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

/** Create response — the only time the plaintext `key` is ever returned. */
export interface CreatedApiKey {
  id: string;
  key: string;
  keyPrefix: string;
  environment: ApiKeyEnvironment;
  label: string | null;
  createdAt: string;
}

export const apiKeysApi = {
  list: () => api.get<ApiKeySummary[]>("/api-keys"),
  create: (body: { environment: ApiKeyEnvironment; label?: string | null }) =>
    api.post<CreatedApiKey>("/api-keys", body),
  revoke: (id: string) => api.delete<void>(`/api-keys/${id}`),
};
