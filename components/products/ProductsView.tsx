"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useProducts } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import type { IconName } from "@/components/ui/Icon";
import { ProductsTab } from "./ProductsTab";
import { ProductForm } from "./ProductForm";
import type { Product } from "@/lib/api/product";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export function ProductsView() {
  const [activeForm, setActiveForm] = useState(false);
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const { data: products = [] } = useProducts(brandId, { limit: 50 });

  const stats = useMemo<Array<{ label: string; value: string; hint: string; icon: IconName }>>(() => {
    const currentBrandId = Number(brandId);
    // 🔒 Aislamiento por marca (defense-in-depth):
    // Solo contabilizar productos que pertenezcan a la marca activa.
    const list = ((products as Product[]) ?? []).filter(
      (p) => !currentBrandId || Number(p.brandId) === currentBrandId,
    );

    const total = list.length;
    const activeProducts = list.filter((p) => Boolean(p.isActive)).length;
    const inventoryValue = list.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0),
      0,
    );
    const lowStock = list.filter((p) => (Number(p.stock) || 0) <= 5).length;

    return [
      { label: "Total productos", value: `${total}`, hint: "en catálogo", icon: "products" },
      { label: "Productos activos", value: `${activeProducts}`, hint: `${activeProducts} disponibles para venta`, icon: "checkCircle" as IconName },
      { label: "Valor inventario", value: formatCurrency(inventoryValue), hint: "Σ (precio × stock)", icon: "chart" },
      { label: "Stock bajo", value: `${lowStock}`, hint: lowStock === 1 ? "requiere reabastecimiento" : "requieren reabastecimiento", icon: "alert" as IconName },
    ];
  }, [products, brandId]);


  return (
    <div className="h-full overflow-hidden flex flex-col bg-[var(--color-background)]">
      <div className="flex-none px-4 py-4 sm:px-6 lg:px-7 lg:py-6">
        {/* <DemoBanner module="Productos" /> */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="min-w-0">
                <h1
                  className="text-[22px] sm:text-[24px] font-semibold"
                  style={{ fontFamily: "var(--ff-display)", color: "var(--color-text-primary)" }}
                >
                  Productos
                </h1>
                <p className="text-[13px] sm:text-[14px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                  Controla catálogo, disponibilidad, acuerdos y cobros desde un solo flujo.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap lg:justify-end">
            <button className="fobo-btn fobo-btn-secondary fobo-btn-sm">
              <Icon name="download" size={15} />
              Exportar
            </button>
            <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setActiveForm(true)}>
              <Icon name="plus" size={15} />
              Nuevo producto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-[8px] border px-4 py-3"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                  {item.label}
                </span>
                <Icon name={item.icon} size={15} style={{ color: "var(--color-text-tertiary)" }} />
              </div>
              <div className="mt-2 text-[24px] font-semibold tnum" style={{ fontFamily: "var(--ff-display)" }}>
                {item.value}
              </div>
              <div className="mt-1 text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                {item.hint}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-7">
        <ProductsTab />
      </div>
      {activeForm && <ProductForm onClose={() => setActiveForm(false)} />}
    </div>
  );
}
