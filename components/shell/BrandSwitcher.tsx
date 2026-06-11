"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { useUIStore } from "@/store/ui";
import { useBrands } from "@/lib/hooks";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";

export function BrandSwitcher() {
  const [open, setOpen] = useState(false);
  const { activeBrand, setActiveBrand } = useUIStore();
  const { data: brands = BRANDS_FALLBACK } = useBrands();
  const brand = activeBrand ?? brands[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-[10px] h-[42px] px-3 rounded-[11px] border cursor-pointer"
        style={{
          border: "1px solid var(--color-border)",
          background: "var(--color-background)",
          fontFamily: "var(--font-ui)",
        }}
      >
        <span
          className="flex items-center justify-center text-white font-bold text-[12px] flex-shrink-0"
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: brand.tint,
          }}
        >
          {brand.short}
        </span>
        <div className="text-left">
          <div
            className="text-[13.5px] font-semibold leading-none"
            style={{ color: "var(--color-text-primary)" }}
          >
            {brand.name}
          </div>
          <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
            {brand.industry}
          </div>
        </div>
        <Icon
          name="chevronD"
          size={16}
          style={{ color: "var(--color-text-tertiary)" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.12 }}
              className="absolute top-[50px] left-0 w-[280px] rounded-[14px] p-[6px] z-50"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-3)",
              }}
            >
              <div
                className="text-[11px] font-bold uppercase px-[10px] py-[8px] pb-[6px]"
                style={{
                  letterSpacing: "0.05em",
                  color: "var(--color-text-tertiary)",
                }}
              >
                Marcas · {brands.length}
              </div>
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    setActiveBrand(b);
                    setOpen(false);
                  }}
                  className="flex items-center gap-[11px] w-full px-[10px] py-[9px] rounded-[9px] text-left border-none cursor-pointer"
                  style={{
                    background: b.id === brand.id ? "var(--color-primary-subtle)" : "transparent",
                    fontFamily: "var(--font-ui)",
                  }}
                  onMouseEnter={(e) => {
                    if (b.id !== brand.id)
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "var(--color-background)";
                  }}
                  onMouseLeave={(e) => {
                    if (b.id !== brand.id)
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <span
                    className="flex items-center justify-center text-white font-bold text-[12px] flex-shrink-0"
                    style={{ width: 30, height: 30, borderRadius: 8, background: b.tint }}
                  >
                    {b.short}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[13.5px] font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {b.name}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                      {b.industry} · {b.plan}
                    </div>
                  </div>
                  {b.id === brand.id && (
                    <Icon name="check" size={16} style={{ color: "var(--color-primary-ink)" }} />
                  )}
                </button>
              ))}
              <div
                className="mt-1 pt-1"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                <button
                  className="flex items-center gap-[9px] w-full px-[10px] py-[9px] rounded-[9px] border-none cursor-pointer text-[13px] font-semibold"
                  style={{
                    background: "transparent",
                    color: "var(--color-primary-ink)",
                    fontFamily: "var(--font-ui)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background =
                      "var(--color-primary-subtle)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
                  }
                >
                  <Icon name="plus" size={16} /> Añadir marca
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
