import { CHANNEL_META } from "@/lib/mocks/data";

// Backend ChannelEnum → CHANNEL_META key (the front uses simplified keys).
// Shared by the inbox and the contacts module so the mapping never drifts.
export const CHANNEL_KEY: Record<string, string> = {
  whatsapp: "whatsapp",
  instagram: "instagram",
  instagram_login: "instagramlogin",
  facebook_page: "facebook",
  tiktok: "tiktok",
  linkedin: "linkedin",
  youtube: "youtube",
};

export const metaKey = (ch: string) => CHANNEL_KEY[ch] ?? ch;
export const channelLabel = (ch: string) =>
  CHANNEL_META[metaKey(ch)]?.label ?? ch;

// Brand color for a channel, normalized to #RRGGBB (some meta colors carry an
// 8-digit alpha suffix which breaks rgba composition).
export function channelColor(ch: string): string {
  const raw = CHANNEL_META[metaKey(ch)]?.color ?? "#8891a7";
  return raw.length > 7 ? raw.slice(0, 7) : raw;
}

/** channelColor as an rgba() string at the given alpha (0–1). */
export function channelTint(ch: string, alpha: number): string {
  const hex = channelColor(ch);
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
