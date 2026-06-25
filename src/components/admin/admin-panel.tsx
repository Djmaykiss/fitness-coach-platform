"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, SlidersHorizontal, Target } from "lucide-react";
import { StatCard } from "@/components/ui";
import { adminDashboardService } from "@/services/dashboard.service";
import type {
  AdminClientRow,
  ClientProgress,
  DashboardStat,
  LeadRow,
  ProgramRow,
} from "@/types";

const CLIENT_STATUSES = ["Activo", "Nuevo", "Revision", "Inactivo"];
const PROGRAM_STATUSES = ["Activo", "Inactivo"];

type Editor =
  | { kind: "createClient" }
  | { kind: "editClient"; client: AdminClientRow }
  | { kind: "assign"; client: AdminClientRow }
  | { kind: "progress"; client: AdminClientRow }
  | { kind: "createProgram" }
  | null;

export function AdminPanel() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [clients, setClients] = useState<AdminClientRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editor, setEditor] = useState<Editor>(null);

  async function load() {
    const [s, c, l, p] = await Promise.all([
      adminDashboardService.getStats(),
      adminDashboardService.getClientRows(),
      adminDashboardService.getLeads(),
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
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <TableHead columns={["Nombre", "Programa", "Estado", "Progreso", ""]} />
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t border-white/10">
                  <td className="px-6 py-4 font-semibold text-white">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{client.programa}</td>
                  <td className="px-6 py-4">
                    <Badge>{client.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    {client.progresoPct}%
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
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
          columns={["Nombre", "Clientes", "Duracion", "Estado"]}
          rows={programs.map((p) => [p.name, p.clients, p.duration, p.status])}
        />
      </section>

      {/* Leads */}
      <section className="premium-card mt-6 overflow-hidden rounded-2xl">
        <SectionHeader title="Leads" />
        <ReadonlyTable
          columns={["Nombre", "Fuente", "Interes", "Estado"]}
          rows={leads.map((l) => [l.name, l.source, l.interest, l.status])}
        />
      </section>
    </>
  );
}

function editorKey(editor: NonNullable<Editor>): string {
  return "client" in editor ? `${editor.kind}-${editor.client.id}` : editor.kind;
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
          label="Duracion"
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
          Aun no hay programas. Crea uno primero para poder asignarlo.
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
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#65ff4f] px-5 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[#85ff73] disabled:cursor-not-allowed disabled:opacity-60";
const secondaryBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/15 px-5 text-sm font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]";
const inputClass =
  "mt-2 h-11 w-full rounded-lg border border-white/10 bg-black/35 px-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#65ff4f]";

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
      className="inline-flex items-center gap-2 rounded-lg bg-[#65ff4f] px-4 py-2 text-xs font-black uppercase tracking-wide text-black transition hover:bg-[#85ff73]"
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
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]"
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
    <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-zinc-500">
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
            <tr key={row.join("-")} className="border-t border-white/10">
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
