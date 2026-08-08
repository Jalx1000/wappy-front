"use client";

import { useEffect } from "react";
import { getSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { useUIStore } from "@/store/ui";
import type { UnifiedMessage } from "@/lib/api/socialInbox";

// Same origin logic as lib/api/client.ts (BASE_URL is the API origin; the REST
// client appends /api/v1 itself). Strip a trailing /api/v1 defensively in case
// the env is set with the suffix, so the socket path stays `${origin}/rt`.
const ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3100"
).replace(/\/api\/v1\/?$/, "");

interface MessageNewPayload {
  brandId: number;
  channel: string;
  connectionId: number;
  conversationId: string;
  message: UnifiedMessage;
}

/**
 * Subscribes the authenticated app shell to the backend realtime layer
 * (socket.io namespace `/rt`) and keeps the social-inbox React Query caches live:
 *
 * - `message:new`        → appends to the open thread (deduped) + refreshes the list
 * - `conversation:updated` → refreshes the conversation list ordering
 *
 * One socket per active brand; reconnects when the brand changes. Mirrors REST
 * auth: JWT access token + `x-brand-id` sent in the socket.io handshake.
 */
export function useInboxRealtime(): void {
  const brandId = useUIStore((s) => s.activeBrand?.id);
  const qc = useQueryClient();

  useEffect(() => {
    if (!brandId) return;

    let socket: Socket | null = null;
    let cancelled = false;

    void (async () => {
      const session = await getSession();
      // A dead/refreshing session has no usable token — skip; the REST layer
      // handles the sign-out redirect.
      if (session?.error === "RefreshTokenError") return;
      const token = session?.user?.accessToken;
      if (!token || cancelled) return;

      socket = io(`${ORIGIN}/rt`, {
        transports: ["websocket"],
        auth: { token, brandId },
        reconnection: true,
        reconnectionDelay: 1000,
      });

      const conversationsKey = ["social-inbox", "conversations", brandId];

      socket.on("message:new", (p: MessageNewPayload) => {
        const messagesKey = [
          "social-inbox",
          "messages",
          brandId,
          p.conversationId,
        ];
        // Instant append when the thread is open; no-op otherwise (opening it
        // triggers its own fetch).
        qc.setQueryData<UnifiedMessage[]>(messagesKey, (old) => {
          if (!old) return old;
          if (old.some((m) => m.id === p.message.id)) return old;
          return [...old, p.message];
        });
        qc.invalidateQueries({ queryKey: conversationsKey });
      });

      socket.on("conversation:updated", () => {
        qc.invalidateQueries({ queryKey: conversationsKey });
      });
    })();

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [brandId, qc]);
}
