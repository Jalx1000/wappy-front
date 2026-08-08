"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/ui/Icon";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUIStore } from "@/store/ui";
import { metaKey, channelLabel, channelTint } from "@/lib/channels";
import {
  contactsApi,
  type ContactIdentity,
  type ContactWithIdentities,
} from "@/lib/api/contacts";
import {
  ContactTagsCard,
  ContactAttributesCard,
  ContactSharedCard,
} from "./ContactExtras";
import { ContactsSegmentsRail } from "./ContactsSegmentsRail";
import { ContactsTable } from "./ContactsTable";
import { ContactsFilters } from "./ContactsFilters";
import { matchesSegment, matchesRules, type FilterRule } from "./segments";
import { useContactTagsStore } from "@/store/contactTags";
import type { SavedSegment } from "@/store/savedSegments";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d}d`;
  return new Date(iso).toLocaleDateString();
}

function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const nameOf = (c: ContactWithIdentities) =>
  c.contact.displayName ||
  c.identities[0]?.profileName ||
  c.contact.phone ||
  c.identities[0]?.handle ||
  c.identities[0]?.externalId ||
  "Sin nombre";

const identityValue = (i: ContactIdentity) =>
  i.handle || i.phone || i.profileName || i.externalId;

const primaryChannel = (c: ContactWithIdentities): string =>
  c.identities[0]?.channel ?? "whatsapp";

const hasWhatsapp = (c: ContactWithIdentities) =>
  c.identities.some((i) => i.channel === "whatsapp");

export function ContactsView() {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id;
  const router = useRouter();
  const qc = useQueryClient();
  // Deep-link: /app/contacts?id=<contactId> preselects a contact until the
  // user clicks another one.
  const idParam = useSearchParams().get("id");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selId, setSelId] = useState<string | undefined>(undefined);

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: ["contacts", "list", brandId, search],
    queryFn: () => contactsApi.list({ limit: 50, search: search || undefined }),
    enabled: !!brandId,
  });
  const contacts = useMemo(() => data?.data ?? [], [data]);

  const [segment, setSegment] = useState("all");
  const [rules, setRules] = useState<FilterRule[]>([]);
  const [savedId, setSavedId] = useState<string | undefined>(undefined);
  const contactTagsById = useContactTagsStore((s) => s.byContact);
  const visibleContacts = useMemo(
    () => contacts.filter(
      (c) => matchesSegment(c, segment, contactTagsById) && matchesRules(c, rules, contactTagsById),
    ),
    [contacts, segment, rules, contactTagsById],
  );

  // Built-in segment click clears any custom filter/saved segment.
  const selectSegment = (s: string) => { setSegment(s); setRules([]); setSavedId(undefined); };
  // Saved segment click loads its rules and neutralises the built-in segment.
  const selectSaved = (seg: SavedSegment) => { setSegment("all"); setRules(seg.rules); setSavedId(seg.id); };
  const changeRules = (r: FilterRule[]) => { setRules(r); setSavedId(undefined); };

  const selected =
    contacts.find((c) => c.contact.id === (selId ?? idParam)) ??
    contacts[0] ??
    undefined;
  const selectedId = selected?.contact.id;

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["contacts", "list", brandId] });

  // Select + reflect it in the URL so the view is shareable and the back button
  // restores the previous contact.
  const selectContact = (id: string) => {
    setSelId(id);
    router.replace(`/app/contacts?id=${id}`, { scroll: false });
  };

  return (
    <div
      className="h-full overflow-hidden"
      style={{ display: "grid", gridTemplateColumns: selected ? "200px 1fr 380px" : "200px 1fr" }}
    >
      <ContactsSegmentsRail contacts={contacts} segment={segment} savedId={savedId} onSelect={selectSegment} onSelectSaved={selectSaved} />

        {/* Table pane */}
        <div
          className="flex flex-col min-h-0"
          style={{ borderRight: "1px solid var(--color-border)" }}
        >
          <ContactsFilters contacts={contacts} rules={rules} onChange={changeRules} />
          <div
            className="p-3"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div className="relative">
              <span
                className="absolute left-2.5 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                <Icon name="search" size={15} />
              </span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por nombre, teléfono, email…"
                aria-label="Buscar contactos"
                className="w-full text-[13px] rounded-[9px] pl-8 pr-3 py-2 outline-none"
                style={{
                  border: "1px solid var(--color-border)",
                  background: "var(--color-background)",
                  color: "var(--color-text-primary)",
                  fontFamily: "var(--ff-ui)",
                  transition: "border-color 150ms, box-shadow 150ms",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-primary-ink)";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px var(--color-primary-light)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-4 flex flex-col gap-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} style={{ height: 48 }} />
              ))}
            </div>
          ) : visibleContacts.length === 0 ? (
            <div className="p-2">
              <EmptyState
                icon="users"
                title={search ? "Sin resultados" : "Sin contactos"}
                body={
                  search
                    ? "Ningún contacto coincide con tu búsqueda."
                    : "Los contactos se crean cuando llegan mensajes de tus cuentas conectadas."
                }
              />
            </div>
          ) : (
            <ContactsTable contacts={visibleContacts} selectedId={selectedId} onSelect={selectContact} />
          )}
        </div>

        {/* Detail pane */}
        {selected && (
          <div
            className="flex flex-col min-h-0 overflow-y-auto"
            style={{ borderLeft: "1px solid var(--color-border)" }}
          >
            <ContactDetail
              key={selected.contact.id}
              data={selected}
              candidates={contacts.filter(
                (c) => c.contact.id !== selected.contact.id,
              )}
              onOpenChat={() =>
                router.push(`/app/inbox?contact=${selected.contact.id}`)
              }
              onSaved={invalidate}
              onMerged={() => {
                setSelId(selected.contact.id);
                invalidate();
              }}
              onDeleted={() => {
                setSelId(undefined);
                invalidate();
              }}
            />
          </div>
        )}
    </div>
  );
}

// Deterministic pleasant avatar color from a seed string.
const AVATAR_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#8b5cf6",
  "#ef4444",
  "#0ea5e9",
];
function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function Avatar({
  seed,
  label,
  size,
  ring,
}: {
  seed: string;
  label: string;
  size: number;
  ring?: boolean;
}) {
  return (
    <span
      className="flex items-center justify-center text-white font-bold rounded-full flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: avatarColor(seed),
        boxShadow: ring ? "0 0 0 3px var(--color-surface)" : undefined,
      }}
    >
      {initials(label)}
    </span>
  );
}

function ContactDetail({
  data,
  candidates,
  onOpenChat,
  onSaved,
  onMerged,
  onDeleted,
}: {
  data: ContactWithIdentities;
  candidates: ContactWithIdentities[];
  onOpenChat: () => void;
  onSaved: () => void;
  onMerged: () => void;
  onDeleted: () => void;
}) {
  const { contact, identities } = data;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    displayName: contact.displayName ?? "",
    phone: contact.phone ?? "",
    email: contact.email ?? "",
    notes: contact.notes ?? "",
  });

  const saveMut = useMutation({
    mutationFn: () =>
      contactsApi.update(contact.id, {
        displayName: form.displayName.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
      }),
    onSuccess: () => {
      setEditing(false);
      onSaved();
    },
  });

  const cancelEdit = () => {
    setForm({
      displayName: contact.displayName ?? "",
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      notes: contact.notes ?? "",
    });
    setEditing(false);
  };

  const [confirmDelete, setConfirmDelete] = useState(false);
  const removeMut = useMutation({
    mutationFn: () => contactsApi.remove(contact.id),
    onSuccess: () => onDeleted(),
  });

  const label = nameOf(data);
  const ch = primaryChannel(data);
  const channels = new Set(identities.map((i) => i.channel)).size;

  return (
    <div style={{ width: "100%", maxWidth: 780, margin: "0 auto" }}>
      {/* Hero header with a subtle channel-tinted band */}
      <div
        style={{
          background: `linear-gradient(180deg, ${channelTint(ch, 0.14)} 0%, transparent 100%)`,
          padding: "26px 28px 20px",
        }}
      >
        <div className="flex items-start gap-4">
          <Avatar seed={contact.id} label={label} size={64} ring />
          <div className="min-w-0 flex-1 pt-1">
            <div
              className="text-[20px] font-semibold truncate"
              style={{
                color: "var(--color-text-primary)",
                fontFamily: "var(--ff-display)",
                letterSpacing: "-0.01em",
              }}
            >
              {label}
            </div>
            <div
              className="flex items-center gap-2 mt-1 text-[13px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {contact.phone && (
                <span className="flex items-center gap-1">
                  <Icon name="phone" size={13} /> {contact.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <ChannelDot channel={metaKey(ch)} size={13} radius={4} />
                {channelLabel(ch)}
                {channels > 1 ? ` +${channels - 1}` : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          {hasWhatsapp(data) && (
            <button
              type="button"
              onClick={onOpenChat}
              className="flex items-center gap-2 text-[13px] font-semibold rounded-[10px] px-3.5 py-2 cursor-pointer"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
                border: "none",
              }}
            >
              <Icon name="inbox" size={15} /> Abrir conversación
            </button>
          )}
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 text-[13px] font-semibold rounded-[10px] px-3.5 py-2 cursor-pointer"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              <Icon name="edit" size={14} /> Editar
            </button>
          )}
        </div>
      </div>

      <div
        className="flex flex-col gap-4"
        style={{ padding: "4px 28px 28px" }}
      >
        {/* Datos + Actividad grid */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "1.4fr 1fr" }}
        >
          <Card
            title="Datos"
            action={
              editing ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saveMut.isPending}
                    className="text-[12px] font-semibold rounded-[8px] px-2.5 py-1.5 cursor-pointer"
                    style={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => saveMut.mutate()}
                    disabled={saveMut.isPending}
                    className="text-[12px] font-semibold rounded-[8px] px-2.5 py-1.5 cursor-pointer"
                    style={{
                      background: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                      border: "none",
                      opacity: saveMut.isPending ? 0.6 : 1,
                    }}
                  >
                    {saveMut.isPending ? "Guardando…" : "Guardar"}
                  </button>
                </div>
              ) : undefined
            }
          >
            {editing ? (
              <div className="flex flex-col gap-3">
                <EditField
                  label="Nombre"
                  value={form.displayName}
                  onChange={(v) => setForm((s) => ({ ...s, displayName: v }))}
                />
                <EditField
                  label="Teléfono"
                  value={form.phone}
                  onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
                />
                <EditField
                  label="Email"
                  value={form.email}
                  onChange={(v) => setForm((s) => ({ ...s, email: v }))}
                />
                <EditField
                  label="Notas"
                  value={form.notes}
                  onChange={(v) => setForm((s) => ({ ...s, notes: v }))}
                  multiline
                />
                {saveMut.isError && (
                  <span
                    className="text-[12px]"
                    style={{ color: "var(--color-error)" }}
                  >
                    {(saveMut.error as Error)?.message ?? "No se pudo guardar"}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col">
                <FactRow icon="phone" label="Teléfono" value={contact.phone} />
                <FactRow icon="mail" label="Email" value={contact.email} />
                <FactRow
                  icon="fileText"
                  label="Notas"
                  value={contact.notes}
                  multiline
                />
              </div>
            )}
          </Card>

          <Card title="Actividad">
            <div className="flex flex-col">
              <FactRow
                icon="calendar"
                label="Creado"
                value={shortDate(contact.createdAt)}
              />
              <FactRow
                icon="clock"
                label="Actualizado"
                value={relativeTime(contact.updatedAt)}
              />
              <FactRow
                icon="link"
                label="Canales"
                value={`${channels} · ${identities.length} identidad${
                  identities.length === 1 ? "" : "es"
                }`}
              />
            </div>
          </Card>
        </div>

        {/* Identidades */}
        <Card title={`Identidades (${identities.length})`}>
          {identities.length === 0 ? (
            <span
              className="text-[13px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Sin identidades de canal.
            </span>
          ) : (
            <div className="flex flex-col gap-2">
              {identities.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center gap-3 rounded-[10px] px-3 py-2.5"
                  style={{
                    border: "1px solid var(--color-border)",
                    background: "var(--color-background)",
                  }}
                >
                  <span
                    className="flex items-center justify-center rounded-[9px] flex-shrink-0"
                    style={{
                      width: 34,
                      height: 34,
                      background: channelTint(i.channel, 0.16),
                    }}
                  >
                    <ChannelDot
                      channel={metaKey(i.channel)}
                      size={18}
                      radius={6}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[13px] font-semibold truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {channelLabel(i.channel)}
                    </div>
                    <div
                      className="text-[12px] truncate"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {identityValue(i)}
                    </div>
                  </div>
                  {i.channel === "whatsapp" && (
                    <button
                      type="button"
                      onClick={onOpenChat}
                      aria-label="Abrir conversación"
                      className="flex items-center gap-1 text-[12px] font-semibold rounded-[8px] px-2.5 py-1.5 cursor-pointer flex-shrink-0"
                      style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-primary)",
                      }}
                    >
                      Abrir <Icon name="chevronR" size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Cross-módulo: etiquetas, atributos custom y compartidos */}
        <ContactTagsCard contactId={contact.id} />
        <ContactAttributesCard contactId={contact.id} />
        <ContactSharedCard contactId={contact.id} />

        {/* Fusionar */}
        <MergePanel survivor={data} candidates={candidates} onMerged={onMerged} />

        {/* Eliminar (zona de peligro) */}
        <Card title="Eliminar contacto">
          {!confirmDelete ? (
            <div className="flex items-center justify-between gap-3">
              <span
                style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
              >
                Borra este contacto y sus identidades de canal. No se puede
                deshacer.
              </span>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-[13px] font-semibold rounded-[10px] px-3.5 py-2 cursor-pointer flex-shrink-0"
                style={{
                  background: "var(--color-error-bg)",
                  color: "var(--color-error)",
                  border: "1px solid var(--color-error)",
                }}
              >
                <Icon name="trash" size={14} /> Eliminar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <span
                style={{ fontSize: 13, color: "var(--color-text-secondary)" }}
              >
                ¿Eliminar <b>{label}</b> definitivamente? Sus conversaciones se
                conservan.
              </span>
              {removeMut.isError && (
                <span style={{ fontSize: 12, color: "var(--color-error)" }}>
                  {(removeMut.error as Error)?.message ?? "No se pudo eliminar"}
                </span>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={removeMut.isPending}
                  className="text-[13px] font-semibold rounded-[10px] px-3.5 py-2 cursor-pointer"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => removeMut.mutate()}
                  disabled={removeMut.isPending}
                  className="text-[13px] font-semibold rounded-[10px] px-3.5 py-2 cursor-pointer"
                  style={{
                    background: "var(--color-error)",
                    color: "var(--color-on-primary)",
                    border: "none",
                    opacity: removeMut.isPending ? 0.6 : 1,
                  }}
                >
                  {removeMut.isPending ? "Eliminando…" : "Eliminar definitivamente"}
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[14px]"
      style={{
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        padding: "16px 18px",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="text-[11px] font-bold uppercase"
          style={{
            letterSpacing: "0.06em",
            color: "var(--color-text-tertiary)",
          }}
        >
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function FactRow({
  icon,
  label,
  value,
  multiline,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  value?: string | null;
  multiline?: boolean;
}) {
  const empty = !value;
  return (
    <div
      className="flex items-start gap-3 py-2"
      style={{ borderBottom: "1px solid var(--color-border)" }}
    >
      <span
        className="flex items-center justify-center rounded-[8px] flex-shrink-0 mt-0.5"
        style={{
          width: 30,
          height: 30,
          background: "var(--color-background)",
          color: "var(--color-text-tertiary)",
        }}
      >
        <Icon name={icon} size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <div
          className="text-[11px] font-medium"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {label}
        </div>
        <div
          className="text-[14px]"
          style={{
            color: empty
              ? "var(--color-text-tertiary)"
              : "var(--color-text-primary)",
            whiteSpace: multiline ? "pre-wrap" : "normal",
            wordBreak: "break-word",
          }}
        >
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const baseStyle = {
    border: "1px solid var(--color-border)",
    background: "var(--color-background)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--ff-ui)",
  } as const;
  return (
    <label className="flex flex-col gap-1">
      <span
        className="text-[12px] font-medium"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="text-[14px] rounded-[9px] px-3 py-2 outline-none resize-y"
          style={baseStyle}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-[14px] rounded-[9px] px-3 py-2 outline-none"
          style={baseStyle}
        />
      )}
    </label>
  );
}

function MergePanel({
  survivor,
  candidates,
  onMerged,
}: {
  survivor: ContactWithIdentities;
  candidates: ContactWithIdentities[];
  onMerged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<ContactWithIdentities | null>(null);

  const mergeMut = useMutation({
    mutationFn: (loserId: string) =>
      contactsApi.merge(survivor.contact.id, loserId),
    onSuccess: () => {
      setOpen(false);
      setPicked(null);
      setQ("");
      onMerged();
    },
  });

  const filtered = candidates
    .filter((c) => {
      if (!q.trim()) return true;
      const hay = q.trim().toLowerCase();
      return (
        nameOf(c).toLowerCase().includes(hay) ||
        (c.contact.phone ?? "").toLowerCase().includes(hay)
      );
    })
    .slice(0, 6);

  return (
    <Card title="Fusionar duplicado">
      <p
        className="text-[12px] mt-[-4px] mb-3"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Absorbe otro contacto en este: sus identidades se moverán aquí y el
        duplicado se archiva.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          disabled={candidates.length === 0}
          className="flex items-center gap-1.5 text-[12px] font-semibold rounded-[8px] px-2.5 py-1.5 cursor-pointer"
          style={{
            background: "var(--color-background)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-secondary)",
            opacity: candidates.length === 0 ? 0.5 : 1,
          }}
        >
          <Icon name="link" size={13} /> Elegir contacto a fusionar
        </button>
      ) : picked ? (
        <div
          className="rounded-[10px] p-3"
          style={{
            border: "1px solid var(--color-border)",
            background: "var(--color-background)",
          }}
        >
          <div
            className="text-[13px] mb-2.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            ¿Fusionar <b>{nameOf(picked)}</b> en <b>{nameOf(survivor)}</b>? Esta
            acción no se puede deshacer.
          </div>
          {mergeMut.isError && (
            <div
              className="text-[12px] mb-2"
              style={{ color: "var(--color-error)" }}
            >
              {(mergeMut.error as Error)?.message ?? "No se pudo fusionar"}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPicked(null)}
              disabled={mergeMut.isPending}
              className="text-[12px] font-semibold rounded-[8px] px-3 py-1.5 cursor-pointer"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => mergeMut.mutate(picked.contact.id)}
              disabled={mergeMut.isPending}
              className="text-[12px] font-semibold rounded-[8px] px-3 py-1.5 cursor-pointer"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
                border: "none",
                opacity: mergeMut.isPending ? 0.6 : 1,
              }}
            >
              {mergeMut.isPending ? "Fusionando…" : "Fusionar"}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar contacto duplicado…"
            aria-label="Buscar contacto a fusionar"
            className="w-full text-[13px] rounded-[8px] px-3 py-2 outline-none mb-2"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-background)",
              color: "var(--color-text-primary)",
            }}
          />
          <div className="flex flex-col gap-1">
            {filtered.length === 0 ? (
              <span
                className="text-[12px] px-1 py-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Sin candidatos.
              </span>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.contact.id}
                  type="button"
                  onClick={() => setPicked(c)}
                  className="flex items-center gap-2.5 text-left rounded-[8px] px-2 py-1.5 cursor-pointer"
                  style={{ background: "transparent", border: "none" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--color-background)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Avatar seed={c.contact.id} label={nameOf(c)} size={30} />
                  <div className="min-w-0">
                    <div
                      className="text-[13px] font-medium truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {nameOf(c)}
                    </div>
                    <div
                      className="text-[11px] truncate"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {c.identities.length} identidad
                      {c.identities.length === 1 ? "" : "es"}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setQ("");
            }}
            className="text-[12px] mt-2 cursor-pointer"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-tertiary)",
            }}
          >
            Cerrar
          </button>
        </div>
      )}
    </Card>
  );
}
