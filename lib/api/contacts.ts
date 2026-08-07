import { api } from "./client";

export interface Contact {
  id: string;
  brandId: number;
  displayName: string | null;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  notes: string | null;
  mergedIntoContactId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactIdentity {
  id: string;
  contactId: string;
  channel: string;
  connectionId: number | null;
  externalId: string;
  handle: string | null;
  profileName: string | null;
  phone: string | null;
}

export interface ContactWithIdentities {
  contact: Contact;
  identities: ContactIdentity[];
}

export interface Paginated<T> {
  data: T[];
  hasNextPage: boolean;
}

export interface UpdateContactProfile {
  displayName?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  avatarUrl?: string | null;
}

export const contactsApi = {
  list: (params?: { page?: number; limit?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return api.get<Paginated<ContactWithIdentities>>(
      `/contacts${qs ? `?${qs}` : ""}`,
    );
  },

  get: (id: string) => api.get<ContactWithIdentities>(`/contacts/${id}`),

  update: (id: string, patch: UpdateContactProfile) =>
    api.patch<ContactWithIdentities>(`/contacts/${id}`, patch),

  // Absorbs `loserId` into the contact `survivorId`: the loser's identities are
  // reparented onto the survivor and the loser is tombstoned.
  merge: (survivorId: string, loserId: string) =>
    api.post<ContactWithIdentities>(`/contacts/${survivorId}/merge`, {
      loserId,
    }),
};
