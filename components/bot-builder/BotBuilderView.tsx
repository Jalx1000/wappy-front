"use client";

import { useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/Toast";
import { uid, jitter } from "@/lib/id";
import { useBotStore } from "@/store/bot-builder";
import { BOT_NODE_TYPES, BOT_NODE_PALETTE, BOT_NODE_TINT, type BotNodeType, type Flow, type FlowNode, type QuestionOption } from "./data";
import { BotNode, edgePath, sourceAnchor, targetAnchor, estHeight } from "./BotNode";

const L: CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 };

// ── Node inspector ───────────────────────────────────────────────────────────
function NodeInspector({ node, setNode, onClose }: { node: FlowNode; setNode: (patch: Partial<FlowNode>) => void; onClose: () => void }) {
  const t = BOT_NODE_TYPES[node.type];
  const setOpt = (id: string, patch: Partial<QuestionOption>) => setNode({ options: (node.options || []).map((o) => (o.id === id ? { ...o, ...patch } : o)) });
  return (
    <div className="overflow-y-auto" style={{ width: 280, flex: "none", background: "var(--color-surface)", borderLeft: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-2.5" style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <span className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: 8, background: BOT_NODE_TINT[t.color].bg, color: BOT_NODE_TINT[t.color].fg }}><Icon name={t.icon} size={16} /></span>
        <div className="flex-1" style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{t.label}</div>
        <button onClick={onClose} aria-label="Cerrar" className="rounded-full border-none cursor-pointer" style={{ width: 30, height: 30, background: "transparent", color: "var(--color-text-secondary)" }}><Icon name="x" size={17} /></button>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 14 }}><label style={L}>Etiqueta</label><input className="fobo-input" value={node.title} onChange={(e) => setNode({ title: e.target.value })} /></div>

        {(node.type === "message" || node.type === "action" || node.type === "article") && (
          <div style={{ marginBottom: 14 }}><label style={L}>{node.type === "article" ? "Artículo" : "Texto"}</label>
            <textarea className="fobo-input" style={{ height: "auto", minHeight: 84, paddingTop: 10, resize: "vertical" }} value={node.body || ""} onChange={(e) => setNode({ body: e.target.value })} /></div>
        )}

        {node.type === "question" && (
          <div>
            <div style={{ marginBottom: 14 }}><label style={L}>Enunciado</label><input className="fobo-input" value={node.body || ""} onChange={(e) => setNode({ body: e.target.value })} /></div>
            <label style={L}>Opciones</label>
            {(node.options || []).map((o) => (
              <div key={o.id} className="flex gap-1.5" style={{ marginBottom: 6 }}>
                <input className="fobo-input" value={o.label} onChange={(e) => setOpt(o.id, { label: e.target.value })} />
                <button onClick={() => setNode({ options: (node.options || []).filter((x) => x.id !== o.id) })} className="flex-none cursor-pointer" style={{ width: 38, height: 48, borderRadius: 10, border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-tertiary)" }}><Icon name="x" size={15} /></button>
              </div>
            ))}
            <button className="fobo-btn fobo-btn-ghost fobo-btn-sm" style={{ height: 32, padding: "0 10px" }} onClick={() => setNode({ options: [...(node.options || []), { id: uid("o"), label: "Nueva opción", to: null }] })}><Icon name="plus" size={14} /> Añadir opción</button>
          </div>
        )}

        {node.type === "condition" && (
          <div>
            <div style={{ marginBottom: 12 }}><label style={L}>Campo</label><input className="fobo-input" value={node.field || ""} onChange={(e) => setNode({ field: e.target.value })} style={{ fontFamily: "var(--font-mono)", fontSize: 13 }} /></div>
            <div className="flex gap-2">
              <div style={{ width: 110 }}><label style={L}>Operador</label>
                <select className="fobo-input" value={node.operator} onChange={(e) => setNode({ operator: e.target.value as "eq" | "contains" })}><option value="eq">igual a</option><option value="contains">contiene</option></select></div>
              <div className="flex-1"><label style={L}>Valor</label><input className="fobo-input" value={node.value || ""} onChange={(e) => setNode({ value: e.target.value })} /></div>
            </div>
          </div>
        )}

        {node.type === "trigger" && <div style={{ fontSize: 12.5, color: "var(--color-text-tertiary)", lineHeight: 1.5 }}>El punto de entrada de tu flujo. Conéctalo al primer paso.</div>}
        {node.type === "end" && <div style={{ fontSize: 12.5, color: "var(--color-text-tertiary)", lineHeight: 1.5 }}>El bot se detiene aquí. La conversación queda con el cliente.</div>}
      </div>
    </div>
  );
}

// ── Test simulator ───────────────────────────────────────────────────────────
type SimMsg = { who: "bot" | "user" | "sys"; text: string; node?: string; options?: QuestionOption[] };

function BotSimulator({ flow, picks, setPicks, onClose }: { flow: Flow; picks: string[]; setPicks: (u: (p: string[]) => string[]) => void; onClose: () => void }) {
  const nodeById = (id: string) => flow.nodes.find((n) => n.id === id);
  const run = useMemo(() => {
    const trigger = flow.nodes.find((n) => n.type === "trigger");
    const firstEdge = flow.edges.find((e) => e.from === (trigger?.id || ""));
    const out: SimMsg[] = [];
    let cur: FlowNode | null | undefined = firstEdge ? nodeById(firstEdge.to) : null;
    let guard = 0, pi = 0;
    while (cur && guard++ < 60) {
      if (cur.type === "message" || cur.type === "action" || cur.type === "article") {
        out.push({ who: "bot", text: cur.type === "article" ? "📄 " + cur.body : cur.type === "action" ? "⏩ " + cur.body : cur.body || "", node: cur.id });
        const e = flow.edges.find((x) => x.from === cur!.id && x.out === "out"); cur = e ? nodeById(e.to) : null;
      } else if (cur.type === "condition") {
        out.push({ who: "sys", text: `Condición: ${cur.field} ${cur.operator === "eq" ? "=" : "∋"} ${cur.value}? → tomando «Sí»`, node: cur.id });
        const e = flow.edges.find((x) => x.from === cur!.id && x.out === "true"); cur = e ? nodeById(e.to) : null;
      } else if (cur.type === "question") {
        const chosenId = picks[pi];
        const opt = chosenId ? (cur.options || []).find((o) => o.id === chosenId) : null;
        if (opt) {
          out.push({ who: "bot", text: cur.body || "", node: cur.id });
          out.push({ who: "user", text: opt.label });
          pi++;
          if (!opt.to) { out.push({ who: "sys", text: "(opción sin conectar)" }); cur = null; }
          else cur = nodeById(opt.to);
        } else { out.push({ who: "bot", text: cur.body || "", node: cur.id, options: cur.options }); cur = null; }
      } else if (cur.type === "end") { out.push({ who: "sys", text: "— Fin del flujo —", node: cur.id }); cur = null; }
      else cur = null;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picks, flow]);

  return (
    <div onMouseDown={onClose} className="fixed inset-0 z-[100] flex items-center justify-end" style={{ background: "var(--color-overlay-scrim)", padding: 24 }}>
      <div onMouseDown={(e) => e.stopPropagation()} className="flex flex-col overflow-hidden" style={{ width: 360, height: "82vh", background: "var(--color-surface)", borderRadius: 20, boxShadow: "var(--shadow-3)" }}>
        <div className="flex items-center gap-2.5" style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
          <span className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 9999, background: "var(--color-primary)", color: "var(--color-on-primary)" }}><Icon name="bot" size={17} /></span>
          <div className="flex-1"><div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>Probar: {flow.name}</div><div style={{ fontSize: 11.5, color: "var(--color-success)" }}>● Simulador</div></div>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-full border-none cursor-pointer" style={{ width: 30, height: 30, background: "transparent", color: "var(--color-text-secondary)" }}><Icon name="x" size={17} /></button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5" style={{ padding: 16, background: "var(--color-background)" }}>
          {run.map((m, i) => m.who === "sys" ? (
            <div key={i} className="text-center" style={{ fontSize: 11.5, color: "var(--color-text-tertiary)" }}>{m.text}</div>
          ) : m.who === "user" ? (
            <div key={i} className="self-end" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)", borderRadius: "14px 4px 14px 14px", padding: "9px 12px", fontSize: 13.5, maxWidth: "82%" }}>{m.text}</div>
          ) : (
            <div key={i}>
              <div style={{ maxWidth: "82%", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "4px 14px 14px 14px", padding: "9px 12px", fontSize: 13.5, color: "var(--color-text-primary)", lineHeight: 1.45 }}>{m.text}</div>
              {m.options && <div className="flex flex-wrap gap-1.5" style={{ marginTop: 8 }}>{m.options.map((o) => (
                <button key={o.id} onClick={() => setPicks((p) => [...p, o.id])} className="cursor-pointer" style={{ height: 32, padding: "0 14px", borderRadius: 9999, border: "1.5px solid var(--color-primary)", background: "var(--color-surface)", color: "var(--color-primary-ink)", fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-ui)" }}>{o.label}</button>
              ))}</div>}
            </div>
          ))}
        </div>
        <div className="flex gap-2" style={{ padding: 12, borderTop: "1px solid var(--color-border)" }}>
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" style={{ flex: 1 }} onClick={() => setPicks(() => [])}><Icon name="play" size={15} /> Reiniciar</button>
        </div>
      </div>
    </div>
  );
}

// ── Flow editor (canvas) ─────────────────────────────────────────────────────
function BotFlowEditor({ flow, setFlow, onDeleteFlow }: { flow: Flow; setFlow: (u: (f: Flow) => Flow) => void; onDeleteFlow: () => void }) {
  const toast = useToast();
  const [sel, setSel] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [linking, setLinking] = useState<{ from: string; port: string; x: number; y: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const [simPicks, setSimPicks] = useState<string[] | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const nodeById = (id: string) => flow.nodes.find((n) => n.id === id);
  const setNode = (id: string, patch: Partial<FlowNode>) => setFlow((f) => ({ ...f, nodes: f.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }));

  const connect = (from: string, port: string, to: string) => {
    if (port.startsWith("opt:")) {
      const optId = port.slice(4);
      setFlow((f) => ({ ...f, nodes: f.nodes.map((n) => (n.id === from ? { ...n, options: (n.options || []).map((o) => (o.id === optId ? { ...o, to } : o)) } : n)) }));
    } else {
      setFlow((f) => ({ ...f, edges: [...f.edges.filter((ed) => !(ed.from === from && ed.out === port)), { from, out: port, to }] }));
    }
    toast("Conectado");
  };

  const onMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left - pan.x, my = e.clientY - rect.top - pan.y;
    if (drag) setNode(drag.id, { x: mx - drag.dx, y: my - drag.dy });
    else if (linking) setLinking((l) => (l ? { ...l, x: mx, y: my } : l));
    else if (panning) setPan({ x: panning.px + (e.clientX - panning.sx), y: panning.py + (e.clientY - panning.sy) });
  };
  const onMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    if (linking) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const px = e.clientX - rect.left - pan.x, py = e.clientY - rect.top - pan.y;
      let toId: string | null = null;
      for (const n of flow.nodes) {
        if (n.id === linking.from) continue;
        const a = targetAnchor(n);
        if (Math.abs(px - a.x) < 110 && Math.abs(py - a.y) < estHeight(n) / 2 + 20 && px > n.x - 30) { toId = n.id; break; }
      }
      if (toId) connect(linking.from, linking.port, toId);
      setLinking(null);
    }
    setDrag(null); setPanning(null);
  };

  const startDrag = (e: MouseEvent, id: string) => {
    const n = nodeById(id); if (!n) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    setDrag({ id, dx: e.clientX - rect.left - pan.x - n.x, dy: e.clientY - rect.top - pan.y - n.y });
  };
  const startLink = (e: MouseEvent, id: string, port: string) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    setLinking({ from: id, port, x: e.clientX - rect.left - pan.x, y: e.clientY - rect.top - pan.y });
  };
  const delNode = (id: string) => { setFlow((f) => ({ ...f, nodes: f.nodes.filter((n) => n.id !== id), edges: f.edges.filter((e) => e.from !== id && e.to !== id) })); if (sel === id) setSel(null); };

  const addNode = (typeId: BotNodeType) => {
    const id = uid("n_");
    const base: FlowNode = { id, type: typeId, x: jitter(360 - pan.x), y: jitter(260 - pan.y), title: BOT_NODE_TYPES[typeId].label, body: "" };
    if (typeId === "message") base.body = "Escribe tu mensaje…";
    if (typeId === "question") { base.body = "Elige una opción:"; base.options = [{ id: uid("o"), label: "Opción 1", to: null }]; }
    if (typeId === "condition") { base.title = "Condición"; base.field = "contact.plan"; base.operator = "eq"; base.value = "Metal"; }
    if (typeId === "article") base.body = "Selecciona un artículo";
    if (typeId === "action") base.body = "Asignar al equipo de soporte";
    setFlow((f) => ({ ...f, nodes: [...f.nodes, base] })); setSel(id); toast(BOT_NODE_TYPES[typeId].label + " añadido");
  };

  // gather edges (explicit + question options)
  const allEdges: { from: FlowNode; out: string; to: FlowNode }[] = [];
  flow.edges.forEach((e) => { const fn = nodeById(e.from), tn = nodeById(e.to); if (fn && tn) allEdges.push({ from: fn, out: e.out, to: tn }); });
  flow.nodes.forEach((n) => { if (n.type === "question") (n.options || []).forEach((o) => { if (o.to) { const tn = nodeById(o.to); if (tn) allEdges.push({ from: n, out: "opt:" + o.id, to: tn }); } }); });

  const selNode = sel ? nodeById(sel) : null;

  return (
    <div className="flex flex-col" style={{ flex: 1, minWidth: 0, background: "var(--color-background)" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-2.5" style={{ padding: "12px 20px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)" }}>
        <input value={flow.name} onChange={(e) => setFlow((f) => ({ ...f, name: e.target.value }))} style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)", border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-display)", letterSpacing: "-0.01em", width: 220 }} />
        <select className="fobo-input" value={flow.trigger} onChange={(e) => setFlow((f) => ({ ...f, trigger: e.target.value }))} style={{ height: 36, width: 210, fontSize: 13 }}>
          <option value="conversation_started">Al iniciar conversación</option>
          <option value="keyword">Por palabra clave</option>
          <option value="always">Siempre</option>
        </select>
        <div className="ml-auto flex items-center gap-2.5">
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onDeleteFlow}><Icon name="trash" size={15} /></button>
          <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => setSimPicks([])}><Icon name="play" size={15} /> Probar</button>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-secondary)" }}>{flow.active ? "Activo" : "Off"}</span>
            <Toggle checked={flow.active} onChange={() => { setFlow((f) => ({ ...f, active: !f.active })); toast(flow.active ? "Flujo pausado" : "Flujo activado"); }} aria-label="Activar flujo" />
          </div>
        </div>
      </div>

      <div className="flex" style={{ flex: 1, minHeight: 0 }}>
        {/* Palette */}
        <div className="flex flex-col items-center gap-2" style={{ width: 64, flex: "none", background: "var(--color-surface)", borderRight: "1px solid var(--color-border)", padding: "12px 0" }}>
          {BOT_NODE_PALETTE.map((tid) => {
            const t = BOT_NODE_TYPES[tid], tint = BOT_NODE_TINT[t.color];
            return (
              <button key={tid} title={"Añadir " + t.label} onClick={() => addNode(tid)} className="flex flex-col items-center justify-center cursor-pointer" style={{ width: 44, height: 44, borderRadius: 11, border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
                <span style={{ color: tint.fg }}><Icon name={t.icon} size={17} /></span>
              </button>
            );
          })}
        </div>

        {/* Canvas */}
        <div ref={canvasRef} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onMouseDown={(e) => { const tgt = e.target as HTMLElement; if (tgt === e.currentTarget || tgt.tagName.toLowerCase() === "svg" || tgt.classList.contains("pan-layer")) { setSel(null); setPanning({ sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y }); } }}
          className="relative overflow-hidden" style={{ flex: 1, cursor: panning ? "grabbing" : "default", backgroundImage: "radial-gradient(var(--color-border) 1px, transparent 1px)", backgroundSize: "22px 22px", backgroundPosition: pan.x + "px " + pan.y + "px" }}>
          <div className="pan-layer absolute" style={{ left: pan.x, top: pan.y, width: "100%", height: "100%" }}>
            <svg className="absolute" style={{ left: 0, top: 0, width: 4000, height: 2000, overflow: "visible", pointerEvents: "none" }}>
              {allEdges.map((e, i) => {
                const t = BOT_NODE_TYPES[e.from.type];
                const s = sourceAnchor(e.from, t, e.out), d = targetAnchor(e.to);
                const col = e.out === "true" ? "var(--color-success)" : e.out === "false" ? "var(--color-error)" : e.out.startsWith("opt:") ? "var(--color-warning)" : "var(--color-primary)";
                return <path key={i} d={edgePath(s.x, s.y, d.x, d.y)} fill="none" stroke={col} strokeWidth="2" markerEnd="url(#arrow)" opacity="0.8" />;
              })}
              {linking && (() => { const fn = nodeById(linking.from); if (!fn) return null; const t = BOT_NODE_TYPES[fn.type]; const s = sourceAnchor(fn, t, linking.port); return <path d={edgePath(s.x, s.y, linking.x, linking.y)} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="5 4" />; })()}
              <defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="var(--color-text-tertiary)" /></marker></defs>
            </svg>
            {flow.nodes.map((n) => <BotNode key={n.id} node={n} type={BOT_NODE_TYPES[n.type]} selected={sel === n.id} running={false} onSelect={setSel} onDragStart={startDrag} onPortDown={startLink} onDelete={delNode} />)}
          </div>
          <div className="absolute" style={{ bottom: 14, left: 14, fontSize: 11.5, color: "var(--color-text-tertiary)", background: "var(--color-surface)", padding: "5px 10px", borderRadius: 8, border: "1px solid var(--color-border)" }}>
            Arrastra nodos para mover · arrastra un ● para conectar · arrastra el lienzo para desplazar
          </div>
        </div>

        {/* Inspector */}
        {selNode && <NodeInspector node={selNode} setNode={(patch) => setNode(selNode.id, patch)} onClose={() => setSel(null)} />}
      </div>

      {simPicks !== null && <BotSimulator flow={flow} picks={simPicks} setPicks={(u) => setSimPicks((p) => u(p || []))} onClose={() => setSimPicks(null)} />}
    </div>
  );
}

// ── Root view (flow list + editor) ───────────────────────────────────────────
export function BotBuilderView() {
  const { flows, setFlows } = useBotStore();
  const toast = useToast();
  const [selId, setSelId] = useState<string | null>(flows[0]?.id || null);
  const flow = flows.find((f) => f.id === selId);
  const setFlow = (updater: (f: Flow) => Flow) => setFlows((p) => p.map((f) => (f.id === selId ? updater(f) : f)));

  const newFlow = () => {
    const id = uid("flow_");
    setFlows((p) => [...p, { id, name: "Flujo sin título", trigger: "conversation_started", active: false, updated: "Ahora mismo", replies: 0,
      nodes: [{ id: uid("t_"), type: "trigger", x: 80, y: 200, title: "Conversación iniciada", body: "Cuando un visitante abre el chat" }], edges: [] }]);
    setSelId(id); toast("Flujo creado");
  };

  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", height: "100%" }}>
      {/* Flow list rail */}
      <div className="flex flex-col" style={{ width: 230, flex: "none", background: "var(--color-surface)", borderRight: "1px solid var(--color-border)" }}>
        <div className="flex items-center" style={{ padding: "18px 16px 10px" }}>
          <span className="flex-1" style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" }}>Flujos del bot</span>
          <button title="Nuevo flujo" onClick={newFlow} className="inline-flex items-center justify-center cursor-pointer" style={{ width: 26, height: 26, borderRadius: 7, border: "none", background: "var(--neutral-100)", color: "var(--color-text-secondary)" }}><Icon name="plus" size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ padding: "0 8px" }}>
          {flows.map((f) => (
            <div key={f.id} onClick={() => setSelId(f.id)} className="cursor-pointer" style={{ padding: "10px 12px", borderRadius: 10, marginBottom: 2, background: f.id === selId ? "var(--color-primary-subtle)" : "transparent" }}>
              <div className="flex items-center gap-2">
                <span className="flex-none rounded-full" style={{ width: 7, height: 7, background: f.active ? "var(--color-success)" : "var(--color-text-disabled)" }} />
                <span className="flex-1 min-w-0 truncate" style={{ fontSize: 13.5, fontWeight: 600, color: f.id === selId ? "var(--color-primary-ink)" : "var(--color-text-primary)" }}>{f.name}</span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--color-text-tertiary)", marginTop: 2, paddingLeft: 15 }}>{f.nodes.length} nodos · {f.replies.toLocaleString()} respuestas</div>
            </div>
          ))}
        </div>
      </div>

      {flow ? (
        <BotFlowEditor key={flow.id} flow={flow} setFlow={setFlow}
          onDeleteFlow={() => { setFlows((p) => p.filter((x) => x.id !== flow.id)); setSelId(flows.find((x) => x.id !== flow.id)?.id || null); toast("Flujo eliminado"); }} />
      ) : (
        <div style={{ flex: 1, background: "var(--color-background)" }} />
      )}
    </div>
  );
}
