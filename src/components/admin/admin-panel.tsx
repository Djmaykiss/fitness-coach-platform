"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  KeyRound,
  Pencil,
  Plus,
  SlidersHorizontal,
  Target,
  UserPlus,
} from "lucide-react";
import { StatCard } from "@/components/ui";
import { AccessBadge } from "@/components/access-badge";
import { EvaluationDetails } from "@/components/evaluation-details";
import { adminDashboardService } from "@/services/dashboard.service";
import { leadService } from "@/services/lead.service";
import { formatDate } from "@/lib/format";
import type {
  AdminClientRow,
  ClientProgress,
  DashboardStat,
  Lead,
  LeadStatus,
  ProgramRow,
} from "@/types";

const CLIENT_STATUSES = ["Activo", "Nuevo", "Revisión", "Inactivo"];
const PROGRAM_STATUSES = ["Activo", "Inactivo"];
const PAYMENT_METHODS = [
  "PayPal",
  "Zelle",
  "Western Union",
  "Efectivo",
  "Transferencia",
];
const LEAD_STATUSES: LeadStatus[] = [
  "Nuevo",
  "Contactado",
  "Convertido",
  "Descartado",
];

type Editor =
  | { kind: "createClient" }
  | { kind: "editClient"; client: AdminClientRow }
  | { kind: "assign"; client: AdminClientRow }
  | { kind: "progress"; client: AdminClientRow }
  | { kind: "access"; client: AdminClientRow }
  | { kind: "createProgram" }
  | null;

export function AdminPanel() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [clients, setClients] = useState<AdminClientRow[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editor, setEditor] = useState<Editor>(null);
  const [leadDetail, setLeadDetail] = useState<Lead | null>(null);
  const [clientDetail, setClientDetail] = useState<AdminClientRow | null>(null);

  async function load() {
    const [s, c, l, p] = await Promise.all([
      adminDashboardService.getStats(),
      adminDashboardService.getClientRows(),
      leadService.getLeads(),
      adminDashboardService.getPrograms(),
    ]);
    setStats(s);
    setClients(c);
    setLeads(l);
    setPrograms(p);
    setLoaded(true);
  }

  useEffect(() => {
    // Carga inicial desde localStorage (sistema externo) al montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function afterMutation() {
    setEditor(null);
    await load();
  }

  async function changeLeadStatus(id: string, status: LeadStatus) {
    await leadService.updateStatus(id, status);
    await load();
  }

  async function convertLead(lead: Lead) {
    await leadService.convertToClient(lead);
    await load();
  }

  if (!loaded) {
    return <p className="text-zinc-400">Cargando datos del panel...</p>;
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {editor ? (
        <div className="mt-6">
          <EditorCard
            key={editorKey(editor)}
            editor={editor}
            programs={programs}
            onClose={() => setEditor(null)}
            onDone={afterMutation}
          />
        </div>
      ) : null}

      {leadDetail ? (
        <div className="mt-6">
          <LeadDetailCard
            lead={leadDetail}
            onClose={() => setLeadDetail(null)}
          />
        </div>
      ) : null}

      {clientDetail ? (
        <div className="mt-6">
          <ClientDetailCard
            client={clientDetail}
            onClose={() => setClientDetail(null)}
          />
        </div>
      ) : null}

      {/* Clientes */}
      <section className="premium-card mt-6 overflow-hidden rounded-2xl">
        <SectionHeader
          title="Clientes"
          action={
            <ActionButton
              onClick={() => setEditor({ kind: "createClient" })}
              icon={<Plus size={16} />}
            >
              Nuevo cliente
            </ActionButton>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <TableHead
              columns={["Nombre", "Programa", "Acceso", "Vence", "Estado", "Progreso", ""]}
            />
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t border-white/10 transition-colors hover:bg-white/[0.03]">
                  <td className="px-6 py-4 font-semibold text-white">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{client.programa}</td>
                  <td className="px-6 py-4">
                    <AccessBadge status={client.accessStatus} />
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {formatDate(client.accessExpiresAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge>{client.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    {client.progresoPct}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <RowButton
                        onClick={() => setClientDetail(client)}
                        icon={<FileText size={14} />}
                      >
                        Ficha
                      </RowButton>
                      <RowButton
                        onClick={() => setEditor({ kind: "access", client })}
                        icon={<KeyRound size={14} />}
                      >
                        Acceso
                      </RowButton>
                      <RowButton
                        onClick={() => setEditor({ kind: "editClient", client })}
                        icon={<Pencil size={14} />}
                      >
                        Editar
                      </RowButton>
                      <RowButton
                        onClick={() => setEditor({ kind: "assign", client })}
                        icon={<Target size={14} />}
                      >
                        Programa
                      </RowButton>
                      <RowButton
                        onClick={() => setEditor({ kind: "progress", client })}
                        icon={<SlidersHorizontal size={14} />}
                      >
                        Progreso
                      </RowButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Programas */}
      <section className="premium-card mt-6 overflow-hidden rounded-2xl">
        <SectionHeader
          title="Programas"
          action={
            <ActionButton
              onClick={() => setEditor({ kind: "createProgram" })}
              icon={<Plus size={16} />}
            >
              Nuevo programa
            </ActionButton>
          }
        />
        <ReadonlyTable
          columns={["Nombre", "Clientes", "Duración", "Estado"]}
          rows={programs.map((p) => [p.name, p.clients, p.duration, p.status])}
        />
      </section>

      {/* Leads */}
      <section className="premium-card mt-6 overflow-hidden rounded-2xl">
        <SectionHeader title="Leads" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <TableHead
              columns={["Nombre", "Teléfono", "Objetivo", "Fuente", "Estado", ""]}
            />
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-t border-white/10 transition-colors hover:bg-white/[0.03]">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-white">{lead.name}</p>
                    <p className="text-xs text-zinc-500">{lead.email}</p>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{lead.phone}</td>
                  <td className="px-6 py-4 text-zinc-300">{lead.objective}</td>
                  <td className="px-6 py-4 text-zinc-400">{lead.source}</td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.status}
                      onChange={(event) =>
                        changeLeadStatus(
                          lead.id,
                          event.target.value as LeadStatus,
                        )
                      }
                      className="rounded-lg border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-bold text-zinc-200 outline-none transition focus:border-[#65ff4f]"
                    >
                      {LEAD_STATUSES.map((status) => (
                        <option
                          key={status}
                          value={status}
                          className="bg-[#0a0d0b]"
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <RowButton
                        onClick={() => setLeadDetail(lead)}
                        icon={<FileText size={14} />}
                      >
                        Ficha
                      </RowButton>
                      <RowButton
                        onClick={() => convertLead(lead)}
                        icon={<UserPlus size={14} />}
                        disabled={lead.status === "Convertido"}
                      >
                        Convertir
                      </RowButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function editorKey(editor: NonNullable<Editor>): string {
  return "client" in editor ? `${editor.kind}-${editor.client.id}` : editor.kind;
}

/* ---------- Ficha del lead (detalle + evaluacion) ---------- */

function LeadDetailCard({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const evaluation = lead.evaluation;
  return (
    <FormShell title={`Ficha: ${lead.name}`} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-3">
        <DetailField label="Email" value={lead.email || "—"} />
        <DetailField label="Teléfono" value={lead.phone || "—"} />
        <DetailField label="Objetivo" value={lead.objective} highlight />
        <DetailField label="Fuente" value={lead.source} />
        <DetailField label="Estado" value={lead.status} />
        <DetailField label="Fecha" value={formatDate(lead.createdAt)} />
      </div>
      {lead.message ? (
        <div className="mt-3">
          <DetailField label="Mensaje" value={lead.message} />
        </div>
      ) : null}

      {evaluation ? (
        <>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#65ff4f]">
            Evaluación inicial
          </p>
          <div className="mt-3">
            <EvaluationDetails evaluation={evaluation} />
          </div>
        </>
      ) : (
        <p className="mt-5 text-sm text-zinc-400">
          Este lead no incluye evaluación inicial (vino del formulario simple).
        </p>
      )}
    </FormShell>
  );
}

/* ---------- Ficha del alumno (evaluacion inicial) ---------- */

function ClientDetailCard({
  client,
  onClose,
}: {
  client: AdminClientRow;
  onClose: () => void;
}) {
  return (
    <FormShell title={`Ficha: ${client.name}`} onClose={onClose}>
      {client.evaluation ? (
        <EvaluationDetails evaluation={client.evaluation} />
      ) : (
        <p className="text-sm text-zinc-400">
          Este alumno no tiene evaluación inicial registrada.
        </p>
      )}
    </FormShell>
  );
}

function DetailField({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-bold ${highlight ? "text-[#65ff4f]" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ---------- Editor (despacha el formulario correcto) ---------- */

function EditorCard({
  editor,
  programs,
  onClose,
  onDone,
}: {
  editor: NonNullable<Editor>;
  programs: ProgramRow[];
  onClose: () => void;
  onDone: () => void | Promise<void>;
}) {
  if (editor.kind === "createClient") {
    return (
      <FormShell title="Nuevo cliente" onClose={onClose}>
        <ClientForm
          onCancel={onClose}
          onSubmit={async (values) => {
            await adminDashboardService.createClient(values);
            await onDone();
          }}
        />
      </FormShell>
    );
  }

  if (editor.kind === "editClient") {
    return (
      <FormShell title={`Editar: ${editor.client.name}`} onClose={onClose}>
        <ClientForm
          initial={{ name: editor.client.name, status: editor.client.status }}
          onCancel={onClose}
          onSubmit={async (values) => {
            await adminDashboardService.updateClient(editor.client.id, values);
            await onDone();
          }}
        />
      </FormShell>
    );
  }

  if (editor.kind === "createProgram") {
    return (
      <FormShell title="Nuevo programa" onClose={onClose}>
        <ProgramForm
          onCancel={onClose}
          onSubmit={async (values) => {
            await adminDashboardService.createProgram(values);
            await onDone();
          }}
        />
      </FormShell>
    );
  }

  if (editor.kind === "assign") {
    return (
      <FormShell
        title={`Asignar programa: ${editor.client.name}`}
        onClose={onClose}
      >
        <AssignProgramForm
          programs={programs}
          onCancel={onClose}
          onSubmit={async (program) => {
            await adminDashboardService.assignProgram(editor.client.id, program);
            await onDone();
          }}
        />
      </FormShell>
    );
  }

  if (editor.kind === "access") {
    return (
      <FormShell title={`Acceso: ${editor.client.name}`} onClose={onClose}>
        <AccessForm client={editor.client} onClose={onClose} onDone={onDone} />
      </FormShell>
    );
  }

  return (
    <FormShell title={`Progreso: ${editor.client.name}`} onClose={onClose}>
      <ProgressForm
        clientId={editor.client.id}
        onCancel={onClose}
        onSubmit={async (patch) => {
          await adminDashboardService.updateProgress(editor.client.id, patch);
          await onDone();
        }}
      />
    </FormShell>
  );
}

function AccessForm({
  client,
  onClose,
  onDone,
}: {
  client: AdminClientRow;
  onClose: () => void;
  onDone: () => void | Promise<void>;
}) {
  const [method, setMethod] = useState(PAYMENT_METHODS[0]);
  const [saving, setSaving] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setSaving(true);
    await action();
    await onDone();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Estado actual
          </p>
          <div className="mt-2">
            <AccessBadge status={client.accessStatus} />
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
            Vence el
          </p>
          <p className="mt-2 text-lg font-black text-white">
            {formatDate(client.accessExpiresAt)}
          </p>
        </div>
      </div>

      <SelectField
        label="Método de pago"
        value={method}
        onChange={setMethod}
        options={PAYMENT_METHODS}
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() =>
            run(() => adminDashboardService.renewAccess(client.id, method))
          }
          className={primaryBtn}
        >
          {saving ? "Guardando..." : "Renovar 30 días"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => run(() => adminDashboardService.pauseAccess(client.id))}
          className={secondaryBtn}
        >
          Pausar
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => run(() => adminDashboardService.markExpired(client.id))}
          className={dangerBtn}
        >
          Marcar vencido
        </button>
        <button type="button" onClick={onClose} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

/* ---------- Formularios ---------- */

function ClientForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: { name: string; status: string };
  onSubmit: (values: { name: string; status: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [status, setStatus] = useState(initial?.status ?? CLIENT_STATUSES[1]);
  const [saving, setSaving] = useState(false);

  return (
    <Form
      saving={saving}
      onCancel={onCancel}
      onSubmit={async (event) => {
        event.preventDefault();
        if (!name.trim()) return;
        setSaving(true);
        await onSubmit({ name, status });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nombre" value={name} onChange={setName} required />
        <SelectField
          label="Estado"
          value={status}
          onChange={setStatus}
          options={CLIENT_STATUSES}
        />
      </div>
    </Form>
  );
}

function ProgramForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: {
    name: string;
    duration: string;
    status: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState(PROGRAM_STATUSES[0]);
  const [saving, setSaving] = useState(false);

  return (
    <Form
      saving={saving}
      onCancel={onCancel}
      onSubmit={async (event) => {
        event.preventDefault();
        if (!name.trim() || !duration.trim()) return;
        setSaving(true);
        await onSubmit({ name, duration, status });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField label="Nombre" value={name} onChange={setName} required />
        <TextField
          label="Duración"
          value={duration}
          onChange={setDuration}
          placeholder="Ej: 8 semanas"
          required
        />
        <SelectField
          label="Estado"
          value={status}
          onChange={setStatus}
          options={PROGRAM_STATUSES}
        />
      </div>
    </Form>
  );
}

function AssignProgramForm({
  programs,
  onSubmit,
  onCancel,
}: {
  programs: ProgramRow[];
  onSubmit: (program: ProgramRow) => Promise<void>;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState(programs[0]?.name ?? "");
  const [saving, setSaving] = useState(false);

  if (programs.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Aún no hay programas. Crea uno primero para poder asignarlo.
        </p>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <Form
      saving={saving}
      onCancel={onCancel}
      onSubmit={async (event) => {
        event.preventDefault();
        const program = programs.find((p) => p.name === selected);
        if (!program) return;
        setSaving(true);
        await onSubmit(program);
      }}
    >
      <SelectField
        label="Programa"
        value={selected}
        onChange={setSelected}
        options={programs.map((p) => p.name)}
      />
    </Form>
  );
}

function ProgressForm({
  clientId,
  onSubmit,
  onCancel,
}: {
  clientId: string;
  onSubmit: (patch: Partial<ClientProgress>) => Promise<void>;
  onCancel: () => void;
}) {
  const [progress, setProgress] = useState<ClientProgress | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    adminDashboardService.getProgress(clientId).then((data) => {
      if (active) setProgress(data);
    });
    return () => {
      active = false;
    };
  }, [clientId]);

  if (!progress) {
    return <p className="text-sm text-zinc-400">Cargando progreso...</p>;
  }

  function set<K extends keyof ClientProgress>(key: K, value: ClientProgress[K]) {
    setProgress((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  return (
    <Form
      saving={saving}
      onCancel={onCancel}
      onSubmit={async (event) => {
        event.preventDefault();
        setSaving(true);
        await onSubmit({
          programa: progress.programa,
          progresoPct: clampPct(progress.progresoPct),
          semanaActual: Math.max(0, progress.semanaActual),
          semanasTotales: Math.max(0, progress.semanasTotales),
          pesoInicial: progress.pesoInicial,
          pesoActual: progress.pesoActual,
          objetivo: progress.objetivo,
          adherencia: progress.adherencia,
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Programa"
          value={progress.programa}
          onChange={(v) => set("programa", v)}
        />
        <NumberField
          label="Progreso (%)"
          value={progress.progresoPct}
          onChange={(v) => set("progresoPct", v)}
        />
        <NumberField
          label="Semana actual"
          value={progress.semanaActual}
          onChange={(v) => set("semanaActual", v)}
        />
        <NumberField
          label="Semanas totales"
          value={progress.semanasTotales}
          onChange={(v) => set("semanasTotales", v)}
        />
        <TextField
          label="Peso inicial"
          value={progress.pesoInicial}
          onChange={(v) => set("pesoInicial", v)}
        />
        <TextField
          label="Peso actual"
          value={progress.pesoActual}
          onChange={(v) => set("pesoActual", v)}
        />
        <TextField
          label="Objetivo"
          value={progress.objetivo}
          onChange={(v) => set("objetivo", v)}
        />
        <TextField
          label="Adherencia"
          value={progress.adherencia}
          onChange={(v) => set("adherencia", v)}
        />
      </div>
    </Form>
  );
}

function clampPct(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/* ---------- UI helpers ---------- */

const primaryBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black shadow-[0_8px_30px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";
const secondaryBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-5 text-sm font-bold text-zinc-300 transition duration-300 hover:border-[#65ff4f]/50 hover:bg-[#65ff4f]/5 hover:text-[#65ff4f]";
const dangerBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-500/40 px-5 text-sm font-bold text-red-400 transition duration-300 hover:border-red-500/70 hover:bg-red-500/5 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60";
const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-white outline-none transition duration-300 placeholder:text-zinc-600 hover:border-white/20 focus:border-[#65ff4f] focus:bg-black/50 focus:shadow-[0_0_0_3px_rgba(101,255,79,0.12)]";

function Form({
  children,
  saving,
  onSubmit,
  onCancel,
}: {
  children: React.ReactNode;
  saving: boolean;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      {children}
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function FormShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="premium-card rounded-2xl border border-[#65ff4f]/20 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-black">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-bold text-zinc-500 hover:text-[#65ff4f]"
        >
          Cerrar
        </button>
      </div>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-200">
      {label}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-bold text-zinc-200">
      {label}
      <input
        type="number"
        value={Number.isNaN(value) ? "" : value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={inputClass}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block text-sm font-bold text-zinc-200">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#0a0d0b]">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 p-6">
      <h2 className="text-2xl font-black">{title}</h2>
      {action}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-4 py-2 text-xs font-black uppercase tracking-wide text-black shadow-[0_6px_22px_-8px_rgba(101,255,79,0.5)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
    >
      {icon}
      {children}
    </button>
  );
}

function RowButton({
  children,
  onClick,
  icon,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-zinc-300"
    >
      {icon}
      {children}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg bg-[#65ff4f]/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#65ff4f]">
      {children}
    </span>
  );
}

function TableHead({ columns }: { columns: string[] }) {
  return (
    <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.12em] text-zinc-400">
      <tr>
        {columns.map((column, index) => (
          <th key={column || index} className="px-6 py-4 font-black">
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function ReadonlyTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <TableHead columns={columns} />
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")} className="border-t border-white/10 transition-colors hover:bg-white/[0.03]">
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`} className="px-6 py-4 text-zinc-300">
                  {index === row.length - 1 ? <Badge>{cell}</Badge> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
