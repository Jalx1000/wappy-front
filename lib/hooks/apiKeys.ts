"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiKeysApi, type ApiKeyEnvironment } from "@/lib/api/apiKeys";

/** The brand's API keys (masked), newest first. */
export function useApiKeys() {
  return useQuery({
    queryKey: ["api-keys"],
    queryFn: () => apiKeysApi.list(),
  });
}

/** Mints a new key; the plaintext comes back once in the mutation result. */
export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { environment: ApiKeyEnvironment; label?: string | null }) =>
      apiKeysApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}

/** Revokes a key and refreshes the list. */
export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiKeysApi.revoke(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });
}
