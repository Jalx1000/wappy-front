"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useCreateProduct, useUpdateProduct } from "@/lib/hooks";
import { useUIStore } from "@/store/ui";
import { BRANDS as BRANDS_FALLBACK } from "@/lib/mocks/data";
import type { Product } from "@/lib/mocks/analyticsData";

const CATEGORIES = ["Electronics", "Apparel", "Services", "Subscriptions"];

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
  onDelete?: () => void;
}

export function ProductForm({ product, onClose, onDelete }: ProductFormProps) {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id ?? BRANDS_FALLBACK[0].id;
  const create = useCreateProduct(brandId);
  const update = useUpdateProduct(brandId);
  const toast = useToast();

  const p: any = product ?? {};
  // ⚠️ Frontend Brand.id es string (store/ui.ts), Backend Product.brandId es INT.
  // Siempre convertimos a Number antes de enviar.
  const resolvedBrandId: number = p.brandId
    ? Number(p.brandId)
    : activeBrand?.id
      ? Number(activeBrand.id)
      : 0;

  const [sku, setSku] = useState(p.sku ?? "");
  const [name, setName] = useState(p.name ?? product?.title ?? "");
  const [description, setDescription] = useState(p.description ?? "");
  const [price, setPrice] = useState(p.price ?? "");
  const [stock, setStock] = useState(p.stock ?? "1");
  const [category, setCategory] = useState(p.category ?? "");
  const [image, setImage] = useState(p.image ?? "");
  const [isActive, setIsActive] = useState(p.isActive ?? true);

  const handleSave = () => {
    if (!resolvedBrandId) {
      toast("Marca no identificada", "error");
      return;
    }
    if (!sku.trim() || !name.trim() || !price.toString().trim() || !category.trim()) {
      toast("Completa SKU, nombre, precio y categoría", "error");
      return;
    }

    const stockNum = parseInt(stock.toString(), 10) || 1;

    const payload = {
      sku: sku.trim(),
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price.toString()) || 0,
      stock: stockNum < 1 ? 1 : stockNum,
      category,
      brandId: Number(resolvedBrandId),  // 🔐 garantía: number para el backend
      image: image.trim() || null,
      isActive,
    };

    if (product) {
      update.mutate({ id: product.id, data: payload });
    } else {
      create.mutate(payload);
    }

    onClose();
    toast(product ? "Producto actualizado" : "Producto creado");
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto p-4"
        style={{ background: "var(--color-overlay-scrim)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          className="w-[680px] max-w-full"
          style={{ background: "var(--color-surface)", borderRadius: 16, boxShadow: "var(--shadow-3)", padding: 24 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="font-semibold text-[16px]" style={{ color: "var(--color-text-primary)" }}>
              {product ? "Editar producto" : "Nuevo producto"}
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full border-none cursor-pointer"
              style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}
              title="Cerrar"
            >
              <Icon name="x" size={15} />
            </button>
          </div>

          <div className="flex max-h-[calc(100vh-190px)] flex-col gap-4 overflow-y-auto">
            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                SKU *
              </label>
              <input className="fobo-input" placeholder="SKU-001" value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>

            {activeBrand && (
              <div className="text-[12px] px-3 py-2 rounded-lg" style={{ background: "var(--color-background)", color: "var(--color-text-secondary)" }}>
                <span className="font-semibold">Marca:</span> {activeBrand.name}{" "}
                <span className="opacity-60">(#{resolvedBrandId})</span>
              </div>
            )}

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Product name *
              </label>
              <input className="fobo-input" placeholder="Nombre del producto" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Description
              </label>
              <textarea
                className="fobo-input min-h-[84px] resize-y"
                placeholder="Descripción del producto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="fobo-input pl-7"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Stock
                </label>
                <input
                  type="number"
                  min="1"
                  className="fobo-input"
                  placeholder="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Category *
              </label>
              <select className="fobo-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Image URL
              </label>
              <input className="fobo-input" placeholder="https://..." value={image} onChange={(e) => setImage(e.target.value)} />
            </div>

            <div>
              <label className="text-[12px] font-semibold block mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Active
              </label>
              <div className="flex items-center h-[42px]">
                <button
                  role="switch"
                  aria-checked={isActive}
                  onClick={() => setIsActive(!isActive)}
                  className="relative border-none cursor-pointer flex-shrink-0"
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 9999,
                    background: isActive ? "var(--color-primary)" : "var(--neutral-400)",
                    transition: "background 160ms ease",
                    padding: 0,
                  }}
                >
                  <span
                    className="absolute"
                    style={{
                      top: 2,
                      left: 2,
                      width: 20,
                      height: 20,
                      borderRadius: 9999,
                      background: "#fff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                      transition: "transform 160ms ease",
                      transform: isActive ? "translateX(20px)" : "none",
                    }}
                  />
                </button>
                <span className="ml-3 text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                  {isActive ? "Yes" : "No"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {product && onDelete && (
                <button
                  className="fobo-btn fobo-btn-sm"
                  style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}
                  onClick={onDelete}
                  title="Eliminar producto"
                >
                  <Icon name="trash" size={14} />
                </button>
              )}
              <button className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1" onClick={onClose}>
                Cancelar
              </button>
              <button className="fobo-btn fobo-btn-primary fobo-btn-sm flex-1" onClick={handleSave}>
                {product ? "Guardar" : "Crear"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
