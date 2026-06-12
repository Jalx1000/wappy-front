import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { api } from "./client";
import type { Brand } from "@/store/ui";
import type { ConnRecord } from "@/lib/mocks/data";

type BackendBrand = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
};

const PALETTE = [
  "#0D5CA6",
  "#E1306C",
  "#1E8A5B",
  "#F09030",
  "#7B61FF",
  "#FF6B6B",
  "#06B6D4",
  "#F59E0B",
];

function shortFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function mapBackendBrand(b: BackendBrand, idx: number): Brand {
  return {
    id: String(b.id),
    name: b.name,
    short: shortFromName(b.name),
    industry: b.description ?? "—",
    tint: PALETTE[idx % PALETTE.length],
    plan: "—",
    team: 0,
    channels: [],
    followers: "—",
    reach: "—",
    eng: "—",
    spend: "—",
  };
}

// ── Connections ──────────────────────────────────────────────────────────────

type BackendChannel =
  | "facebook_page"
  | "instagram"
  | "tiktok"
  | "tiktok_ads"
  | "linkedin"
  | "linkedin_ads"
  | "youtube"
  | "google_ads"
  | "ga4";

type BackendConnectionStatus =
  | "connected"
  | "expired"
  | "error"
  | "syncing"
  | "disconnected";

type BackendConnection = {
  id: number;
  brandId: number;
  channel: BackendChannel;
  accountHandle: string;
  accountId: string;
  expiresAt: string | null;
  status: BackendConnectionStatus;
  lastSyncAt: string | null;
  scopes: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

const CHANNEL_BACKEND_TO_UI: Record<BackendChannel, string> = {
  facebook_page: "facebook",
  instagram: "instagram",
  tiktok: "tiktok",
  tiktok_ads: "tiktokads",
  linkedin: "linkedin",
  linkedin_ads: "linkedinads",
  youtube: "youtube",
  google_ads: "googleads",
  ga4: "ga4",
};

const CHANNEL_UI_TO_BACKEND: Record<string, BackendChannel> = {
  facebook: "facebook_page",
  instagram: "instagram",
  tiktok: "tiktok",
  tiktokads: "tiktok_ads",
  linkedin: "linkedin",
  linkedinads: "linkedin_ads",
  youtube: "youtube",
  googleads: "google_ads",
  metaads: "facebook_page",
  ga4: "ga4",
};

function mapStatus(s: BackendConnectionStatus): ConnRecord["status"] {
  if (s === "connected" || s === "syncing") return "connected";
  if (s === "expired" || s === "error") return "reauth";
  return "available";
}

function mapHealth(s: BackendConnectionStatus): ConnRecord["health"] {
  if (s === "connected" || s === "syncing") return "ok";
  if (s === "expired") return "warn";
  if (s === "error") return "err";
  return null;
}

function mapSince(iso: string | null): string | undefined {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString("es-BO", {
    month: "short",
    year: "numeric",
  });
}

function mapLastSync(iso: string | null): string | undefined {
  if (!iso) return undefined;
  try {
    return formatDistanceToNow(new Date(iso), { locale: es, addSuffix: true });
  } catch {
    return undefined;
  }
}

function mapBackendConnection(c: BackendConnection): ConnRecord {
  return {
    id: c.id,
    ch: CHANNEL_BACKEND_TO_UI[c.channel] ?? c.channel,
    account: c.accountHandle,
    status: mapStatus(c.status),
    health: mapHealth(c.status),
    since: mapSince(c.createdAt),
    lastSync: mapLastSync(c.lastSyncAt),
  };
}

type CreateConnectionDto = {
  channel: BackendChannel;
  accountHandle: string;
  accountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scopes?: string[];
  metadata?: Record<string, unknown>;
};

type UpdateConnectionDto = Partial<CreateConnectionDto>;

export type CreateBrandDto = {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateBrandDto = Partial<CreateBrandDto>;

export const brandsApi = {
  list: async () => {
    const raw = await api.get<BackendBrand[]>("/brands");
    return raw.map(mapBackendBrand);
  },

  create: async (dto: CreateBrandDto) => {
    const created = await api.post<BackendBrand>("/brands", dto);
    return mapBackendBrand(created, 0);
  },

  update: async (id: string, dto: UpdateBrandDto) => {
    const updated = await api.patch<BackendBrand>(`/brands/${id}`, dto);
    return mapBackendBrand(updated, 0);
  },

  remove: (id: string) => api.delete<void>(`/brands/${id}`),

  getConnections: async (_brandId: string) => {
    // x-brand-id header is injected by lib/api/client.ts from useUIStore
    const raw = await api.get<BackendConnection[]>("/connections");
    return raw.map(mapBackendConnection);
  },

  connect: async (_brandId: string, uiChannel: string, accountId: string) => {
    const channel =
      CHANNEL_UI_TO_BACKEND[uiChannel] ?? (uiChannel as BackendChannel);
    const dto: CreateConnectionDto = {
      channel,
      accountHandle: accountId,
      accountId,
      accessToken: "dev-mock-token",
    };
    const created = await api.post<BackendConnection>("/connections", dto);
    return mapBackendConnection(created);
  },

  disconnect: (connectionId: number) =>
    api.delete<void>(`/connections/${connectionId}`),

  updateConnection: async (
    connectionId: number,
    dto: UpdateConnectionDto,
  ) => {
    const updated = await api.patch<BackendConnection>(
      `/connections/${connectionId}`,
      dto,
    );
    return mapBackendConnection(updated);
  },

  syncConnection: (connectionId: number) =>
    api.post<{ jobId?: string | number }>(
      `/connections/${connectionId}/sync`,
      {},
    ),

  getDashboard: (brandId: string) =>
    api.get<{ kpis: unknown[]; alerts: unknown[] }>(
      `/brands/${brandId}/dashboard`,
    ),
};
