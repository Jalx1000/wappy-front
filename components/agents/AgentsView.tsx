"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "@/components/ui/Icon";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";
import { useUIStore } from "@/store/ui";
import { ApiError } from "@/lib/api/client";
import { agentsApi, type Agent, type AgentInput } from "@/lib/api/agents";

const PROVIDERS = [
  { value: "anthropic", label: "Claude (Anthropic)", defaultModel: "claude-sonnet-4-6" },
  { value: "openai", label: "ChatGPT (OpenAI)", defaultModel: "gpt-4o-mini" },
];
const providerLabel = (p: string) => PROVIDERS.find((x) => x.value === p)?.label ?? p;
const providerVariant = (p: string): BadgeVariant => (p === "openai" ? "success" : "primary");

const initials = (s: string) =>
  s.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

export function AgentsView() {
  const { activeBrand } = useUIStore();
  const brandId = activeBrand?.id;
  const qc = useQueryClient();
  const toast = useToast();
  const key = ["agents", brandId];

  const { data: agents = [], isPending } = useQuery({
    queryKey: key,
    queryFn: () => agentsApi.list(),
    enabled: !!brandId,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: key });

  const [selId, setSelId] = useState<string | undefined>(undefined);
  const [form, setForm] = useState<{ agent?: Agent } | null>(null);
  const [deleteId, setDeleteId] = useState<string | undefined>(undefined);

  const selected = agents.find((a) => a.id === selId) ?? agents[0];

  const toggleMut = useMutation({
    mutationFn: (a: Agent) => agentsApi.update(a.id, { enabled: !a.enabled }),
    onSuccess: () => invalidate(),
    onError: () => toast("No se pudo actualizar", "info"),
  });
  const removeMut = useMutation({
    mutationFn: (id: string) => agentsApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast("Agente eliminado", "info");
      setSelId(undefined);
      setDeleteId(undefined);
    },
    onError: () => toast("No se pudo eliminar", "info"),
  });

  return (
    <div className="h-full overflow-hidden" style={{ display: "grid", gridTemplateColumns: selected ? "1fr 420px" : "1fr" }}>
      {/* List pane */}
      <div className="flex flex-col min-h-0" style={{ background: "var(--color-surface)" }}>
        <div className="flex-none flex items-center gap-3 flex-wrap" style={{ padding: "18px 24px", borderBottom: "1px solid var(--color-border)" }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>Agentes IA</h1>
          <Badge variant="neutral">{agents.length}</Badge>
          <button onClick={() => setForm({})} className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1 ml-auto">
            <Icon name="plus" size={15} /> Nuevo agente
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isPending ? (
            <div className="p-6 text-[13px]" style={{ color: "var(--color-text-tertiary)" }}>Cargando agentes…</div>
          ) : (
            agents.map((a) => {
              const on = selected?.id === a.id;
              return (
                <div key={a.id} onClick={() => setSelId(a.id)} className="flex items-center gap-3 cursor-pointer"
                  style={{ padding: "14px 24px", borderBottom: "1px solid var(--color-border)", background: on ? "var(--color-primary-subtle)" : "transparent" }}>
                  <span className="flex items-center justify-center rounded-[9px] flex-none text-[11px] font-bold" style={{ width: 34, height: 34, background: "var(--color-secondary-subtle)", color: "var(--color-secondary-ink)" }}>{initials(a.name)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{a.name}</div>
                    <div className="text-[11.5px] truncate" style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>{a.model}</div>
                  </div>
                  <Badge variant={providerVariant(a.provider)}>{providerLabel(a.provider)}</Badge>
                  <Badge variant={a.enabled ? "success" : "neutral"}>{a.enabled ? "Activo" : "Inactivo"}</Badge>
                </div>
              );
            })
          )}
          {!isPending && agents.length === 0 && (
            <div className="text-center" style={{ padding: "64px 0", color: "var(--color-text-tertiary)" }}>
              <div className="inline-flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 9999, background: "var(--neutral-100)", marginBottom: 14 }}><Icon name="spark" size={26} style={{ color: "var(--color-text-tertiary)" }} /></div>
              <div className="text-[15px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>Sin agentes</div>
              <div className="text-[13px] mt-1">Crea el primero con “Nuevo agente”.</div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <AgentDetail
          agent={selected}
          onEdit={() => setForm({ agent: selected })}
          onDelete={() => setDeleteId(selected.id)}
          onToggle={() => toggleMut.mutate(selected)}
        />
      )}

      {form && (
        <AgentForm
          agent={form.agent}
          onClose={() => setForm(null)}
          onSaved={(saved) => {
            invalidate();
            setSelId(saved.id);
            setForm(null);
          }}
        />
      )}
      {deleteId && (
        <ConfirmModal
          title="Eliminar agente"
          message="Se eliminará este agente de forma permanente."
          confirmLabel={removeMut.isPending ? "Eliminando…" : "Eliminar"}
          onClose={() => setDeleteId(undefined)}
          onConfirm={() => removeMut.mutate(deleteId)}
        />
      )}
    </div>
  );
}

function AgentDetail({ agent, onEdit, onDelete, onToggle }: { agent: Agent; onEdit: () => void; onDelete: () => void; onToggle: () => void }) {
  return (
    <div className="flex flex-col min-h-0 overflow-y-auto" style={{ borderLeft: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center rounded-[12px] flex-none text-[15px] font-bold" style={{ width: 48, height: 48, background: "var(--color-secondary-subtle)", color: "var(--color-secondary-ink)" }}>{initials(agent.name)}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[17px] font-semibold truncate" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>{agent.name}</div>
            <div className="text-[12.5px] truncate" style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>{agent.model}</div>
          </div>
        </div>
        <div className="flex items-center gap-2" style={{ marginTop: 14 }}>
          <Badge variant={providerVariant(agent.provider)}>{providerLabel(agent.provider)}</Badge>
          <Badge variant={agent.enabled ? "success" : "neutral"}>{agent.enabled ? "Activo" : "Inactivo"}</Badge>
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={onToggle} className="fobo-btn fobo-btn-secondary fobo-btn-sm">{agent.enabled ? "Desactivar" : "Activar"}</button>
            <button onClick={onEdit} className="fobo-btn fobo-btn-secondary fobo-btn-sm"><Icon name="edit" size={14} /> Editar</button>
            <button onClick={onDelete} className="fobo-btn fobo-btn-ghost fobo-btn-sm" style={{ color: "var(--color-error)" }}><Icon name="trash" size={14} color="var(--color-error)" /></button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4" style={{ padding: 18 }}>
        {agent.systemPrompt && (
          <div className="rounded-[14px]" style={{ border: "1px solid var(--color-border)", background: "var(--color-background)", padding: "14px 16px" }}>
            <div className="text-[11px] font-bold uppercase mb-2" style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>Persona (system prompt)</div>
            <div className="text-[13px]" style={{ color: "var(--color-text-secondary)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{agent.systemPrompt}</div>
          </div>
        )}
        <TestConsole agent={agent} />
      </div>
    </div>
  );
}

function TestConsole({ agent }: { agent: Agent }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testMut = useMutation({
    mutationFn: () => agentsApi.test(agent.id, message),
    onMutate: () => { setReply(null); setError(null); },
    onSuccess: (r) => setReply(r.text || "(respuesta vacía)"),
    onError: (e) => {
      if (e instanceof ApiError && e.status === 503) {
        setError("La API key del proveedor no está configurada en el servidor todavía.");
      } else {
        setError(e instanceof Error ? e.message : "Error al probar el agente");
      }
    },
  });

  return (
    <div className="rounded-[14px]" style={{ border: "1px solid var(--color-border)", background: "var(--color-background)", padding: "14px 16px" }}>
      <div className="text-[11px] font-bold uppercase mb-2 flex items-center gap-1.5" style={{ letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>
        <Icon name="spark" size={13} /> Consola de prueba
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escribe un mensaje como si fueras el cliente…"
        rows={3}
        style={{ width: "100%", resize: "vertical", border: "1px solid var(--color-border)", borderRadius: 10, padding: "10px 12px", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-primary)", background: "var(--color-surface)", outline: "none" }}
      />
      <div className="flex items-center justify-end mt-2">
        <button
          onClick={() => testMut.mutate()}
          disabled={!message.trim() || testMut.isPending}
          className="fobo-btn fobo-btn-primary fobo-btn-sm flex items-center gap-1"
          style={{ opacity: !message.trim() || testMut.isPending ? 0.6 : 1 }}
        >
          <Icon name="spark" size={14} /> {testMut.isPending ? "Probando…" : "Probar"}
        </button>
      </div>
      {reply && (
        <div className="rounded-[10px] mt-3" style={{ background: "var(--color-primary-subtle)", padding: "10px 12px" }}>
          <div className="text-[11px] font-bold uppercase mb-1" style={{ color: "var(--color-primary-ink)" }}>Respuesta del agente</div>
          <div className="text-[13px]" style={{ color: "var(--color-text-primary)", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{reply}</div>
        </div>
      )}
      {error && (
        <div className="rounded-[10px] mt-3 text-[12.5px]" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", padding: "10px 12px", color: "var(--color-error)" }}>{error}</div>
      )}
    </div>
  );
}

function AgentForm({ agent, onClose, onSaved }: { agent?: Agent; onClose: () => void; onSaved: (a: Agent) => void }) {
  const toast = useToast();
  const editing = !!agent;
  const [name, setName] = useState(agent?.name ?? "");
  const [provider, setProvider] = useState(agent?.provider ?? "anthropic");
  const [model, setModel] = useState(agent?.model ?? "");
  const [systemPrompt, setSystemPrompt] = useState(agent?.systemPrompt ?? "");
  const [enabled, setEnabled] = useState(agent?.enabled ?? false);

  const defaultModel = PROVIDERS.find((p) => p.value === provider)?.defaultModel ?? "";

  const saveMut = useMutation({
    mutationFn: () => {
      const dto: AgentInput = {
        name: name.trim(),
        provider,
        model: model.trim() || undefined,
        systemPrompt: systemPrompt.trim() || null,
        enabled,
      };
      return editing ? agentsApi.update(agent!.id, dto) : agentsApi.create(dto);
    },
    onSuccess: (saved) => {
      toast(editing ? "Agente actualizado" : "Agente creado", "info");
      onSaved(saved);
    },
    onError: () => toast("No se pudo guardar", "info"),
  });

  const label = { fontSize: 12, fontWeight: 600 as const, color: "var(--color-text-secondary)", marginBottom: 6, display: "block" };
  const field = { width: "100%", border: "1px solid var(--color-border)", borderRadius: 10, padding: "9px 12px", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--color-text-primary)", background: "var(--color-surface)", outline: "none" } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="rounded-[16px] w-full" style={{ maxWidth: 480, background: "var(--color-surface)", maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between" style={{ padding: "18px 20px", borderBottom: "1px solid var(--color-border)" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--color-text-primary)" }}>{editing ? "Editar agente" : "Nuevo agente"}</h2>
          <button onClick={onClose} className="fobo-btn fobo-btn-ghost fobo-btn-sm" style={{ fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
        <div className="flex flex-col gap-4" style={{ padding: 20 }}>
          <div>
            <label style={label}>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Soporte WhatsApp" style={field} />
          </div>
          <div>
            <label style={label}>Proveedor</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} style={field}>
              {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Modelo</label>
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder={defaultModel} style={field} />
            <div className="text-[11.5px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>Vacío = {defaultModel}</div>
          </div>
          <div>
            <label style={label}>Persona (system prompt)</label>
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={4} placeholder="Describe cómo debe comportarse el agente…" style={{ ...field, resize: "vertical" }} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-[13px]" style={{ color: "var(--color-text-primary)" }}>
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Activar el agente
          </label>
        </div>
        <div className="flex items-center justify-end gap-2" style={{ padding: "14px 20px", borderTop: "1px solid var(--color-border)" }}>
          <button onClick={onClose} className="fobo-btn fobo-btn-secondary fobo-btn-sm">Cancelar</button>
          <button onClick={() => saveMut.mutate()} disabled={!name.trim() || saveMut.isPending} className="fobo-btn fobo-btn-primary fobo-btn-sm" style={{ opacity: !name.trim() || saveMut.isPending ? 0.6 : 1 }}>
            {saveMut.isPending ? "Guardando…" : editing ? "Guardar" : "Crear agente"}
          </button>
        </div>
      </div>
    </div>
  );
}
