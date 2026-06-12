"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useUIStore } from "@/store/ui";
import { useUploadFile } from "@/lib/hooks";
import { UploadError } from "@/lib/api/files";

const ACCEPT = "image/*,application/pdf";

function isImage(name: string, path: string) {
  return /\.(png|jpe?g|gif|webp|svg)$/i.test(name) || /\.(png|jpe?g|gif|webp|svg)$/i.test(path);
}

export function AssetsView() {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { activeBrand, uploadedAssets, addAsset, removeAsset } = useUIStore();
  const upload = useUploadFile();
  const [dragOver, setDragOver] = useState(false);

  const brandId = activeBrand?.id ?? null;
  const assets = uploadedAssets.filter(
    (a) => a.brandId === brandId || a.brandId === null,
  );

  const triggerInput = () => inputRef.current?.click();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      try {
        const result = await upload.mutateAsync(file);
        addAsset({
          id: result.id,
          path: result.path,
          name: file.name,
          uploadedAt: new Date().toISOString(),
          brandId,
        });
        toast(`"${file.name}" subido ✓`);
      } catch (e) {
        if (e instanceof UploadError) {
          toast(e.message, "info");
        } else {
          toast("Error al subir archivo", "info");
        }
      }
    }
  };

  const handleRemove = (a: { id: string; name: string }) => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(`¿Quitar "${a.name}" de la galería?`);
      if (!ok) return;
    }
    removeAsset(a.id);
    toast(`"${a.name}" removido de la galería`, "info");
  };

  return (
    <div className="p-7 overflow-y-auto h-full">
      <div
        className="mb-5 px-3 py-[10px] rounded-[10px] text-[12.5px]"
        style={{
          background: "var(--color-primary-subtle)",
          color: "var(--color-primary-ink)",
        }}
      >
        <Icon name="info" size={13} /> El backend acepta imágenes y PDF en{" "}
        <code>POST /api/v1/files/upload</code>. La galería se guarda en este
        navegador hasta que backend agregue un endpoint para listar archivos.
      </div>

      <div className="flex items-end gap-4 mb-6 flex-wrap">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
            }}
          >
            Artes (DAM)
          </h1>
          <p
            className="text-[14px] mt-[5px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Subí piezas a la galería de{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {activeBrand?.name ?? "esta marca"}
            </strong>{" "}
            · {assets.length} archivo{assets.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={triggerInput}
            disabled={upload.isPending}
            className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-2"
          >
            <Icon name="plus" size={14} />
            {upload.isPending ? "Subiendo…" : "Subir archivo"}
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={triggerInput}
        className="rounded-[16px] p-10 text-center cursor-pointer mb-6"
        style={{
          background: dragOver
            ? "var(--color-primary-subtle)"
            : "var(--color-background)",
          border: `2px dashed ${dragOver ? "var(--color-primary)" : "var(--color-border)"}`,
          color: "var(--color-text-secondary)",
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <Icon name="image" size={28} color="var(--color-text-tertiary)" />
          <div className="text-[14px] font-semibold">
            Arrastra una imagen o PDF aquí, o haz click para elegir
          </div>
          <div className="text-[12px]">
            Permitidos: PNG, JPG, GIF, WEBP, SVG, PDF
          </div>
        </div>
      </div>

      {/* Gallery */}
      {assets.length === 0 ? (
        <div
          className="fobo-card p-10 text-center"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <Icon name="image" size={36} color="var(--color-text-tertiary)" />
          <div className="text-[14px] mt-3 mb-1" style={{ color: "var(--color-text-primary)" }}>
            Sube tu primer archivo
          </div>
          <div className="text-[12.5px]">
            Las piezas se almacenan en tu navegador después de subirlas.
          </div>
        </div>
      ) : (
        <motion.div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {assets.map((a) => (
            <div
              key={a.id}
              className="fobo-card overflow-hidden flex flex-col"
              style={{ border: "1px solid var(--color-border)" }}
            >
              <div
                className="relative w-full"
                style={{
                  paddingTop: "62%",
                  background: "var(--color-background)",
                }}
              >
                {isImage(a.name, a.path) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.path}
                    alt={a.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Icon name="file" size={32} color="var(--color-text-secondary)" />
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      PDF
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <div
                  className="text-[13px] font-semibold mb-1 truncate"
                  style={{ color: "var(--color-text-primary)" }}
                  title={a.name}
                >
                  {a.name}
                </div>
                <div
                  className="text-[11.5px] mb-3"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {new Date(a.uploadedAt).toLocaleDateString("es-BO", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                <div className="flex gap-2 mt-auto">
                  <a
                    href={a.path}
                    target="_blank"
                    rel="noreferrer"
                    className="fobo-btn fobo-btn-secondary fobo-btn-sm flex-1 text-center"
                  >
                    Abrir
                  </a>
                  <button
                    onClick={() => handleRemove(a)}
                    className="fobo-btn fobo-btn-sm"
                    style={{
                      background: "var(--color-error-bg)",
                      color: "var(--color-error)",
                      border: "1px solid var(--color-error)",
                    }}
                    title="Quitar de la galería"
                  >
                    <Icon name="x" size={14} color="var(--color-error)" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
