"use client";

import type { CSSProperties, MouseEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { BOT_NODE_TINT, PORT_LABEL, type BotNodeTypeDef, type FlowNode } from "./data";

const NODE_W = 200;

export function estHeight(node: FlowNode): number {
  if (node.type === "question") return 44 + (node.body ? 30 : 0) + (node.options || []).length * 31 + 6;
  if (node.type === "condition") return 44 + 34;
  return 44 + (node.body ? 46 : 0);
}

export function targetAnchor(node: FlowNode) {
  return { x: node.x - 2, y: node.y + estHeight(node) * 0.5 };
}

export function sourceAnchor(node: FlowNode, type: BotNodeTypeDef, port: string) {
  if (port.startsWith("opt:")) {
    const idx = (node.options || []).findIndex((o) => "opt:" + o.id === port);
    const headerH = 44 + (node.body ? 30 : 0);
    return { x: node.x + NODE_W, y: node.y + headerH + idx * 31 + 16 };
  }
  const outs = type.outputs;
  if (outs.length > 1) {
    const i = outs.indexOf(port);
    const frac = i === 0 ? 0.38 : 0.62;
    return { x: node.x + NODE_W, y: node.y + estHeight(node) * frac };
  }
  return { x: node.x + NODE_W, y: node.y + estHeight(node) * 0.5 };
}

export function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

function portDot(col: string): CSSProperties {
  return { width: 13, height: 13, borderRadius: 9999, background: "var(--color-surface)", border: "2px solid " + col, cursor: "crosshair", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" };
}

interface BotNodeProps {
  node: FlowNode;
  type: BotNodeTypeDef;
  selected: boolean;
  running: boolean;
  onSelect: (id: string) => void;
  onDragStart: (e: MouseEvent, id: string) => void;
  onPortDown: (e: MouseEvent, id: string, port: string) => void;
  onDelete: (id: string) => void;
}

export function BotNode({ node, type, selected, running, onSelect, onDragStart, onPortDown, onDelete }: BotNodeProps) {
  const t = BOT_NODE_TINT[type.color];
  const isTrigger = type.fixed;
  return (
    <div
      onMouseDown={(e) => {
        const el = e.target as HTMLElement;
        if (el.closest(".port") || el.closest(".node-del")) return;
        onSelect(node.id); onDragStart(e, node.id);
      }}
      style={{ position: "absolute", left: node.x, top: node.y, width: NODE_W, userSelect: "none", cursor: "grab", zIndex: selected ? 5 : 2 }}
    >
      <div style={{ background: "var(--color-surface)", borderRadius: 14, border: selected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
        boxShadow: running ? "0 0 0 3px var(--color-primary), 0 8px 24px rgba(0,0,0,0.25)" : selected ? "0 8px 24px rgba(0,0,0,0.12)" : "0 2px 8px rgba(0,0,0,0.06)", transition: "box-shadow 150ms" }}>
        {/* header */}
        <div className="flex items-center gap-2" style={{ padding: "10px 12px", borderBottom: node.body || (node.options && node.options.length) ? "1px solid var(--color-border)" : "none" }}>
          <span className="flex items-center justify-center flex-none" style={{ width: 28, height: 28, borderRadius: 8, background: t.bg, color: t.fg }}><Icon name={type.icon} size={15} /></span>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: t.fg }}>{type.label}</div>
            <div className="truncate" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--color-text-primary)" }}>{node.title}</div>
          </div>
          {!isTrigger && <button className="node-del flex-none inline-flex items-center justify-center cursor-pointer" onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} title="Eliminar" style={{ width: 22, height: 22, borderRadius: 6, border: "none", background: "transparent", color: "var(--color-text-tertiary)" }}><Icon name="x" size={14} /></button>}
        </div>
        {/* body */}
        {node.type === "condition" ? (
          <div style={{ padding: "8px 12px", fontSize: 12, color: "var(--color-text-secondary)" }}>
            <code style={{ fontFamily: "var(--font-mono)", fontSize: 11.5 }}>{node.field}</code> {node.operator === "eq" ? "=" : "∋"} <b style={{ color: "var(--color-text-primary)" }}>{node.value}</b>
          </div>
        ) : node.body ? (
          <div style={{ padding: "8px 12px", fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{node.body}</div>
        ) : null}
        {/* question options */}
        {node.type === "question" && (node.options || []).map((o) => (
          <div key={o.id} className="relative flex items-center" style={{ padding: "7px 12px", borderTop: "1px solid var(--color-border)", fontSize: 12.5, color: "var(--color-text-primary)" }}>
            <span className="flex-1">{o.label}</span>
            <span className="port" data-node={node.id} data-port={"opt:" + o.id} onMouseDown={(e) => { e.stopPropagation(); onPortDown(e, node.id, "opt:" + o.id); }} style={portDot(o.to ? "var(--color-warning)" : "var(--neutral-400)")} title="Arrastra para conectar" />
          </div>
        ))}
      </div>
      {/* output ports for non-question nodes */}
      {node.type !== "question" && type.outputs.map((p, i) => {
        const many = type.outputs.length > 1;
        const top = many ? (i === 0 ? "38%" : "62%") : "50%";
        const col = p === "true" ? "var(--color-success)" : p === "false" ? "var(--color-error)" : "var(--color-primary)";
        return (
          <div key={p} className="port absolute flex items-center gap-1" data-node={node.id} data-port={p} onMouseDown={(e) => { e.stopPropagation(); onPortDown(e, node.id, p); }} style={{ right: -7, top, transform: "translateY(-50%)" }}>
            {many && <span className="absolute whitespace-nowrap" style={{ fontSize: 9.5, fontWeight: 700, color: col, right: 16 }}>{PORT_LABEL[p]}</span>}
            <span style={portDot(col)} title="Arrastra para conectar" />
          </div>
        );
      })}
      {/* input port */}
      {node.type !== "trigger" && <span className="absolute" style={{ left: -6, top: "50%", transform: "translateY(-50%)", width: 11, height: 11, borderRadius: 9999, background: "var(--color-surface)", border: "2px solid var(--neutral-400)" }} />}
    </div>
  );
}
