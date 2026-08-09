"use client";

import { create } from "zustand";
import type { AttrValue } from "@/components/attributes/data";

type ValuesByProduct = Record<string, Record<string, AttrValue>>;

interface ProductAttributesState {
  /** Valores de campos personalizados por producto: `{ [productId]: { [fieldKey]: value } }`.
   *  Cliente-side por ahora: el backend de productos aún no persiste campos custom;
   *  las *definiciones* de campo viven en el módulo "products" del store de Atributos. */
  values: ValuesByProduct;
  setValues: (productId: string, vals: Record<string, AttrValue>) => void;
}

export const useProductAttributesStore = create<ProductAttributesState>((set) => ({
  values: {},
  setValues: (productId, vals) =>
    set((s) => ({
      values: { ...s.values, [productId]: { ...s.values[productId], ...vals } },
    })),
}));
