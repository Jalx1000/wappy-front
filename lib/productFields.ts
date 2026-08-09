"use client";

import { useAttributesStore } from "@/store/attributes";
import type { FieldDef } from "@/components/attributes/data";

/** Campos "base" del producto real (backend `/products`). El resto de campos del
 *  módulo "products" en Atributos se consideran **personalizados**. */
export const PRODUCT_BASE_KEYS = [
  "name",
  "sku",
  "price",
  "category",
  "stock",
  "active",
  "description",
  "image",
];

/** Campos personalizados definidos sobre el módulo "products" (Atributos). */
export function useProductCustomFields(): FieldDef[] {
  const modules = useAttributesStore((s) => s.modules);
  const mod = modules.find((m) => m.id === "products");
  return mod ? mod.fields.filter((f) => !PRODUCT_BASE_KEYS.includes(f.key)) : [];
}
