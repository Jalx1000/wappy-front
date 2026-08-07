"use client";

import { useState } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { useHelpCenterStore } from "@/store/help-center";
import { useAttributesStore } from "@/store/attributes";

export interface SharePayload {
  kind: "article" | "product";
  id: string;
  title: string;
  subtitle?: string;
  text: string; // the message body sent to the conversation
  /** Present for product shares — rendered as a rich card in the thread. */
  product?: { name: string; sku?: string; price?: number | null; category?: string };
}

export function SharePicker({ initialTab, onClose, onShare }: {
  initialTab: "article" | "product";
  onClose: () => void;
  onShare: (p: SharePayload) => void;
}) {
  const [tab, setTab] = useState<"article" | "product">(initialTab);
  const articles = useHelpCenterStore((s) => s.articles).filter((a) => a.status === "published");
  const productsMod = useAttributesStore((s) => s.modules.find((m) => m.id === "products"));
  const products = productsMod?.records || [];
  const priceField = productsMod?.fields.find((f) => f.type === "currency");
  const sym = priceField?.symbol || "$";
  const [q, setQ] = useState("");

  const shareArticle = (a: (typeof articles)[number]) => {
    onShare({ kind: "article", id: a.id, title: a.title, subtitle: a.excerpt, text: `📄 ${a.title}\n${a.excerpt}\nhttps://wappy.dev/help/${a.id}` });
  };
  const shareProduct = (p: (typeof products)[number]) => {
    const name = String(p.name ?? "Producto");
    const priceNum = typeof p.price === "number" ? p.price : p.price != null && p.price !== "" ? Number(p.price) : null;
    const price = priceNum != null ? `${sym}${priceNum.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "";
    const category = p.category != null ? String(p.category) : undefined;
    onShare({
      kind: "product", id: p.id, title: name,
      subtitle: [category ?? "", price].filter(Boolean).join(" · "),
      text: `📦 ${name}${price ? ` — ${price}` : ""}`,
      product: { name, sku: p.sku != null ? String(p.sku) : undefined, price: priceNum, category },
    });
  };

  const ql = q.trim().toLowerCase();
  const shownArticles = ql ? articles.filter((a) => a.title.toLowerCase().includes(ql)) : articles;
  const shownProducts = ql ? products.filter((p) => String(p.name ?? "").toLowerCase().includes(ql)) : products;

  return (
    <Modal onClose={onClose} width={480}>
      <ModalHeader title="Compartir en la conversación" subtitle="Envía un artículo o un producto al cliente" onClose={onClose} />
      <div style={{ padding: "12px 18px 0" }}>
        <div className="flex gap-1" style={{ marginBottom: 10 }}>
          {([["article", "Artículos"], ["product", "Productos"]] as [typeof tab, string][]).map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id)} className="cursor-pointer border-none rounded-full" style={{ fontSize: 12.5, fontWeight: 600, padding: "6px 12px", fontFamily: "var(--font-ui)",
              background: tab === id ? "var(--color-primary-subtle)" : "transparent", color: tab === id ? "var(--color-primary-ink)" : "var(--color-text-secondary)" }}>{lbl}</button>
          ))}
        </div>
        <div className="flex items-center gap-2" style={{ height: 40, background: "var(--color-background)", borderRadius: 10, padding: "0 12px" }}>
          <Icon name="search" size={16} style={{ color: "var(--color-text-tertiary)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "article" ? "Buscar artículos…" : "Buscar productos…"} autoFocus style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--color-text-primary)" }} />
        </div>
      </div>
      <div style={{ padding: "12px 12px 16px", maxHeight: "52vh", overflowY: "auto" }}>
        {tab === "article" ? (
          shownArticles.length === 0 ? <Empty text="No hay artículos publicados." /> : shownArticles.map((a) => (
            <Row key={a.id} icon="book" title={a.title} subtitle={a.excerpt} onClick={() => shareArticle(a)} />
          ))
        ) : (
          shownProducts.length === 0 ? <Empty text="No hay productos en el catálogo." /> : shownProducts.map((p) => (
            <Row key={p.id} icon="box" title={String(p.name ?? "Producto")} subtitle={[String(p.category ?? ""), p.price != null ? `${sym}${Number(p.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : ""].filter(Boolean).join(" · ")} onClick={() => shareProduct(p)} />
          ))
        )}
      </div>
    </Modal>
  );
}

function Row({ icon, title, subtitle, onClick }: { icon: "book" | "box"; title: string; subtitle?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full text-left rounded-[10px] cursor-pointer border-none" style={{ padding: "10px 12px", background: "transparent" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-100)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
      <span className="flex items-center justify-center flex-none" style={{ width: 36, height: 36, borderRadius: 9, background: "var(--color-primary-subtle)", color: "var(--color-primary-ink)" }}><Icon name={icon} size={17} /></span>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{title}</div>
        {subtitle && <div className="text-[12px] truncate" style={{ color: "var(--color-text-tertiary)" }}>{subtitle}</div>}
      </div>
      <Icon name="send" size={15} style={{ color: "var(--color-text-tertiary)" }} />
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="text-center" style={{ padding: "32px 12px", fontSize: 13, color: "var(--color-text-tertiary)" }}>{text}</div>;
}
