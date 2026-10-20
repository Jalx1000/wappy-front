"use client";

import { useQuery } from "@tanstack/react-query";
import { socialInboxApi } from "@/lib/api/socialInbox";

/** Support metrics for the last [days] days (7/30/90). */
export function useSupportMetrics(days: number) {
  return useQuery({
    queryKey: ["support-metrics", days],
    queryFn: () => {
      const from = new Date(Date.now() - days * 86400_000).toISOString();
      return socialInboxApi.getMetrics({ from });
    },
    refetchInterval: 120_000,
  });
}
