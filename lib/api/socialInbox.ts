import { api } from "./client";

export interface InboxAccount {
  connectionId: number;
  channel: string;
  accountHandle: string;
  status: string;
}

export interface UnifiedConversation {
  id: string;
  channel: string;
  connectionId: number;
  accountHandle: string;
  peer: string;
  contact: { id: string; displayName: string | null } | null;
  lastMessageAt: string | null;
}

export interface UnifiedMessage {
  id: string;
  direction: "in" | "out";
  type: string;
  content: string | null;
  mediaId: string | null;
  mediaUrl: string | null;
  payload: Record<string, unknown> | null;
  status: string | null;
  revoked: boolean;
  edited: boolean;
  sentAt: string;
}

export const socialInboxApi = {
  getAccounts: () => api.get<InboxAccount[]>("/social-inbox/accounts"),

  getConversations: (params?: { channel?: string; connectionId?: number }) => {
    const q = new URLSearchParams();
    if (params?.channel) q.set("channel", params.channel);
    if (params?.connectionId) q.set("connectionId", String(params.connectionId));
    const qs = q.toString();
    return api.get<UnifiedConversation[]>(
      `/social-inbox/conversations${qs ? `?${qs}` : ""}`,
    );
  },

  getMessages: (conversationId: string, channel: string) =>
    api.get<UnifiedMessage[]>(
      `/social-inbox/conversations/${conversationId}/messages?channel=${encodeURIComponent(
        channel,
      )}`,
    ),

  sendMessage: (conversationId: string, channel: string, text: string) =>
    api.post<UnifiedMessage>(
      `/social-inbox/conversations/${conversationId}/messages`,
      { channel, text },
    ),

  // Returns an object URL for a message's media asset (proxied via the backend).
  getMediaUrl: (messageId: string) =>
    api.getBlobUrl(`/social-inbox/media/${messageId}`),

  sendMedia: (
    conversationId: string,
    channel: string,
    file: File,
    caption?: string,
  ) => {
    const form = new FormData();
    form.append("channel", channel);
    if (caption) form.append("caption", caption);
    form.append("file", file);
    return api.postForm<UnifiedMessage>(
      `/social-inbox/conversations/${conversationId}/media`,
      form,
    );
  },

  sendLocation: (
    conversationId: string,
    channel: string,
    loc: {
      latitude: number;
      longitude: number;
      name?: string;
      address?: string;
    },
  ) =>
    api.post<UnifiedMessage>(
      `/social-inbox/conversations/${conversationId}/location`,
      { channel, ...loc },
    ),
};
