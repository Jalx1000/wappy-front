"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChannelDot } from "@/components/ui/ChannelDot";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUIStore } from "@/store/ui";
import { metaKey, channelLabel } from "@/lib/channels";
import {
  socialInboxApi,
  type UnifiedConversation,
  type UnifiedMessage,
} from "@/lib/api/socialInbox";
import { pickRecorderMime, recordingToFile } from "@/lib/audio/voiceNote";
import { CopilotPanel } from "./CopilotPanel";
import { MacroMenu, filterMacros } from "./MacroMenu";
import { MacroManager } from "./MacroManager";
import { fillVars, type Macro } from "./macrosData";
import type { ConvMeta } from "./copilotEngine";
import { useMacrosStore } from "@/store/macros";
import { useMe } from "@/lib/hooks";
import { useTagsStore } from "@/store/tags";
import { tagDot } from "@/components/tags/data";
import { useContactTagsStore } from "@/store/contactTags";
import { SharePicker, type SharePayload } from "./SharePicker";
import { ProductCardBubble } from "./ProductCardBubble";
import { EmojiPicker } from "./EmojiPicker";
import { useSharedItemsStore } from "@/store/sharedItems";
import { useThreadCardsStore } from "@/store/threadCards";
import { ConvoDetailsPanel } from "./ConvoDetailsPanel";
import { SideConversationPanel } from "./SideConversationPanel";
import { InboxViewsRail } from "./InboxViewsRail";
import { ThreadActions } from "./ThreadActions";
import { ThreadBanners } from "./ThreadBanners";
import { useConvoStateStore } from "@/store/convoState";
import { matchesView } from "./views";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Peer avatar: shows the profile photo (Meta CDN) when we have one, else the
 *  initials chip. Meta avatar URLs are arbitrary/expiring hosts, so we use a
 *  plain <img> (next/image can't optimise them) with a graceful fallback. */
function PeerAvatar({
  label,
  avatarUrl,
  size,
}: {
  label: string;
  avatarUrl?: string | null;
  size: number;
}) {
  const [broken, setBroken] = useState(false);
  if (avatarUrl && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={label}
        onError={() => setBroken(true)}
        className="rounded-full object-cover flex-none"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="flex items-center justify-center text-white font-bold rounded-full flex-none"
      style={{ width: size, height: size, background: "#8891a7", fontSize: Math.round(size * 0.32) }}
    >
      {initials(label)}
    </span>
  );
}

function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}

// Full-screen image preview. Click anywhere (or Esc) to close.
function Lightbox({ url, alt, onClose }: { url: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <button
        aria-label="Cerrar"
        onClick={onClose}
        style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: 9999, border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Icon name="x" size={20} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }}
      />
    </div>
  );
}

// Renders a message's media inline. WhatsApp media needs the authenticated
// proxy (Graph URL requires the business token) → fetched as a blob. Messenger/
// Instagram attachments carry a public CDN url on the message itself, so we use
// it directly (no proxy). Images open a full-screen preview on click.
function WaMedia({ message }: { message: UnifiedMessage }) {
  // WhatsApp media is fetched through the authenticated proxy (needs the token);
  // Messenger/IG carry a public CDN url on the message → used directly.
  const isProxy = !!message.mediaId;
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!isProxy) return; // direct-url path is derived below, no fetch
    let objectUrl: string | null = null;
    let cancelled = false;
    socialInboxApi
      .getMediaUrl(message.id)
      .then((u) => {
        if (cancelled) {
          URL.revokeObjectURL(u);
        } else {
          objectUrl = u;
          setProxyUrl(u);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isProxy, message.id]);

  const url = isProxy ? proxyUrl : (message.mediaUrl ?? null);

  if (failed || (!isProxy && !url))
    return (
      <span className="flex items-center gap-1.5" style={{ opacity: 0.8 }}>
        <Icon name="image" size={14} /> No se pudo cargar el archivo
      </span>
    );
  if (!url)
    return (
      <span className="text-[12px]" style={{ opacity: 0.6 }}>
        Cargando…
      </span>
    );

  const t = message.type;
  if (t === "image" || t === "sticker")
    return (
      <>
        {/* Object URL from a blob — next/image can't optimize these. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={message.content ?? ""}
          onClick={() => setZoom(true)}
          style={{ maxWidth: 220, borderRadius: 10, display: "block", cursor: "zoom-in" }}
        />
        {zoom && <Lightbox url={url} alt={message.content ?? ""} onClose={() => setZoom(false)} />}
      </>
    );
  if (t === "video")
    return (
      <video src={url} controls style={{ maxWidth: 260, borderRadius: 10 }} />
    );
  if (t === "audio" || t === "voice")
    return <audio src={url} controls style={{ maxWidth: 240 }} />;
  // document
  const filename =
    (message.payload?.filename as string | undefined) || "documento";
  return (
    <a
      href={url}
      download={filename}
      className="flex items-center gap-1.5"
      style={{ color: "inherit", textDecoration: "underline" }}
    >
      <Icon name="fileText" size={14} /> {filename}
    </a>
  );
}

function renderBody(m: UnifiedMessage): React.ReactNode {
  if (m.revoked)
    return <span style={{ fontStyle: "italic" }}>Mensaje eliminado</span>;

  const p = m.payload ?? {};
  const row = (icon: React.ReactNode, label: React.ReactNode) => (
    <span className="flex items-center gap-1.5">
      {icon}
      {label}
    </span>
  );
  const withCaption = (node: React.ReactNode) => (
    <div className="flex flex-col gap-1">
      {node}
      {m.content && <span>{m.content}</span>}
    </div>
  );

  const hasMedia = !!m.mediaId || !!m.mediaUrl;
  switch (m.type) {
    case "image":
    case "video":
      return hasMedia
        ? withCaption(<WaMedia message={m} />)
        : row(
            <Icon name="image" size={14} />,
            m.content || (m.type === "video" ? "Video" : "Imagen"),
          );
    case "audio":
    case "voice":
      return hasMedia ? (
        <WaMedia message={m} />
      ) : (
        row(<Icon name="inbox" size={14} />, "Audio")
      );
    case "sticker":
      return hasMedia ? (
        <WaMedia message={m} />
      ) : (
        row(<Icon name="image" size={14} />, "Sticker")
      );
    case "file":
    case "document": {
      const filename = (p.filename as string) || "Documento";
      return hasMedia
        ? withCaption(<WaMedia message={m} />)
        : row(
            <Icon name="fileText" size={14} />,
            m.content && p.filename ? `${filename} — ${m.content}` : filename,
          );
    }
    case "location": {
      const lat = p.latitude as string | undefined;
      const lng = p.longitude as string | undefined;
      const label = m.content || "Ubicación";
      const href = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : undefined;
      return row(
        <Icon name="globe" size={14} />,
        href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{ color: "inherit", textDecoration: "underline" }}
          >
            {label}
          </a>
        ) : (
          label
        ),
      );
    }
    case "contacts":
      return row(<Icon name="user" size={14} />, m.content || "Contacto");
    default:
      return m.content || `[${m.type}]`;
  }
}

const DOC_ACCEPT =
  "application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";
const FILE_ATTACH_OPTIONS: Array<{
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  accept: string;
}> = [
  { icon: "image", label: "Imagen", accept: "image/*" },
  { icon: "image", label: "Video", accept: "video/*" },
  { icon: "inbox", label: "Audio", accept: "audio/*" },
  { icon: "fileText", label: "Documento", accept: DOC_ACCEPT },
];

const nameOf = (c: UnifiedConversation) => c.contact?.displayName || c.peer;

export function InboxView() {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id;
  const router = useRouter();
  // Deep-link from Contacts: /app/inbox?contact=<contactId> preselects the
  // matching conversation until the user picks another one.
  const contactParam = useSearchParams().get("contact");

  const [view, setView] = useState<string>("open");
  const tags = useTagsStore((s) => s.tags);
  const contactTagsByContact = useContactTagsStore((s) => s.byContact);
  const addShared = useSharedItemsStore((s) => s.add);
  const threadCardsByConvo = useThreadCardsStore((s) => s.byConvo);
  const addThreadCard = useThreadCardsStore((s) => s.addCard);
  const convoStateById = useConvoStateStore((s) => s.byId);
  const setConvoStatus = useConvoStateStore((s) => s.setStatus);
  const addNote = useConvoStateStore((s) => s.addNote);
  const [composerMode, setComposerMode] = useState<"reply" | "note">("reply");
  const [sendMenuOpen, setSendMenuOpen] = useState(false);
  const [selId, setSelId] = useState<string | undefined>(undefined);

  // Responsive: collapse the rail / details panel on narrow viewports.
  const [vw, setVw] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 1440));
  useEffect(() => {
    const on = () => setVw(window.innerWidth);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const showRail = vw >= 960;
  const showDetails = vw >= 1200;
  // Below this, panes can't sit side-by-side — switch to single-pane
  // master/detail (list, then thread with a back button).
  const isMobile = vw < 768;

  // Fetch every conversation once; the views rail filters client-side. Shares
  // the query cache with the sidebar badge and the command palette.
  const { data: conversations = [], isLoading: loadingList } = useQuery<
    UnifiedConversation[]
  >({
    queryKey: ["social-inbox", "conversations", brandId],
    queryFn: () => socialInboxApi.getConversations({}),
    enabled: !!brandId,
  });

  const activeId =
    selId && conversations.some((c) => c.id === selId)
      ? selId
      : (contactParam &&
          conversations.find((c) => c.contact?.id === contactParam)?.id) ||
        (isMobile ? undefined : conversations[0]?.id);
  const active = conversations.find((c) => c.id === activeId);

  const { data: messages = [], isLoading: loadingThread } = useQuery<
    UnifiedMessage[]
  >({
    queryKey: ["social-inbox", "messages", brandId, activeId],
    queryFn: () => socialInboxApi.getMessages(active!.id, active!.channel),
    enabled: !!brandId && !!active,
  });

  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const invalidateThread = () => {
    qc.invalidateQueries({
      queryKey: ["social-inbox", "messages", brandId, activeId],
    });
    qc.invalidateQueries({
      queryKey: ["social-inbox", "conversations", brandId],
    });
  };

  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      socialInboxApi.sendMessage(active!.id, active!.channel, text),
    onSuccess: () => {
      setDraft("");
      invalidateThread();
    },
  });
  const send = (alsoResolve = false) => {
    const t = draft.trim();
    if (!t || !active) return;
    if (composerMode === "note") {
      addNote(active.id, t, "Tú");
      setDraft("");
      return;
    }
    if (!sendMutation.isPending) {
      sendMutation.mutate(t);
      if (alsoResolve) setConvoStatus(active.id, "resolved");
    }
  };

  // ── Copilot + saved-reply macros ──────────────────────────────────────────
  const { macros } = useMacrosStore();
  const { data: me } = useMe();
  const agentName =
    [me?.firstName, me?.lastName].filter(Boolean).join(" ").trim() || undefined;

  const [copilotOpen, setCopilotOpen] = useState(false);
  const [macroManagerOpen, setMacroManagerOpen] = useState(false);
  const [macroActiveIdx, setMacroActiveIdx] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);

  // The '/' menu is active while the draft is a single "/token" (no spaces yet).
  const macroQuery =
    draft.startsWith("/") && !/\s/.test(draft.slice(1)) ? draft.slice(1) : null;
  const filteredMacros = macroQuery !== null ? filterMacros(macros, macroQuery) : [];
  const macroMenuOpen = macroQuery !== null && filteredMacros.length > 0;
  const macroIdx = Math.min(macroActiveIdx, Math.max(0, filteredMacros.length - 1));

  const contactName = active?.contact?.displayName || active?.peer || "";
  const pickMacro = (m: Macro) => {
    setDraft(fillVars(m.body, { name: contactName }, agentName));
    setMacroActiveIdx(0);
  };

  // Share a Help Center article / product into the conversation, and log it to the
  // contact's shared history (shown in Contacts). Products render as a rich card in
  // the thread; articles are sent as a text message.
  const doShare = (p: SharePayload) => {
    if (!active) return;
    if (p.kind === "product" && p.product) {
      addThreadCard(active.id, { productId: p.id, name: p.product.name, sku: p.product.sku, price: p.product.price, category: p.product.category });
    } else if (!sendMutation.isPending) {
      sendMutation.mutate(p.text);
    }
    if (active.contact?.id) addShared(active.contact.id, { id: p.id, kind: p.kind, title: p.title, subtitle: p.subtitle });
    setShareOpen(false);
  };

  // Copilot conversation context derived from the live thread.
  const customerText = messages
    .filter((m) => m.direction === "in")
    .map((m) => m.content || "")
    .join(" ");
  const copilotMeta: ConvMeta = {
    name: contactName || "El cliente",
    channelLabel: active ? channelLabel(active.channel) : "",
    inCount: messages.filter((m) => m.direction === "in").length,
    outCount: messages.filter((m) => m.direction === "out").length,
    firstCustomerMsg:
      messages.find((m) => m.direction === "in")?.content || undefined,
  };

  // View filtering for the conversation list (status/assignee/channel/tag).
  const convoTagIds = (c: UnifiedConversation) => (c.contact ? contactTagsByContact[c.contact.id] || [] : []);
  const visibleConversations = conversations.filter((c) => matchesView(c, view, convoStateById, contactTagsByContact));

  // Global inbox shortcuts (ignored while typing): E resolver · S posponer · J/K navegar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey || !active) return;
      const k = e.key.toLowerCase();
      if (k === "e") { e.preventDefault(); setConvoStatus(active.id, "resolved"); }
      else if (k === "s") { e.preventDefault(); setConvoStatus(active.id, "snoozed", new Date(Date.now() + 3600_000).toISOString()); }
      else if (k === "j" || k === "k") {
        e.preventDefault();
        const idx = visibleConversations.findIndex((c) => c.id === activeId);
        const t = visibleConversations[k === "j" ? idx + 1 : idx - 1];
        if (t) setSelId(t.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, activeId, visibleConversations, setConvoStatus]);

  // Auto-scroll the thread to the newest message on open / new message. Also fires
  // when an internal note or a product card is appended (they render after messages).
  const threadRef = useRef<HTMLDivElement>(null);
  const activeNotesCount = active ? convoStateById[active.id]?.notes.length ?? 0 : 0;
  const activeCardsCount = active ? threadCardsByConvo[active.id]?.length ?? 0 : 0;
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, activeId, activeNotesCount, activeCardsCount]);

  // Attachments (image/audio/video/document) — upload + send.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaMutation = useMutation({
    mutationFn: (vars: { file: File; caption?: string }) =>
      socialInboxApi.sendMedia(
        active!.id,
        active!.channel,
        vars.file,
        vars.caption,
      ),
    onSuccess: () => {
      setDraft("");
      invalidateThread();
    },
  });
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file && active && !mediaMutation.isPending)
      mediaMutation.mutate({ file, caption: draft.trim() || undefined });
  };

  // Voice notes — record from the mic, transcode to a WhatsApp-accepted format
  // (MP3 on Chrome, since it records webm/opus which WhatsApp rejects), send.
  const [recording, setRecording] = useState(false);
  const [encoding, setEncoding] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [recordError, setRecordError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelRef = useRef(false);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    setRecordError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordError("Tu navegador no permite grabar audio.");
      return;
    }
    const mime = pickRecorderMime();
    if (!mime) {
      setRecordError("La grabación de audio no está soportada aquí.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setRecordError("No se pudo acceder al micrófono. Revisa los permisos.");
      return;
    }
    streamRef.current = stream;
    cancelRef.current = false;
    chunksRef.current = [];
    const rec = new MediaRecorder(stream, { mimeType: mime });
    recorderRef.current = rec;
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = async () => {
      stopStream();
      setRecording(false);
      const blob = new Blob(chunksRef.current, { type: mime });
      chunksRef.current = [];
      recorderRef.current = null;
      if (cancelRef.current || blob.size === 0 || !active) return;
      try {
        setEncoding(true);
        const file = await recordingToFile(blob, mime);
        mediaMutation.mutate({ file });
      } catch (err) {
        setRecordError(
          err instanceof Error ? err.message : "No se pudo procesar el audio.",
        );
      } finally {
        setEncoding(false);
      }
    };
    rec.start();
    setRecording(true);
    setRecordSecs(0);
    timerRef.current = setInterval(() => setRecordSecs((s) => s + 1), 1000);
  };

  const stopRecording = () => {
    cancelRef.current = false;
    recorderRef.current?.stop();
  };
  const cancelRecording = () => {
    cancelRef.current = true;
    recorderRef.current?.stop();
  };

  // Abandon an in-progress recording when switching conversations, and clean up
  // the mic stream on unmount.
  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        cancelRef.current = true;
        recorderRef.current.stop();
      }
      stopStream();
    };
  }, [activeId]);

  const recordClock = `${Math.floor(recordSecs / 60)}:${String(
    recordSecs % 60,
  ).padStart(2, "0")}`;

  // Location.
  const [locOpen, setLocOpen] = useState(false);
  const [loc, setLoc] = useState({ lat: "", lng: "", name: "" });
  const locationMutation = useMutation({
    mutationFn: (l: { latitude: number; longitude: number; name?: string }) =>
      socialInboxApi.sendLocation(active!.id, active!.channel, l),
    onSuccess: () => {
      setLocOpen(false);
      setLoc({ lat: "", lng: "", name: "" });
      invalidateThread();
    },
  });
  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      setLoc((s) => ({
        ...s,
        lat: String(pos.coords.latitude),
        lng: String(pos.coords.longitude),
      })),
    );
  };
  const sendLoc = () => {
    const latitude = parseFloat(loc.lat);
    const longitude = parseFloat(loc.lng);
    if (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      active &&
      !locationMutation.isPending
    )
      locationMutation.mutate({
        latitude,
        longitude,
        name: loc.name || undefined,
      });
  };

  // Attachment menu: explicit options for every send type.
  const [attachOpen, setAttachOpen] = useState(false);
  const [accept, setAccept] = useState("");
  useEffect(() => {
    if (!attachOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAttachOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [attachOpen]);
  const pickFileType = (acceptStr: string) => {
    setAccept(acceptStr);
    setAttachOpen(false);
    // let `accept` apply before opening the native picker
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  return (
    <div
      className="h-full overflow-hidden"
      style={{
        display: "grid",
        // The thread track is minmax(0, 1fr) — a plain 1fr has an implicit
        // min-width of min-content, so wide thread content (header buttons,
        // media, long bubbles) would blow the track out and push the fixed
        // details column off/misaligned. minmax(0,…) lets it shrink instead.
        gridTemplateColumns: isMobile
          ? "minmax(0, 1fr)"
          : [
              showRail ? "224px" : null,
              "336px",
              "minmax(0, 1fr)",
              showDetails ? "340px" : null,
            ]
              .filter(Boolean)
              .join(" "),
      }}
    >
      {showRail && (
        <InboxViewsRail
          conversations={conversations}
          view={view}
          onSelect={(v) => {
            setView(v);
            setSelId(undefined);
          }}
        />
      )}

        {/* List pane — on mobile, only when no conversation is open */}
        {(!isMobile || !active) && (
        <div
          className="flex flex-col min-h-0"
          style={{ borderRight: "1px solid var(--color-border)" }}
        >
          <div className="overflow-y-auto flex-1">
            {loadingList ? (
              <div className="p-4 flex flex-col gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} style={{ height: 48 }} />
                ))}
              </div>
            ) : visibleConversations.length === 0 ? (
              <div className="p-2">
                <EmptyState
                  icon="inbox"
                  title="Sin conversaciones"
                  body="No hay chats para este filtro. Aparecerán aquí cuando lleguen mensajes de las cuentas conectadas."
                />
              </div>
            ) : (
              visibleConversations.map((c) => {
                const on = c.id === activeId;
                const label = nameOf(c);
                const rowTags = tags.filter((t) => convoTagIds(c).includes(t.id));
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelId(c.id)}
                    aria-label={`Abrir conversación con ${label}`}
                    aria-current={on ? "true" : undefined}
                    className="flex gap-3 w-full text-left border-none cursor-pointer items-center"
                    style={{
                      padding: "13px 14px",
                      background: on
                        ? "var(--color-primary-subtle)"
                        : "transparent",
                      borderBottom: "1px solid var(--color-border)",
                      borderLeft: on
                        ? "3px solid var(--color-primary)"
                        : "3px solid transparent",
                      fontFamily: "var(--ff-ui)",
                      transition: "background 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!on)
                        e.currentTarget.style.background =
                          "var(--color-background)";
                    }}
                    onMouseLeave={(e) => {
                      if (!on) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      <PeerAvatar label={label} avatarUrl={c.contact?.avatarUrl} size={38} />
                      <span className="absolute -bottom-[3px] -right-[3px]">
                        <ChannelDot
                          channel={metaKey(c.channel)}
                          size={16}
                          radius={5}
                        />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="truncate text-[14px] font-semibold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {label}
                        </span>
                        <span
                          className="text-[11px] flex-shrink-0"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {relativeTime(c.lastMessageAt)}
                        </span>
                      </div>
                      <span
                        className="truncate text-[12px] block"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {c.lastMessage || c.accountHandle || channelLabel(c.channel)}
                      </span>
                      {rowTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rowTags.map((t) => (
                            <span
                              key={t.id}
                              className="inline-flex items-center gap-1 rounded-full"
                              style={{ padding: "1px 7px 1px 5px", background: "var(--neutral-100)" }}
                            >
                              <span className="rounded-full" style={{ width: 6, height: 6, background: tagDot(t.color) }} />
                              <span className="text-[10.5px] font-medium" style={{ color: "var(--color-text-secondary)" }}>{t.name}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
        )}

        {/* Thread pane — on mobile, only when a conversation is open */}
        {(!isMobile || active) && (
        <div className="flex flex-col min-h-0 min-w-0">
          {!active ? (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon="inbox"
                title="Selecciona una conversación"
                body="Elige un chat de la izquierda para ver el historial."
              />
            </div>
          ) : (
            <>
              <div
                className="flex items-center gap-3"
                style={{
                  padding: "14px 18px",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                {isMobile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelId(undefined);
                      if (contactParam)
                        router.replace("/app/inbox", { scroll: false });
                    }}
                    aria-label="Volver a la lista"
                    className="flex items-center justify-center rounded-[9px] cursor-pointer flex-shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <Icon name="chevronL" size={18} />
                  </button>
                )}
                <ChannelDot
                  channel={metaKey(active.channel)}
                  size={34}
                  radius={9}
                />
                <div className="min-w-0 flex-1">
                  <div
                    className="text-[15px] font-semibold truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {nameOf(active)}
                  </div>
                  <div
                    className="text-[12px] truncate"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {channelLabel(active.channel)} · {active.accountHandle} ·{" "}
                    {active.peer}
                  </div>
                </div>
                {active.contact && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/app/contacts?id=${active.contact!.id}`)
                    }
                    aria-label="Ver contacto"
                    className="flex items-center gap-1.5 text-[12px] font-semibold rounded-[9px] px-2.5 py-1.5 cursor-pointer flex-shrink-0"
                    style={{
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <Icon name="user" size={14} /> {!isMobile && "Ver contacto"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setSideOpen(true); if (!convoStateById[active.id]?.sideWith) { /* picker shows */ } }}
                  title="Consultar en privado con un compañero"
                  aria-label="Consultar"
                  className="flex items-center gap-1.5 text-[12px] font-semibold rounded-[9px] px-2.5 py-1.5 cursor-pointer flex-shrink-0"
                  style={{
                    background: sideOpen ? "var(--color-warning-bg)" : "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    color: sideOpen ? "var(--color-warning)" : "var(--color-text-secondary)",
                  }}
                >
                  <Icon name="users" size={14} /> {!isMobile && "Consultar"}
                  {(convoStateById[active.id]?.sideThread.length ?? 0) > 0 && (
                    <span className="fobo-badge bg-[var(--color-warning-bg)] text-[var(--color-warning)]" style={{ padding: "0 6px", fontSize: 10 }}>{convoStateById[active.id]?.sideThread.length}</span>
                  )}
                </button>
                <ThreadActions convoId={active.id} />
              </div>

              <ThreadBanners
                convoId={active.id}
                messages={messages}
                resolved={convoStateById[active.id]?.status === "resolved"}
              />

              <div
                ref={threadRef}
                className="flex-1 overflow-y-auto flex flex-col gap-2"
                style={{
                  padding: "18px",
                  background: "var(--color-background)",
                }}
              >
                {loadingThread ? (
                  [0, 1, 2].map((i) => (
                    <Skeleton
                      key={i}
                      style={{
                        height: 40,
                        width: "60%",
                        alignSelf: i % 2 ? "flex-end" : "flex-start",
                      }}
                    />
                  ))
                ) : messages.length === 0 ? (
                  <div
                    className="text-[13px] text-center mt-6"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Sin mensajes en este hilo todavía.
                  </div>
                ) : (
                  messages.map((m) => {
                    const out = m.direction === "out";
                    return (
                      <div
                        key={m.id}
                        className="max-w-[72%] flex flex-col"
                        style={{ alignSelf: out ? "flex-end" : "flex-start" }}
                      >
                        <div
                          className="text-[14px] leading-snug"
                          style={{
                            padding: "9px 12px",
                            borderRadius: 12,
                            background: out
                              ? "var(--color-primary)"
                              : "var(--color-surface)",
                            color: out
                              ? "var(--color-on-primary)"
                              : "var(--color-text-primary)",
                            border: out
                              ? "none"
                              : "1px solid var(--color-border)",
                            fontStyle: m.revoked ? "italic" : "normal",
                            opacity: m.revoked ? 0.7 : 1,
                          }}
                        >
                          {renderBody(m)}
                        </div>
                        <span
                          className="text-[10px] mt-1"
                          style={{
                            color: "var(--color-text-secondary)",
                            alignSelf: out ? "flex-end" : "flex-start",
                          }}
                        >
                          {new Date(m.sentAt).toLocaleString()}
                          {m.edited ? " · editado" : ""}
                        </span>
                      </div>
                    );
                  })
                )}
                {(convoStateById[active.id]?.notes || [])
                  .slice()
                  .reverse()
                  .map((n) => (
                    <div key={n.id} className="max-w-[72%] flex flex-col" style={{ alignSelf: "flex-end" }}>
                      <div style={{ padding: "9px 12px", borderRadius: 12, background: "var(--color-warning-bg)", border: "1px solid var(--color-warning)", color: "var(--color-text-primary)", fontSize: 14, lineHeight: 1.4 }}>
                        <div className="flex items-center gap-1.5" style={{ fontSize: 10, fontWeight: 700, color: "var(--color-warning)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          <Icon name="fileText" size={12} /> Nota interna · el cliente no la ve
                        </div>
                        {n.text}
                      </div>
                      <span className="text-[10px] mt-1" style={{ color: "var(--color-text-secondary)", alignSelf: "flex-end" }}>
                        {n.author} · {new Date(n.at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                {(threadCardsByConvo[active.id] || []).map((card) => (
                  <div key={card.id} className="flex flex-col" style={{ alignSelf: "flex-end" }}>
                    <ProductCardBubble card={card} agent />
                    <span className="text-[10px] mt-1" style={{ color: "var(--color-text-secondary)", alignSelf: "flex-end" }}>
                      {new Date(card.at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Location panel */}
              {locOpen && (
                <div
                  className="flex items-center gap-2 flex-wrap"
                  style={{
                    padding: "10px 16px",
                    borderTop: "1px solid var(--color-border)",
                    background: "var(--color-background)",
                  }}
                >
                  <input
                    value={loc.lat}
                    onChange={(e) =>
                      setLoc((s) => ({ ...s, lat: e.target.value }))
                    }
                    placeholder="Latitud"
                    className="text-[13px] rounded-[8px] px-2 py-1.5 outline-none"
                    style={{
                      width: 120,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                  <input
                    value={loc.lng}
                    onChange={(e) =>
                      setLoc((s) => ({ ...s, lng: e.target.value }))
                    }
                    placeholder="Longitud"
                    className="text-[13px] rounded-[8px] px-2 py-1.5 outline-none"
                    style={{
                      width: 120,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                  <input
                    value={loc.name}
                    onChange={(e) =>
                      setLoc((s) => ({ ...s, name: e.target.value }))
                    }
                    placeholder="Nombre (opcional)"
                    className="flex-1 text-[13px] rounded-[8px] px-2 py-1.5 outline-none"
                    style={{
                      minWidth: 120,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={useMyLocation}
                    className="text-[13px] rounded-[8px] px-3 py-1.5 cursor-pointer"
                    style={{
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Mi ubicación
                  </button>
                  <button
                    type="button"
                    onClick={sendLoc}
                    disabled={
                      !loc.lat || !loc.lng || locationMutation.isPending
                    }
                    className="text-[13px] font-semibold rounded-[8px] px-3 py-1.5 cursor-pointer"
                    style={{
                      background: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                      border: "none",
                      opacity:
                        !loc.lat || !loc.lng || locationMutation.isPending
                          ? 0.6
                          : 1,
                    }}
                  >
                    {locationMutation.isPending ? "Enviando…" : "Enviar"}
                  </button>
                </div>
              )}

              {/* Reply / Note toggle */}
              <div
                className="flex items-center gap-1"
                style={{ padding: "8px 16px 0", borderTop: "1px solid var(--color-border)" }}
              >
                {(["reply", "note"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setComposerMode(m)}
                    className="cursor-pointer border-none rounded-full"
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      padding: "5px 12px",
                      fontFamily: "var(--font-ui)",
                      background:
                        composerMode === m
                          ? m === "note"
                            ? "var(--color-warning-bg)"
                            : "var(--color-primary-subtle)"
                          : "transparent",
                      color:
                        composerMode === m
                          ? m === "note"
                            ? "var(--color-warning)"
                            : "var(--color-primary-ink)"
                          : "var(--color-text-secondary)",
                    }}
                  >
                    {m === "reply" ? "Responder" : "Nota interna"}
                  </button>
                ))}
              </div>

              {/* Composer */}
              <div
                className="flex items-center gap-2"
                style={{
                  position: "relative",
                  padding: "10px 16px 12px",
                  background: composerMode === "note" ? "var(--color-warning-bg)" : "transparent",
                }}
              >
                {macroMenuOpen && (
                  <MacroMenu
                    query={macroQuery!}
                    macros={macros}
                    activeIdx={macroIdx}
                    onPick={pickMacro}
                    onHover={setMacroActiveIdx}
                  />
                )}
                {copilotOpen && active && (
                  <CopilotPanel
                    meta={copilotMeta}
                    customerText={customerText}
                    draft={draft}
                    onInsert={(t) => {
                      setDraft((prev) => (prev.trim() ? prev + "\n" + t : t));
                      setCopilotOpen(false);
                    }}
                    onReplace={(t) => setDraft(t)}
                    onClose={() => setCopilotOpen(false)}
                  />
                )}
                {macroManagerOpen && (
                  <MacroManager onClose={() => setMacroManagerOpen(false)} />
                )}
                {shareOpen && active && (
                  <SharePicker initialTab="article" onClose={() => setShareOpen(false)} onShare={doShare} />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  onChange={onPickFile}
                  accept={accept || undefined}
                />
                {recording ? (
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      aria-label="Cancelar grabación"
                      title="Cancelar"
                      className="flex items-center justify-center rounded-[10px] cursor-pointer flex-shrink-0"
                      style={{
                        width: 38,
                        height: 38,
                        background: "var(--color-background)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-error)",
                      }}
                    >
                      <Icon name="trash" size={17} />
                    </button>
                    <span
                      className="rounded-full animate-pulse flex-shrink-0"
                      style={{
                        width: 10,
                        height: 10,
                        background: "var(--color-error)",
                      }}
                    />
                    <span
                      className="text-[13px] tabular-nums"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Grabando… {recordClock}
                    </span>
                    <div className="flex-1" />
                    <button
                      type="button"
                      onClick={stopRecording}
                      aria-label="Enviar nota de voz"
                      className="flex items-center gap-2 text-[14px] font-semibold rounded-[10px] px-4 py-2 cursor-pointer flex-shrink-0"
                      style={{
                        background: "var(--color-primary)",
                        color: "var(--color-on-primary)",
                        border: "none",
                      }}
                    >
                      <Icon name="send" size={16} /> Enviar
                    </button>
                  </div>
                ) : (
                <>
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    title="Adjuntar"
                    aria-label="Adjuntar archivo o ubicación"
                    aria-haspopup="menu"
                    aria-expanded={attachOpen}
                    onClick={() => setAttachOpen((v) => !v)}
                    disabled={mediaMutation.isPending}
                    className="flex items-center justify-center rounded-[10px] cursor-pointer text-[20px] leading-none"
                    style={{
                      width: 38,
                      height: 38,
                      background: attachOpen
                        ? "var(--color-primary-subtle)"
                        : "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    +
                  </button>
                  {attachOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[10]"
                        onClick={() => setAttachOpen(false)}
                      />
                      <div
                        className="absolute z-[20]"
                        style={{
                          bottom: 46,
                          left: 0,
                          minWidth: 180,
                          background: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 12,
                          boxShadow: "var(--shadow-3)",
                          padding: 6,
                        }}
                      >
                        {FILE_ATTACH_OPTIONS.map((o) => (
                          <button
                            key={o.label}
                            type="button"
                            onClick={() => pickFileType(o.accept)}
                            className="flex items-center gap-2.5 w-full text-left rounded-[8px] px-3 py-2 cursor-pointer text-[13px]"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--color-text-primary)",
                              fontFamily: "var(--ff-ui)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--color-background)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <Icon name={o.icon} size={15} />
                            {o.label}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setAttachOpen(false);
                            setLocOpen(true);
                          }}
                          className="flex items-center gap-2.5 w-full text-left rounded-[8px] px-3 py-2 cursor-pointer text-[13px]"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--color-text-primary)",
                            fontFamily: "var(--ff-ui)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--color-background)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <Icon name="globe" size={15} />
                          Ubicación
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  title="Copilot (asistente IA)"
                  aria-label="Abrir Copilot"
                  onClick={() => setCopilotOpen((v) => !v)}
                  className="flex items-center justify-center rounded-[10px] cursor-pointer flex-shrink-0"
                  style={{
                    width: 38,
                    height: 38,
                    background: copilotOpen
                      ? "var(--color-primary-subtle)"
                      : "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    color: copilotOpen
                      ? "var(--color-primary-ink)"
                      : "var(--color-text-secondary)",
                  }}
                >
                  <Icon name="spark" size={17} />
                </button>
                <button
                  type="button"
                  title="Respuestas guardadas (escribe /)"
                  aria-label="Respuestas guardadas"
                  onClick={() => setMacroManagerOpen(true)}
                  className="flex items-center justify-center rounded-[10px] cursor-pointer flex-shrink-0"
                  style={{
                    width: 38,
                    height: 38,
                    background: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <Icon name="zap" size={17} />
                </button>
                <button
                  type="button"
                  title="Compartir artículo o producto"
                  aria-label="Compartir artículo o producto"
                  onClick={() => setShareOpen(true)}
                  className="flex items-center justify-center rounded-[10px] cursor-pointer flex-shrink-0"
                  style={{
                    width: 38,
                    height: 38,
                    background: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <Icon name="book" size={17} />
                </button>
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    title="Emoji"
                    aria-label="Insertar emoji"
                    aria-haspopup="menu"
                    aria-expanded={emojiOpen}
                    onClick={() => setEmojiOpen((v) => !v)}
                    className="flex items-center justify-center rounded-[10px] cursor-pointer"
                    style={{
                      width: 38,
                      height: 38,
                      background: emojiOpen ? "var(--color-primary-subtle)" : "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      color: emojiOpen ? "var(--color-primary-ink)" : "var(--color-text-secondary)",
                    }}
                  >
                    <Icon name="smile" size={17} />
                  </button>
                  {emojiOpen && (
                    <EmojiPicker
                      onPick={(e) => setDraft((d) => d + e)}
                      onClose={() => setEmojiOpen(false)}
                    />
                  )}
                </div>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (macroMenuOpen) {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setMacroActiveIdx((i) => Math.min(i + 1, filteredMacros.length - 1));
                        return;
                      }
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setMacroActiveIdx((i) => Math.max(i - 1, 0));
                        return;
                      }
                      if (e.key === "Enter") {
                        e.preventDefault();
                        pickMacro(filteredMacros[macroIdx]);
                        return;
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        setDraft("");
                        return;
                      }
                    }
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder={
                    composerMode === "note"
                      ? "Escribe una nota interna (el cliente no la ve)…"
                      : encoding
                        ? "Procesando audio…"
                        : mediaMutation.isPending
                          ? "Enviando archivo…"
                          : "Escribe un mensaje…"
                  }
                  className="flex-1 text-[14px] rounded-[10px] px-3 py-2 outline-none"
                  style={{
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    fontFamily: "var(--ff-ui)",
                  }}
                />
                {draft.trim() ? (
                  composerMode === "note" ? (
                    <button
                      type="button"
                      onClick={() => send()}
                      className="text-[14px] font-semibold rounded-[10px] px-4 py-2 cursor-pointer flex-shrink-0"
                      style={{ background: "var(--color-warning)", color: "#fff", border: "none" }}
                    >
                      Añadir nota
                    </button>
                  ) : (
                    <div className="relative flex-shrink-0 flex">
                      <button
                        onClick={() => send()}
                        disabled={sendMutation.isPending}
                        className="text-[14px] font-semibold px-4 py-2 cursor-pointer"
                        style={{
                          background: "var(--color-primary)",
                          color: "var(--color-on-primary)",
                          border: "none",
                          borderRadius: "10px 0 0 10px",
                          opacity: sendMutation.isPending ? 0.6 : 1,
                        }}
                      >
                        {sendMutation.isPending ? "Enviando…" : "Enviar"}
                      </button>
                      <button
                        type="button"
                        aria-label="Opciones de envío"
                        onClick={() => setSendMenuOpen((v) => !v)}
                        className="flex items-center justify-center cursor-pointer"
                        style={{ background: "var(--color-primary)", color: "var(--color-on-primary)", border: "none", borderLeft: "1px solid rgba(0,0,0,0.18)", borderRadius: "0 10px 10px 0", padding: "0 8px" }}
                      >
                        <Icon name="chevronDown" size={14} />
                      </button>
                      {sendMenuOpen && (
                        <>
                          <div className="fixed inset-0 z-[40]" onClick={() => setSendMenuOpen(false)} />
                          <div className="absolute z-[41]" style={{ bottom: "calc(100% + 8px)", right: 0, minWidth: 190, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, boxShadow: "var(--shadow-3)", padding: 6 }}>
                            <button onClick={() => { send(true); setSendMenuOpen(false); }} className="flex items-center gap-2 w-full text-left rounded-[8px] cursor-pointer" style={{ padding: "8px 10px", background: "transparent", border: "none", color: "var(--color-text-primary)", fontSize: 13 }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                              <Icon name="check2" size={14} style={{ color: "var(--color-success)" }} /> Enviar y resolver
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )
                ) : composerMode === "note" ? null : (
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={encoding || mediaMutation.isPending}
                    aria-label="Grabar nota de voz"
                    title="Grabar nota de voz"
                    className="flex items-center justify-center rounded-[10px] cursor-pointer flex-shrink-0"
                    style={{
                      width: 44,
                      height: 38,
                      background: "var(--color-primary)",
                      color: "var(--color-on-primary)",
                      border: "none",
                      opacity: encoding || mediaMutation.isPending ? 0.6 : 1,
                    }}
                  >
                    <Icon name="mic" size={18} />
                  </button>
                )}
                </>
                )}
              </div>
              {(sendMutation.isError ||
                mediaMutation.isError ||
                locationMutation.isError ||
                recordError) && (
                <div
                  className="text-[12px] px-4 pb-2"
                  style={{ color: "var(--color-error)" }}
                >
                  {recordError ??
                    ((
                      (sendMutation.error ||
                        mediaMutation.error ||
                        locationMutation.error) as Error
                    )?.message ??
                      "No se pudo enviar")}
                </div>
              )}
            </>
          )}
        </div>
        )}

      {showDetails &&
        (active ? (
          sideOpen ? (
            <SideConversationPanel convoId={active.id} onClose={() => setSideOpen(false)} />
          ) : (
            <ConvoDetailsPanel conversation={active} copilotMeta={copilotMeta} />
          )
        ) : (
          <div style={{ background: "var(--color-surface)", borderLeft: "1px solid var(--color-border)" }} />
        ))}
    </div>
  );
}
