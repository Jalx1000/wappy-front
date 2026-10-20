"use client";

import { useMutation } from "@tanstack/react-query";
import { socialInboxApi } from "@/lib/api/socialInbox";

/**
 * Persists a conversation's lifecycle status to the backend
 * (`PATCH /social-inbox/conversations/:id/status`). The inbox keeps its local
 * optimistic state in `convoState`; this fires the real write so support
 * metrics (resolved counts, resolution series) reflect it.
 */
export function useSetConversationStatus() {
  return useMutation({
    mutationFn: ({
      conversationId,
      channel,
      status,
    }: {
      conversationId: string;
      channel: string;
      status: string;
    }) => socialInboxApi.setStatus(conversationId, channel, status),
  });
}
