import { getSession, signOut } from "next-auth/react";
import { useUIStore } from "@/store/ui";

// Avoid stampeding signOut() if multiple requests fail simultaneously.
let signOutInFlight: Promise<unknown> | null = null;
function forceSignOut() {
  if (typeof window === "undefined") return;
  if (signOutInFlight) return;
  signOutInFlight = signOut({ redirectTo: "/login" }).finally(() => {
    signOutInFlight = null;
  });
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100";

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getAccessToken(): Promise<string | undefined> {
  if (typeof window === "undefined") return undefined;
  const session = await getSession();
  // If NextAuth flagged the session as having a refresh error, the access
  // token is unusable — kick the user to /login instead of hitting the API
  // with a dead token.
  if (session?.error === "RefreshTokenError") {
    forceSignOut();
    return undefined;
  }
  return session?.user?.accessToken;
}

function getActiveBrandId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return useUIStore.getState().activeBrand?.id;
}

async function request<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { body, headers: callerHeaders, ...rest } = options;

  const token = await getAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(callerHeaders as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  if (!("x-brand-id" in headers)) {
    const brandId = getActiveBrandId();
    if (brandId) headers["x-brand-id"] = brandId;
  }

  const url = path.startsWith("http")
    ? path
    : path.startsWith("/api/")
      ? `${BASE_URL}${path}`
      : `${BASE_URL}/api/v1${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (res.status === 204) return undefined as T;

  // 401 from backend → access token rejected. Force signOut so the user is
  // sent to /login instead of seeing a wall of "Unauthorized" errors.
  if (res.status === 401) {
    forceSignOut();
  }

  if (!res.ok) {
    let parsed: unknown = undefined;
    try {
      parsed = await res.json();
    } catch {
      try {
        parsed = await res.text();
      } catch {
        // ignore
      }
    }
    const msg =
      typeof parsed === "object" && parsed && "message" in parsed
        ? String((parsed as { message: unknown }).message)
        : res.statusText;
    throw new ApiError(res.status, msg, parsed);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: "GET", ...init }),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: "POST", body, ...init }),
  patch: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>(path, { method: "PATCH", body, ...init }),
  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { method: "DELETE", ...init }),
};
