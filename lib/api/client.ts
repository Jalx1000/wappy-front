const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

type FetchOptions = Omit<RequestInit, "body"> & { body?: unknown };

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, ...rest } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...rest.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, text);
  }

  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string, init?: RequestInit) => request<T>(path, { method: "GET", ...init }),
  post:   <T>(path: string, body: unknown, init?: RequestInit) => request<T>(path, { method: "POST", body, ...init }),
  patch:  <T>(path: string, body: unknown, init?: RequestInit) => request<T>(path, { method: "PATCH", body, ...init }),
  delete: <T>(path: string, init?: RequestInit) => request<T>(path, { method: "DELETE", ...init }),
};
