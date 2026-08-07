"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useHelpCenterStore } from "@/store/help-center";
import { HC_TINT, type Article, type Collection } from "./data";
import { mdToHtml } from "./markdown";
import { ArticleEditor, CollectionModal, type ArticleDraft, type CollectionDraft } from "./HelpCenterModals";

const railAddBtn: CSSProperties = { width: 26, height: 26, borderRadius: 7, border: "none", background: "var(--neutral-100)", color: "var(--color-text-secondary)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };
const railMini: CSSProperties = { width: 24, height: 24, borderRadius: 6, border: "none", background: "transparent", color: "var(--color-text-secondary)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };
const GRID = "2.6fr 1.2fr 0.9fr 0.8fr 88px";

function railItem(on: boolean): CSSProperties {
  return { display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", margin: "0 8px 2px", borderRadius: 10, cursor: "pointer", fontSize: 13.5, fontWeight: 500,
    color: on ? "var(--color-primary-ink)" : "var(--color-text-primary)", background: on ? "var(--color-primary-subtle)" : "transparent" };
}

type HcModal =
  | { type: "article"; data?: Article }
  | { type: "collection"; data?: Collection }
  | { type: "delete-a"; data: Article }
  | { type: "delete-c"; data: Collection }
  | { type: "read"; data: Article }
  | null;

function ArticleRow({ a, colName, onEdit, onDelete, onPreview }: { a: Article; colName: string; onEdit: () => void; onDelete: () => void; onPreview: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onEdit}
      className="grid items-center cursor-pointer" style={{ gridTemplateColumns: GRID, gap: 12, padding: "12px 24px", borderBottom: "1px solid var(--color-border)", background: hover ? "var(--neutral-100)" : "transparent" }}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex items-center justify-center flex-none" style={{ width: 34, height: 34, borderRadius: 9, background: "var(--neutral-100)", color: "var(--color-text-secondary)" }}><Icon name="fileText" size={17} /></span>
        <div className="min-w-0">
          <div className="truncate" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{a.title}</div>
          <div className="truncate" style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{a.excerpt}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{colName}</div>
      <div><Badge variant={a.status === "published" ? "success" : "neutral"}>{a.status === "published" ? "Publicado" : "Borrador"}</Badge></div>
      <div className="tnum" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{a.views.toLocaleString()}</div>
      <div className="flex gap-0.5 justify-end" style={{ opacity: hover ? 1 : 0, transition: "opacity 120ms" }}>
        <button title="Previsualizar" onClick={(e) => { e.stopPropagation(); onPreview(); }} style={railMini}><Icon name="eye" size={16} /></button>
        <button title="Editar" onClick={(e) => { e.stopPropagation(); onEdit(); }} style={railMini}><Icon name="edit" size={16} /></button>
        <button title="Eliminar" onClick={(e) => { e.stopPropagation(); onDelete(); }} style={{ ...railMini, color: "var(--color-error)" }}><Icon name="trash" size={16} /></button>
      </div>
    </div>
  );
}

function ArticleReader({ a, colName, onClose, onEdit }: { a: Article; colName: string; onClose: () => void; onEdit?: () => void }) {
  return (
    <Modal onClose={onClose} width={680}>
      <div className="flex items-center gap-2.5" style={{ padding: "14px 22px", borderBottom: "1px solid var(--color-border)" }}>
        <Badge variant="primary">{colName}</Badge>
        <Badge variant={a.status === "published" ? "success" : "neutral"}>{a.status === "published" ? "Publicado" : "Borrador"}</Badge>
        <div className="ml-auto flex gap-2">
          {onEdit && <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onEdit}><Icon name="edit" size={15} /> Editar</button>}
          <button onClick={onClose} aria-label="Cerrar" className="inline-flex items-center justify-center rounded-full border-none cursor-pointer" style={{ width: 32, height: 32, background: "transparent", color: "var(--color-text-secondary)" }}><Icon name="x" size={18} /></button>
        </div>
      </div>
      <div style={{ padding: "26px 32px", overflowY: "auto", maxHeight: "70vh" }}>
        <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.025em", color: "var(--color-text-primary)", margin: "0 0 8px", fontFamily: "var(--font-display)" }}>{a.title}</h1>
        <div className="flex items-center gap-2" style={{ fontSize: 13, color: "var(--color-text-tertiary)", marginBottom: 22 }}>
          <span>Por {a.author}</span><span>·</span><span>Actualizado {a.updated}</span>
        </div>
        <div dangerouslySetInnerHTML={{ __html: mdToHtml(a.body) }} />
        <div className="flex items-center gap-3" style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid var(--color-border)" }}>
          <span style={{ fontSize: 13.5, color: "var(--color-text-secondary)" }}>¿Te resultó útil?</span>
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm"><Icon name="thumbsUp" size={15} /> Sí</button>
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm"><Icon name="thumbsUp" size={15} style={{ transform: "rotate(180deg)" }} /> No</button>
          {a.helpful > 0 && <span className="ml-auto" style={{ fontSize: 12.5, color: "var(--color-text-tertiary)" }}>{a.helpful}% lo encontró útil</span>}
        </div>
      </div>
    </Modal>
  );
}

function SiteArticleCard({ a, colName, onClick }: { a: Article; colName: string; onClick: () => void }) {
  return (
    <div onClick={onClick} className="flex items-center gap-3.5 cursor-pointer" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "14px 16px" }}>
      <span className="flex items-center justify-center flex-none" style={{ width: 38, height: 38, borderRadius: 9, background: "var(--neutral-100)", color: "var(--color-text-secondary)" }}><Icon name="fileText" size={18} /></span>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{a.title}</div>
        <div style={{ fontSize: 12.5, color: "var(--color-text-tertiary)" }}>{colName} · {a.excerpt}</div>
      </div>
      <Icon name="chevronR" size={17} style={{ color: "var(--color-text-tertiary)" }} />
    </div>
  );
}

function HelpCenterSite({ collections, articles, onExit, colName }: { collections: Collection[]; articles: Article[]; onExit: () => void; colName: (id: string) => string }) {
  const [q, setQ] = useState("");
  const [reading, setReading] = useState<Article | null>(null);
  const pub = articles.filter((a) => a.status === "published");
  const results = q.trim() ? pub.filter((a) => a.title.toLowerCase().includes(q.toLowerCase()) || a.excerpt.toLowerCase().includes(q.toLowerCase())) : null;
  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: "auto", background: "var(--color-background)" }}>
      <div className="flex items-center gap-2.5 sticky top-0 z-[5]" style={{ padding: "10px 20px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <Badge variant="warning"><Icon name="eye" size={13} /> Vista pública</Badge>
        <span style={{ fontSize: 12.5, color: "var(--color-text-tertiary)" }}>wappy.dev/help</span>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" style={{ marginLeft: "auto" }} onClick={onExit}><Icon name="x" size={15} /> Salir de la vista</button>
      </div>
      <div className="text-center" style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 70%, #000) 100%)", padding: "48px 24px 40px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, color: "var(--color-on-primary)", letterSpacing: "-0.02em", marginBottom: 16 }}>¿Cómo podemos ayudarte?</div>
        <div className="flex items-center gap-2.5 mx-auto" style={{ maxWidth: 520, height: 50, background: "var(--color-surface)", borderRadius: 9999, padding: "0 18px", boxShadow: "var(--shadow-3)" }}>
          <Icon name="search" size={19} style={{ color: "var(--color-text-tertiary)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca respuestas…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-ui)", fontSize: 15, color: "var(--color-text-primary)" }} />
        </div>
      </div>
      <div className="mx-auto" style={{ maxWidth: 880, padding: "32px 24px 60px" }}>
        {results ? (
          <div>
            <div style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 16 }}>{results.length} resultado{results.length !== 1 ? "s" : ""} para «{q}»</div>
            <div className="flex flex-col gap-2.5">
              {results.map((a) => <SiteArticleCard key={a.id} a={a} colName={colName(a.colId)} onClick={() => setReading(a)} />)}
            </div>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {collections.map((c) => {
              const t = HC_TINT[c.color] || HC_TINT.primary;
              const list = pub.filter((a) => a.colId === c.id);
              return (
                <div key={c.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 16, padding: 20 }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                    <span className="flex items-center justify-center" style={{ width: 42, height: 42, borderRadius: 11, background: t.bg, color: t.fg }}><Icon name={c.icon} size={21} /></span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)" }}>{c.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--color-text-tertiary)" }}>{list.length} artículo{list.length !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    {list.slice(0, 4).map((a) => (
                      <div key={a.id} onClick={() => setReading(a)} className="flex items-center gap-2 cursor-pointer" style={{ padding: "9px 0", borderTop: "1px solid var(--color-border)", fontSize: 13.5, color: "var(--color-text-secondary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary-ink)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-secondary)")}>
                        <Icon name="fileText" size={15} /> <span className="flex-1">{a.title}</span> <Icon name="chevronR" size={15} />
                      </div>
                    ))}
                    {list.length === 0 && <div style={{ fontSize: 13, color: "var(--color-text-tertiary)", paddingTop: 8 }}>Sin artículos publicados todavía.</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {reading && <ArticleReader a={reading} colName={colName(reading.colId)} onClose={() => setReading(null)} />}
    </div>
  );
}

export function HelpCenterView() {
  const { collections, setCollections, articles, setArticles } = useHelpCenterStore();
  const toast = useToast();
  const [colSel, setColSel] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<HcModal>(null);
  const [mode, setMode] = useState<"admin" | "site">("admin");

  const filtered = useMemo(() => articles.filter((a) => {
    if (colSel !== "all" && a.colId !== colSel) return false;
    if (query.trim()) { const q = query.toLowerCase(); return a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q) || a.body.toLowerCase().includes(q); }
    return true;
  }), [articles, colSel, query]);

  const colName = (id: string) => collections.find((c) => c.id === id)?.name || "—";
  const published = articles.filter((a) => a.status === "published").length;

  const saveArticle = (data: ArticleDraft) => {
    if (data.id) setArticles((p) => p.map((a) => (a.id === data.id ? { ...a, ...data, updated: "Ahora mismo" } : a)));
    else setArticles((p) => [{ ...data, id: "art_" + Date.now(), author: "Tú", updated: "Ahora mismo", views: 0, helpful: 0 }, ...p]);
    setModal(null); toast(data.status === "published" ? "Artículo publicado" : "Borrador guardado");
  };
  const delArticle = (a: Article) => { setArticles((p) => p.filter((x) => x.id !== a.id)); setModal(null); toast("Artículo eliminado"); };
  const saveCol = (data: CollectionDraft) => {
    if (data.id) setCollections((p) => p.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
    else setCollections((p) => [...p, { ...data, id: "col_" + Date.now() }]);
    setModal(null); toast(data.id ? "Colección actualizada" : "Colección creada");
  };
  const delCol = (c: Collection) => {
    setCollections((p) => p.filter((x) => x.id !== c.id));
    setArticles((p) => p.filter((a) => a.colId !== c.id));
    if (colSel === c.id) setColSel("all");
    setModal(null); toast("Colección eliminada");
  };

  if (mode === "site") {
    return <HelpCenterSite collections={collections} articles={articles} onExit={() => setMode("admin")} colName={colName} />;
  }

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", height: "100%" }}>
      {/* Collections rail */}
      <div className="flex flex-col overflow-y-auto" style={{ width: 244, flex: "none", background: "var(--color-surface)", borderRight: "1px solid var(--color-border)" }}>
        <div className="flex items-center" style={{ padding: "18px 16px 10px" }}>
          <span className="flex-1" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" }}>Colecciones</span>
          <button title="Nueva colección" onClick={() => setModal({ type: "collection" })} style={railAddBtn}><Icon name="plus" size={16} /></button>
        </div>
        <div onClick={() => setColSel("all")} style={railItem(colSel === "all")}>
          <span className="flex items-center justify-center flex-none" style={{ width: 30, height: 30, borderRadius: 8, background: "var(--neutral-100)", color: "var(--color-text-secondary)" }}><Icon name="book" size={16} /></span>
          <span className="flex-1">Todos los artículos</span>
          <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{articles.length}</span>
        </div>
        {collections.map((c) => {
          const t = HC_TINT[c.color] || HC_TINT.primary;
          const count = articles.filter((a) => a.colId === c.id).length;
          const on = colSel === c.id;
          return (
            <div key={c.id} onClick={() => setColSel(c.id)} style={railItem(on)} className="group">
              <span className="flex items-center justify-center flex-none" style={{ width: 30, height: 30, borderRadius: 8, background: t.bg, color: t.fg }}><Icon name={c.icon} size={16} /></span>
              <span className="flex-1 min-w-0 truncate">{c.name}</span>
              <span className="hidden group-hover:flex gap-px">
                <button title="Editar" onClick={(e) => { e.stopPropagation(); setModal({ type: "collection", data: c }); }} style={railMini}><Icon name="edit" size={14} /></button>
                <button title="Eliminar" onClick={(e) => { e.stopPropagation(); setModal({ type: "delete-c", data: c }); }} style={{ ...railMini, color: "var(--color-error)" }}><Icon name="trash" size={14} /></button>
              </span>
              <span className="group-hover:hidden" style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Article list */}
      <div className="flex flex-col" style={{ flex: 1, minWidth: 0, background: "var(--color-background)" }}>
        <div style={{ padding: "18px 24px 14px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)", margin: 0 }}>Centro de ayuda</h1>
            <Badge variant="neutral">{published} publicados</Badge>
            <div className="ml-auto flex gap-2">
              <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => setMode("site")}><Icon name="globe" size={16} /> Ver sitio</button>
              <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setModal({ type: "article" })}><Icon name="plus" size={16} /> Nuevo artículo</button>
            </div>
          </div>
          <div className="flex items-center gap-2" style={{ height: 40, background: "var(--color-background)", borderRadius: 10, padding: "0 12px", maxWidth: 380 }}>
            <Icon name="search" size={17} style={{ color: "var(--color-text-tertiary)" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar artículos…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--color-text-primary)" }} />
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: GRID, gap: 12, padding: "9px 24px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
          {["Artículo", "Colección", "Estado", "Vistas", ""].map((h, i) => <div key={i} style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" }}>{h}</div>)}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((a) => <ArticleRow key={a.id} a={a} colName={colName(a.colId)} onEdit={() => setModal({ type: "article", data: a })} onDelete={() => setModal({ type: "delete-a", data: a })} onPreview={() => setModal({ type: "read", data: a })} />)}
          {filtered.length === 0 && (
            <div className="text-center" style={{ padding: "64px 0", color: "var(--color-text-tertiary)" }}>
              <div className="inline-flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 9999, background: "var(--neutral-100)", marginBottom: 14 }}><Icon name="fileText" size={26} /></div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-secondary)" }}>No se encontraron artículos</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Prueba otra búsqueda o escribe un artículo nuevo.</div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal?.type === "article" && <ArticleEditor initial={modal.data} collections={collections} defaultColId={colSel !== "all" ? colSel : null} onClose={() => setModal(null)} onSave={saveArticle} />}
      {modal?.type === "collection" && <CollectionModal initial={modal.data} onClose={() => setModal(null)} onSave={saveCol} />}
      {modal?.type === "delete-a" && <ConfirmModal title="¿Eliminar artículo?" message={`«${modal.data.title}» se eliminará permanentemente.`} onClose={() => setModal(null)} onConfirm={() => delArticle(modal.data)} />}
      {modal?.type === "delete-c" && <ConfirmModal title="¿Eliminar colección?" message={`«${modal.data.name}» y sus artículos se eliminarán permanentemente.`} onClose={() => setModal(null)} onConfirm={() => delCol(modal.data)} />}
      {modal?.type === "read" && <ArticleReader a={modal.data} colName={colName(modal.data.colId)} onClose={() => setModal(null)} onEdit={() => setModal({ type: "article", data: modal.data })} />}
    </div>
  );
}
