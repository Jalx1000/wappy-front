"use client";

import { useState } from "react";
import { Modal, ModalHeader } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Icon } from "@/components/ui/Icon";
import { Toggle } from "@/components/ui/Toggle";
import { useToast } from "@/components/ui/Toast";
import { useWorkspaceStore } from "@/store/workspace";
import { st, ROLE_TINT, PERMISSIONS, type PermKey, type Role, type RoleColor } from "./data";

const roleById = (roles: Role[], id: string): Role => roles.find((r) => r.id === id) || { id: "", name: "—", color: "neutral", system: true, perms: {} as Record<PermKey, boolean> };
const initials = (n: string) => n.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

function RoleBadge({ role, onClick }: { role: Role; onClick?: () => void }) {
  const t = ROLE_TINT[role.color] || ROLE_TINT.neutral;
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full border-none" style={{ height: 28, padding: "0 10px", background: t.bg, color: t.fg, cursor: onClick ? "pointer" : "default", fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600 }}>
      {role.name}{onClick && <Icon name="chevronDown" size={13} />}
    </button>
  );
}

// ── Team ─────────────────────────────────────────────────────────────────────
function InviteModal({ roles, onClose, onInvite }: { roles: Role[]; onClose: () => void; onInvite: (name: string, email: string, roleId: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(roles.find((r) => r.id === "r_agent")?.id || roles[0].id);
  const can = name.trim() && /\S+@\S+/.test(email);
  return (
    <Modal onClose={onClose} width={460}>
      <ModalHeader title="Invitar miembro" subtitle="Recibirá un email para unirse a este espacio" onClose={onClose} />
      <div style={{ padding: "18px 22px" }}>
        <div style={{ marginBottom: 14 }}><label style={st.fieldLabel}>Nombre completo</label><input className="fobo-input" autoFocus value={name} placeholder="Ana Pérez" onChange={(e) => setName(e.target.value)} /></div>
        <div style={{ marginBottom: 14 }}><label style={st.fieldLabel}>Email de trabajo</label><input className="fobo-input" value={email} placeholder="ana@wappy.dev" onChange={(e) => setEmail(e.target.value)} /></div>
        <div>
          <label style={st.fieldLabel}>Rol</label>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => {
              const on = roleId === r.id;
              return (
                <button key={r.id} type="button" onClick={() => setRoleId(r.id)} className="inline-flex items-center gap-1.5 rounded-full cursor-pointer" style={{ height: 38, padding: "0 14px", fontFamily: "var(--font-ui)", fontSize: 13, fontWeight: 600, background: on ? "var(--color-primary-subtle)" : "var(--color-surface)", color: on ? "var(--color-primary-ink)" : "var(--color-text-secondary)", border: on ? "1.5px solid var(--color-primary)" : "1px solid var(--color-border)" }}>
                  <span className="rounded-full" style={{ width: 8, height: 8, background: (ROLE_TINT[r.color] || ROLE_TINT.neutral).fg }} />{r.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2.5" style={{ padding: "14px 22px", borderTop: "1px solid var(--color-border)" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={!can} onClick={() => onInvite(name.trim(), email.trim(), roleId)}><Icon name="send" size={15} /> Enviar invitación</button>
      </div>
    </Modal>
  );
}

export function TeamPanel() {
  const { workspace, setWorkspace } = useWorkspaceStore();
  const toast = useToast();
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const team = workspace.team, roles = workspace.roles;
  const tintBg: Record<RoleColor, string> = { primary: "var(--color-primary-subtle)", success: "var(--color-success-bg)", warning: "var(--color-warning-bg)", neutral: "var(--neutral-200)" };
  const tintFg: Record<RoleColor, string> = { primary: "var(--color-primary-ink)", success: "var(--color-success-dark)", warning: "var(--color-warning)", neutral: "var(--color-text-secondary)" };

  const lastAdmin = (roleId: string) => roleId === "r_admin" && team.filter((t) => t.roleId === "r_admin").length === 1;
  const assign = (memberId: string, roleId: string) => { setWorkspace((w) => ({ ...w, team: w.team.map((m) => (m.id === memberId ? { ...m, roleId } : m)) })); setMenuFor(null); toast("Rol actualizado"); };
  const remove = (memberId: string) => { setWorkspace((w) => ({ ...w, team: w.team.filter((m) => m.id !== memberId) })); toast("Miembro eliminado"); };
  const invite = (name: string, email: string, roleId: string) => {
    const tints: RoleColor[] = ["primary", "success", "warning"];
    setWorkspace((w) => ({ ...w, team: [...w.team, { id: "t" + Date.now(), name, email, roleId, online: false, tint: tints[w.team.length % 3] }] }));
    setInviting(false); toast("Invitación enviada a " + email);
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="flex items-center">
        <div style={{ flex: 1 }}>
          <h1 style={st.h1}>Equipo</h1>
          <p style={st.lead}>{team.length} personas tienen acceso a este espacio.</p>
        </div>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setInviting(true)}><Icon name="userPlus" size={16} /> Invitar miembro</button>
      </div>
      <div style={st.card}>
        {team.map((m, i) => {
          const role = roleById(roles, m.roleId);
          return (
            <div key={m.id} style={{ ...st.row, borderBottom: i < team.length - 1 ? (st.row.borderBottom as string) : "none", position: "relative" }}>
              <span className="flex items-center justify-center rounded-full flex-none" style={{ width: 40, height: 40, fontSize: 13, fontWeight: 700, background: tintBg[m.tint], color: tintFg[m.tint] }}>{initials(m.name)}</span>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2" style={st.label}>{m.name}<span className="rounded-full" style={{ width: 7, height: 7, background: m.online ? "var(--color-success)" : "var(--color-text-disabled)" }} /></div>
                <div style={st.hint}>{m.email}</div>
              </div>
              <div className="relative">
                <RoleBadge role={role} onClick={() => setMenuFor(menuFor === m.id ? null : m.id)} />
                {menuFor === m.id && (
                  <>
                    <div onClick={() => setMenuFor(null)} className="fixed inset-0 z-[40]" />
                    <div className="absolute z-[50]" style={{ top: 34, right: 0, background: "var(--color-surface)", borderRadius: 12, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-3)", padding: 6, width: 190 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-text-tertiary)", padding: "6px 10px" }}>Asignar rol</div>
                      {roles.map((r) => (
                        <div key={r.id} onClick={() => assign(m.id, r.id)} className="flex items-center gap-2 cursor-pointer" style={{ padding: "8px 10px", borderRadius: 8, fontSize: 13, color: "var(--color-text-primary)", background: r.id === m.roleId ? "var(--color-primary-subtle)" : "transparent" }}>
                          <span className="rounded-full" style={{ width: 8, height: 8, background: (ROLE_TINT[r.color] || ROLE_TINT.neutral).fg }} />{r.name}
                          {r.id === m.roleId && <Icon name="check2" size={14} style={{ marginLeft: "auto", color: "var(--color-primary-ink)" }} />}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button title="Eliminar" onClick={() => remove(m.id)} disabled={lastAdmin(m.roleId)} className="inline-flex items-center justify-center rounded-full border-none cursor-pointer" style={{ width: 34, height: 34, background: "transparent", color: "var(--color-error)", opacity: lastAdmin(m.roleId) ? 0.3 : 1 }}><Icon name="trash" size={16} /></button>
            </div>
          );
        })}
      </div>
      {inviting && <InviteModal roles={roles} onClose={() => setInviting(false)} onInvite={invite} />}
    </div>
  );
}

// ── Roles ────────────────────────────────────────────────────────────────────
type RoleDraft = { id?: string; name: string; color: RoleColor; perms: Record<PermKey, boolean> };

function RoleFormModal({ initial, onClose, onSave }: { initial?: Role; onClose: () => void; onSave: (d: RoleDraft) => void }) {
  const editing = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [color, setColor] = useState<RoleColor>(initial?.color || "primary");
  const [perms, setPerms] = useState<Record<PermKey, boolean>>(initial ? { ...initial.perms } : { inbox: true, contacts: false, settings: false, billing: false, team: false, export: false });
  const toggle = (k: PermKey) => setPerms((p) => ({ ...p, [k]: !p[k] }));
  const colors: RoleColor[] = ["primary", "success", "warning", "neutral"];
  const can = name.trim().length > 0;
  return (
    <Modal onClose={onClose} width={500}>
      <ModalHeader title={editing ? "Editar rol" : "Nuevo rol"} subtitle={editing && initial!.system ? "Rol del sistema — renombrado limitado" : "Define qué puede hacer este rol"} onClose={onClose} />
      <div style={{ padding: "18px 22px", overflowY: "auto" }}>
        <div className="flex gap-3" style={{ marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={st.fieldLabel}>Nombre del rol</label>
            <input className="fobo-input" autoFocus value={name} placeholder="p. ej. Supervisor" onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label style={st.fieldLabel}>Color</label>
            <div className="flex items-center gap-1.5" style={{ height: 48 }}>
              {colors.map((c) => <button key={c} type="button" onClick={() => setColor(c)} style={{ width: 30, height: 30, borderRadius: 9999, cursor: "pointer", background: ROLE_TINT[c].fg, border: color === c ? "2.5px solid var(--color-text-primary)" : "2.5px solid transparent" }} />)}
            </div>
          </div>
        </div>
        <label style={st.fieldLabel}>Permisos</label>
        <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
          {PERMISSIONS.map((p, i) => (
            <div key={p.key} className="flex items-center gap-3" style={{ padding: "12px 14px", borderBottom: i < PERMISSIONS.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--color-text-primary)" }}>{p.label}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{p.hint}</div>
              </div>
              <Toggle checked={perms[p.key]} onChange={() => toggle(p.key)} aria-label={p.label} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2.5" style={{ padding: "14px 22px", borderTop: "1px solid var(--color-border)" }}>
        <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={onClose}>Cancelar</button>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" disabled={!can} onClick={() => onSave({ id: initial?.id, name: name.trim(), color, perms })}><Icon name="check2" size={16} /> {editing ? "Guardar rol" : "Crear rol"}</button>
      </div>
    </Modal>
  );
}

type RoleModalState = { type: "form"; role?: Role } | { type: "delete"; role: Role } | null;

export function RolesPanel() {
  const { workspace, setWorkspace } = useWorkspaceStore();
  const toast = useToast();
  const [modal, setModal] = useState<RoleModalState>(null);
  const roles = workspace.roles, team = workspace.team;
  const memberCount = (rid: string) => team.filter((m) => m.roleId === rid).length;

  const saveRole = (data: RoleDraft) => {
    if (data.id) setWorkspace((w) => ({ ...w, roles: w.roles.map((r) => (r.id === data.id ? { ...r, ...data } : r)) }));
    else setWorkspace((w) => ({ ...w, roles: [...w.roles, { ...data, id: "role_" + Date.now(), system: false }] }));
    setModal(null); toast(data.id ? "Rol actualizado" : "Rol creado");
  };
  const deleteRole = (role: Role) => {
    setWorkspace((w) => ({ ...w, roles: w.roles.filter((r) => r.id !== role.id), team: w.team.map((m) => (m.roleId === role.id ? { ...m, roleId: "r_agent" } : m)) }));
    setModal(null); toast("Rol eliminado");
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="flex items-center">
        <div style={{ flex: 1 }}>
          <h1 style={st.h1}>Roles</h1>
          <p style={st.lead}>Define conjuntos de permisos y asígnalos a los miembros.</p>
        </div>
        <button className="fobo-btn fobo-btn-primary fobo-btn-sm" onClick={() => setModal({ type: "form" })}><Icon name="plus" size={16} /> Nuevo rol</button>
      </div>
      {roles.map((r) => {
        const t = ROLE_TINT[r.color] || ROLE_TINT.neutral;
        const granted = PERMISSIONS.filter((p) => r.perms[p.key]);
        return (
          <div key={r.id} style={st.card}>
            <div style={st.cardHead}>
              <span className="flex items-center justify-center flex-none" style={{ width: 34, height: 34, borderRadius: 9, background: t.bg, color: t.fg }}><Icon name="shield" size={18} /></span>
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-2" style={st.cardTitle}>{r.name}{r.system && <span className="fobo-badge bg-[var(--neutral-200)] text-[var(--color-text-secondary)]" style={{ fontSize: 10 }}>Sistema</span>}</div>
                <div style={st.cardSub}>{memberCount(r.id)} miembro{memberCount(r.id) !== 1 ? "s" : ""} · {granted.length} de {PERMISSIONS.length} permisos</div>
              </div>
              <button className="fobo-btn fobo-btn-secondary fobo-btn-sm" onClick={() => setModal({ type: "form", role: r })}><Icon name="edit" size={15} /> Editar</button>
              {!r.system && <button title="Eliminar" onClick={() => setModal({ type: "delete", role: r })} className="inline-flex items-center justify-center rounded-full border-none cursor-pointer" style={{ width: 34, height: 34, background: "transparent", color: "var(--color-error)" }}><Icon name="trash" size={16} /></button>}
            </div>
            <div className="flex flex-wrap gap-2" style={{ padding: "14px 20px" }}>
              {PERMISSIONS.map((p) => {
                const on = r.perms[p.key];
                return <span key={p.key} className="inline-flex items-center gap-1.5" style={{ fontSize: 12, color: on ? "var(--color-text-primary)" : "var(--color-text-disabled)" }}><Icon name={on ? "check2" : "x"} size={14} style={{ color: on ? "var(--color-success)" : "var(--color-text-disabled)" }} />{p.label}</span>;
              })}
            </div>
          </div>
        );
      })}
      {modal?.type === "form" && <RoleFormModal initial={modal.role} onClose={() => setModal(null)} onSave={saveRole} />}
      {modal?.type === "delete" && <ConfirmModal title="¿Eliminar rol?" message={`Los miembros con «${modal.role.name}» pasarán a Agente. No se puede deshacer.`} onClose={() => setModal(null)} onConfirm={() => deleteRole(modal.role)} />}
    </div>
  );
}
