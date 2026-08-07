export type TagColor = "primary" | "success" | "warning" | "error" | "blue" | "pink";

export const TAG_COLORS: { id: TagColor; dot: string }[] = [
  { id: "primary", dot: "var(--color-primary)" },
  { id: "success", dot: "var(--color-success)" },
  { id: "warning", dot: "var(--color-warning)" },
  { id: "error",   dot: "var(--color-error)" },
  { id: "blue",    dot: "#0A7CFF" },
  { id: "pink",    dot: "#E1306C" },
];

export const tagDot = (c: TagColor): string =>
  (TAG_COLORS.find((x) => x.id === c) || TAG_COLORS[0]).dot;

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
  uses: number;
}

export const TAGS_SEED: Tag[] = [
  { id: "tg1", name: "facturación", color: "primary", uses: 12 },
  { id: "tg2", name: "vip",         color: "warning", uses: 5 },
  { id: "tg3", name: "cuentas",     color: "blue",    uses: 8 },
  { id: "tg4", name: "transferencias", color: "success", uses: 6 },
  { id: "tg5", name: "bug",         color: "error",   uses: 3 },
];
