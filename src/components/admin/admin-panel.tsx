"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CalendarClock,
  CircleDollarSign,
  ClipboardList,
  Dumbbell,
  FileText,
  LayoutDashboard,
  Library,
  ListChecks,
  MessageCircle,
  PauseCircle,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Salad,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  Workflow,
} from "lucide-react";
import { StatCard } from "@/components/ui";
import { TabNav } from "@/components/ui-kit";
import { AccessBadge } from "@/components/access-badge";
import { EvaluationDetails } from "@/components/evaluation-details";
import { ExerciseLibraryManager } from "@/components/admin/exercise-library";
import { TrainingProgramsManager } from "@/components/admin/training-programs";
import { NutritionPlansManager } from "@/components/admin/nutrition-plans";
import { DiscoverManager } from "@/components/admin/discover-manager";
import { OnboardingContentManager } from "@/components/admin/onboarding-content-manager";
import { CoachOverviewPanel } from "@/components/admin/coach-overview";
import { BusinessSettingsManager } from "@/components/admin/business-settings";
import { CrmPipeline } from "@/components/admin/crm-pipeline";
import { NotificationsCenter } from "@/components/admin/notifications-center";
import { useToast } from "@/context/toast-context";
import { adminDashboardService } from "@/services/dashboard.service";
import { leadService } from "@/services/lead.service";
import { trainingService } from "@/services/training.service";
import { nutritionService } from "@/services/nutrition.service";
import { coachConfig, whatsappTo, whatsappUrl } from "@/config/coachConfig";
import { formatDate } from "@/lib/format";
import { isValidEmail } from "@/lib/validation";
import { printClientProfile } from "@/lib/print";
import { useSettings } from "@/context/settings-context";
import type {
  AdminClientRow,
  ClientProgress,
  ExecutiveStats,
  Lead,
  LeadStatus,
  NutritionPlan,
  ProgramRow,
  TrainingProgram,
} from "@/types";

const CLIENT_STATUSES = ["Activo", "Nuevo", "Revisión", "Inactivo"];

type ClientFilter =
  | "todos"
  | "activos"
  | "vencidos"
  | "pausados"
  | "sin-programa"
  | "sin-nutricion"
  | "sin-evaluacion"
  | "renovacion";

const CLIENT_FILTERS: { key: ClientFilter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "activos", label: "Activos" },
  { key: "vencidos", label: "Vencidos" },
  { key: "pausados", label: "Pausados" },
  { key: "sin-programa", label: "Sin programa" },
  { key: "sin-nutricion", label: "Sin nutrición" },
  { key: "sin-evaluacion", label: "Sin evaluación" },
  { key: "renovacion", label: "Renovación próxima" },
];
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
  | { kind: "deleteClient"; client: AdminClientRow }
  | { kind: "assign"; client: AdminClientRow }
  | { kind: "assignTraining"; client: AdminClientRow }
  | { kind: "assignNutrition"; client: AdminClientRow }
  | { kind: "progress"; client: AdminClientRow }
  | { kind: "access"; client: AdminClientRow }
  | { kind: "editLead"; lead: Lead }
  | { kind: "deleteLead"; lead: Lead }
  | { kind: "createProgram" }
  | null;

/** Pestañas del panel del coach (12B). Cada una muestra sus modulos existentes. */
const ADMIN_TABS = [
  { key: "inicio", label: "Inicio", icon: LayoutDashboard },
  { key: "alumnos", label: "Alumnos", icon: Users },
  { key: "crm", label: "CRM", icon: Workflow },
  { key: "contenido", label: "Contenido", icon: Library },
  { key: "notificaciones", label: "Notificaciones", icon: Bell },
  { key: "configuracion", label: "Configuración", icon: Settings2 },
];

/** Sub-pestañas dentro de "Contenido" (12C). Un manager visible a la vez. */
const CONTENT_TABS = [
  { key: "biblioteca", label: "Biblioteca", icon: Dumbbell },
  { key: "programas", label: "Programas", icon: ListChecks },
  { key: "nutricion", label: "Nutrición", icon: Salad },
  { key: "descubre", label: "Descubre", icon: BookOpen },
  { key: "onboarding", label: "Onboarding", icon: Sparkles },
];

export function AdminPanel({
  activeTab,
  onTabChange,
}: {
  /** Tab controlado por el shell (sidebar). Si no se pasa, usa estado interno. */
  activeTab?: string;
  onTabChange?: (key: string) => void;
} = {}) {
  const toast = useToast();
  const [internalTab, setInternalTab] = useState<string>("inicio");
  const tab = activeTab ?? internalTab;
  const setTab = onTabChange ?? setInternalTab;
  const [contentTab, setContentTab] = useState<string>("biblioteca");
  const [exec, setExec] = useState<ExecutiveStats | null>(null);
  const [clients, setClients] = useState<AdminClientRow[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [editor, setEditor] = useState<Editor>(null);
  const [leadDetail, setLeadDetail] = useState<Lead | null>(null);
  const [clientDetail, setClientDetail] = useState<AdminClientRow | null>(null);
  const [clientQuery, setClientQuery] = useState("");
  const [clientFilter, setClientFilter] = useState<ClientFilter>("todos");
  const [leadQuery, setLeadQuery] = useState("");

  async function load() {
    // RESILIENTE: cada carga es independiente; si una falla (p. ej. stats), la lista
    // de alumnos igual se muestra (antes un solo fallo del Promise.all borraba todo).
    const [e, c, l, p] = await Promise.allSettled([
      adminDashboardService.getExecutiveStats(),
      adminDashboardService.getClientRows(),
      leadService.getLeads(),
      adminDashboardService.getPrograms(),
    ]);
    if (e.status === "fulfilled") setExec(e.value);
    if (c.status === "fulfilled") setClients(c.value);
    if (l.status === "fulfilled") setLeads(l.value);
    if (p.status === "fulfilled") setPrograms(p.value);
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
    toast.success(`${lead.name} ahora es alumno.`);
  }

  async function quickRenew(id: string) {
    await adminDashboardService.renewAccess(id, "Efectivo");
    await load();
    toast.success("Acceso renovado 30 días.");
  }

  async function quickPause(id: string) {
    await adminDashboardService.pauseAccess(id);
    await load();
    toast.info("Acceso del alumno pausado.");
  }

  if (!loaded) {
    return <p className="text-zinc-400">Cargando datos del panel...</p>;
  }

  const q = clientQuery.trim().toLowerCase();
  const filteredClients = clients.filter((c) => {
    const matchesQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchesFilter =
      clientFilter === "todos" ||
      (clientFilter === "activos" && c.accessStatus === "Activo") ||
      (clientFilter === "vencidos" && c.accessStatus === "Vencido") ||
      (clientFilter === "pausados" && c.accessStatus === "Pausado") ||
      (clientFilter === "sin-programa" && !c.hasProgram) ||
      (clientFilter === "sin-nutricion" && !c.hasNutrition) ||
      (clientFilter === "sin-evaluacion" && !c.hasEvaluation) ||
      (clientFilter === "renovacion" && c.renewSoon);
    return matchesQuery && matchesFilter;
  });

  const lq = leadQuery.trim().toLowerCase();
  const filteredLeads = leads.filter(
    (l) =>
      !lq ||
      l.name.toLowerCase().includes(lq) ||
      l.email.toLowerCase().includes(lq) ||
      l.phone.toLowerCase().includes(lq),
  );

  return (
    <>
      {/* Navegacion por tabs: en DESKTOP la da el sidebar del AdminShell; aqui es la
          tira compacta para movil/tablet (lg:hidden), sticky bajo el header movil. */}
      <div className="sticky top-14 z-20 -mx-4 mb-6 border-b border-white/10 bg-[#050706]/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
        <TabNav
          tabs={ADMIN_TABS}
          active={tab}
          onChange={setTab}
          aria-label="Secciones del panel"
        />
      </div>

      {/* Editores y fichas: se muestran al accionar desde cualquier seccion */}
      {editor ? (
        <div className="mb-6">
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
        <div className="mb-6">
          <LeadDetailCard lead={leadDetail} onClose={() => setLeadDetail(null)} />
        </div>
      ) : null}
      {clientDetail ? (
        <div className="mb-6">
          <ClientDetailCard client={clientDetail} onClose={() => setClientDetail(null)} />
        </div>
      ) : null}

      {/* NOTIFICACIONES */}
      {tab === "notificaciones" ? <NotificationsCenter /> : null}

      {/* CRM · Pipeline (leads + alumnos por etapa) */}
      {tab === "crm" ? <CrmPipeline /> : null}

      {/* INICIO · overview con métricas reales + panel ejecutivo */}
      {tab === "inicio" ? (
        <div className="space-y-6">
          <CoachOverviewPanel
            onNavigate={(t, sub) => {
              setTab(t);
              if (sub) setContentTab(sub);
            }}
          />

      {/* Panel ejecutivo (brechas operativas por atender) */}
      {exec ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Total alumnos" value={String(exec.total)} icon={Users} />
          <StatCard label="Activos" value={String(exec.activos)} icon={UserCheck} />
          <StatCard label="Vencidos" value={String(exec.vencidos)} icon={AlertTriangle} />
          <StatCard label="Pausados" value={String(exec.pausados)} icon={PauseCircle} />
          <StatCard label="Renuevan esta semana" value={String(exec.renuevanSemana)} icon={CalendarClock} />
          <StatCard label="Sin programa" value={String(exec.sinPrograma)} icon={Dumbbell} />
          <StatCard label="Sin nutrición" value={String(exec.sinNutricion)} icon={Salad} />
          <StatCard label="Sin evaluación" value={String(exec.sinEvaluacion)} icon={ClipboardList} />
          <StatCard label="Leads pendientes" value={String(exec.leadsPendientes)} icon={UserPlus} />
          <StatCard
            label="Ingresos estimados"
            value={`$${exec.ingresosEstimados} ${coachConfig.currency}`}
            icon={CircleDollarSign}
          />
        </div>
      ) : null}
        </div>
      ) : null}

      {/* ALUMNOS · clientes + programas + leads */}
      {tab === "alumnos" ? (
        <div>

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

        {/* Buscador + filtros */}
        <div className="border-b border-white/10 px-6 py-4">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={clientQuery}
              onChange={(e) => setClientQuery(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="h-11 w-full rounded-lg border border-white/10 bg-black/35 pl-10 pr-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#65ff4f]"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {CLIENT_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setClientFilter(f.key)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                  clientFilter === f.key
                    ? "border-[#65ff4f] bg-[#65ff4f]/10 text-[#65ff4f]"
                    : "border-white/15 text-zinc-300 hover:border-[#65ff4f]/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <TableHead
              columns={["Nombre", "Acceso", "Vence", "Plan", "Progreso", ""]}
            />
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No hay alumnos que coincidan con la búsqueda o el filtro.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="border-t border-white/10 transition-colors hover:bg-white/[0.03]">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{client.name}</p>
                      {client.email ? (
                        <p className="text-xs text-zinc-500">{client.email}</p>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <AccessBadge status={client.accessStatus} />
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {formatDate(client.accessExpiresAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                        <Tag on={client.hasProgram}>Entreno</Tag>
                        <Tag on={client.hasNutrition}>Nutrición</Tag>
                        <Tag on={client.hasEvaluation}>Evaluación</Tag>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">
                      {client.progresoPct}%
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <RowButton onClick={() => setClientDetail(client)} icon={<FileText size={14} />}>
                          Perfil
                        </RowButton>
                        <RowButton onClick={() => setEditor({ kind: "editClient", client })} icon={<Pencil size={14} />}>
                          Editar
                        </RowButton>
                        <RowButton onClick={() => setEditor({ kind: "assignTraining", client })} icon={<Dumbbell size={14} />}>
                          Entrenamiento
                        </RowButton>
                        <RowButton onClick={() => setEditor({ kind: "assignNutrition", client })} icon={<Salad size={14} />}>
                          Nutrición
                        </RowButton>
                        <a
                          href={whatsappUrl(`Hola ${coachConfig.name}, sobre el alumno ${client.name}.`)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#25D366]/40 px-3 py-1.5 text-xs font-bold text-[#25D366] transition hover:border-[#25D366]/70 hover:bg-[#25D366]/10"
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </a>
                        <RowButton onClick={() => quickRenew(client.id)} icon={<RefreshCw size={14} />}>
                          Renovar
                        </RowButton>
                        <RowButton onClick={() => quickPause(client.id)} icon={<PauseCircle size={14} />}>
                          Pausar
                        </RowButton>
                        <RowButton onClick={() => setEditor({ kind: "deleteClient", client })} icon={<Trash2 size={14} />} danger>
                          Eliminar
                        </RowButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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

        </div>
      ) : null}

      {/* CONTENIDO · sub-tabs (12C): un manager visible a la vez */}
      {tab === "contenido" ? (
        <div className="space-y-4">
          <TabNav
            tabs={CONTENT_TABS}
            active={contentTab}
            onChange={setContentTab}
            aria-label="Contenido del coach"
          />

          {/* Biblioteca de ejercicios (catálogo) */}
          {contentTab === "biblioteca" ? <ExerciseLibraryManager /> : null}

          {/* Programas de entrenamiento (builder real) */}
          {contentTab === "programas" ? <TrainingProgramsManager /> : null}

          {/* Planes de nutrición (módulo real) */}
          {contentTab === "nutricion" ? <NutritionPlansManager /> : null}

          {/* Descubre (CMS de contenido del alumno) */}
          {contentTab === "descubre" ? <DiscoverManager /> : null}

          {/* Onboarding (CMS de mensajes, recompensas y predicción) */}
          {contentTab === "onboarding" ? <OnboardingContentManager /> : null}
        </div>
      ) : null}

      {/* ALUMNOS · leads (misma pestaña que clientes/programas) */}
      {tab === "alumnos" ? (
        <div>

      {/* Leads */}
      <section className="premium-card mt-6 overflow-hidden rounded-2xl">
        <SectionHeader title="Leads" />
        <div className="border-b border-white/10 px-6 py-4">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={leadQuery}
              onChange={(e) => setLeadQuery(e.target.value)}
              placeholder="Buscar lead por nombre, email o teléfono..."
              className="h-11 w-full rounded-lg border border-white/10 bg-black/35 pl-10 pr-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#65ff4f]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <TableHead
              columns={["Nombre", "Teléfono", "Objetivo", "Estado", ""]}
            />
            <tbody>
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                    No hay leads que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-t border-white/10 transition-colors hover:bg-white/[0.03]">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{lead.name}</p>
                      <p className="text-xs text-zinc-500">{lead.email}</p>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{lead.phone}</td>
                    <td className="px-6 py-4 text-zinc-300">{lead.objective}</td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(event) =>
                          changeLeadStatus(lead.id, event.target.value as LeadStatus)
                        }
                        className="rounded-lg border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-bold text-zinc-200 outline-none transition focus:border-[#65ff4f]"
                      >
                        {LEAD_STATUSES.map((status) => (
                          <option key={status} value={status} className="bg-[#0a0d0b]">
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <RowButton onClick={() => setLeadDetail(lead)} icon={<FileText size={14} />}>
                          Ficha
                        </RowButton>
                        <RowButton onClick={() => setEditor({ kind: "editLead", lead })} icon={<Pencil size={14} />}>
                          Editar
                        </RowButton>
                        <LeadWhatsApp lead={lead} />
                        <RowButton
                          onClick={() => convertLead(lead)}
                          icon={<UserPlus size={14} />}
                          disabled={lead.status === "Convertido"}
                        >
                          Convertir
                        </RowButton>
                        <RowButton onClick={() => setEditor({ kind: "deleteLead", lead })} icon={<Trash2 size={14} />} danger>
                          Eliminar
                        </RowButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

        </div>
      ) : null}

      {/* CONFIGURACION · negocio / white-label */}
      {tab === "configuracion" ? <BusinessSettingsManager /> : null}
    </>
  );
}

/**
 * Boton WhatsApp del lead: abre wa.me AL NUMERO DEL LEAD con un mensaje del coach.
 * Si el lead no tiene telefono valido, se muestra deshabilitado (no disponible).
 */
function LeadWhatsApp({ lead }: { lead: Lead }) {
  const href = whatsappTo(
    lead.phone,
    `Hola ${lead.name}, soy ${coachConfig.name}, tu coach fitness. Vi tu solicitud y quería ayudarte con tu objetivo.`,
  );

  if (!href) {
    return (
      <span
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-600"
        title="Este lead no tiene teléfono"
      >
        <MessageCircle size={14} />
        Sin teléfono
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#25D366]/40 px-3 py-1.5 text-xs font-bold text-[#25D366] transition hover:border-[#25D366]/70 hover:bg-[#25D366]/10"
    >
      <MessageCircle size={14} />
      WhatsApp
    </a>
  );
}

/** Etiqueta de estado (verde si la condicion se cumple). */
function Tag({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 ${
        on
          ? "bg-[#65ff4f]/10 text-[#65ff4f]"
          : "bg-white/[0.04] text-zinc-600 line-through"
      }`}
    >
      {children}
    </span>
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
  const { settings } = useSettings();
  return (
    <FormShell title={`Ficha: ${client.name}`} onClose={onClose}>
      <button
        type="button"
        onClick={() => printClientProfile(client, settings.businessName)}
        className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]"
      >
        <Printer size={16} />
        Imprimir / Exportar perfil
      </button>
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
  const toast = useToast();
  if (editor.kind === "createClient") {
    return (
      <FormShell title="Nuevo cliente" onClose={onClose}>
        <ClientForm
          onCancel={onClose}
          onSubmit={async (values) => {
            await adminDashboardService.createClient(values);
            await onDone();
            toast.success("Alumno creado.");
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

  if (editor.kind === "deleteClient") {
    return (
      <FormShell title={`Eliminar alumno: ${editor.client.name}`} onClose={onClose}>
        <DeleteClientForm
          client={editor.client}
          onCancel={onClose}
          onConfirm={async () => {
            await adminDashboardService.deleteClient(editor.client.id);
            await onDone();
            toast.success("Alumno eliminado.");
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

  if (editor.kind === "assignTraining") {
    return (
      <FormShell title={`Entrenamiento: ${editor.client.name}`} onClose={onClose}>
        <AssignTrainingForm
          clientId={editor.client.id}
          onCancel={onClose}
          onDone={onDone}
        />
      </FormShell>
    );
  }

  if (editor.kind === "assignNutrition") {
    return (
      <FormShell title={`Nutrición: ${editor.client.name}`} onClose={onClose}>
        <AssignNutritionForm
          clientId={editor.client.id}
          onCancel={onClose}
          onDone={onDone}
        />
      </FormShell>
    );
  }

  if (editor.kind === "editLead") {
    return (
      <FormShell title={`Editar lead: ${editor.lead.name}`} onClose={onClose}>
        <LeadForm
          lead={editor.lead}
          onCancel={onClose}
          onDone={onDone}
        />
      </FormShell>
    );
  }

  if (editor.kind === "deleteLead") {
    return (
      <FormShell title={`Eliminar lead: ${editor.lead.name}`} onClose={onClose}>
        <DeleteLeadForm
          lead={editor.lead}
          onCancel={onClose}
          onDone={onDone}
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

/* ---------- Asignar entrenamiento / nutricion (rapido desde la fila) ---------- */
function AssignTrainingForm({
  clientId,
  onCancel,
  onDone,
}: {
  clientId: string;
  onCancel: () => void;
  onDone: () => void | Promise<void>;
}) {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    trainingService.getPrograms().then((p) => {
      if (!active) return;
      setPrograms(p);
      setSelected(p[0]?.id ?? "");
    });
    return () => {
      active = false;
    };
  }, []);

  if (programs.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Aún no hay programas de entrenamiento. Créalos en su sección.
        </p>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!selected) return;
        setSaving(true);
        await trainingService.assignToClient(clientId, selected);
        await onDone();
      }}
    >
      <SelectField
        label="Programa de entrenamiento"
        value={selected}
        onChange={setSelected}
        options={programs.map((p) => p.id)}
        labels={Object.fromEntries(programs.map((p) => [p.id, p.name]))}
      />
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {saving ? "Asignando..." : "Asignar programa"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function AssignNutritionForm({
  clientId,
  onCancel,
  onDone,
}: {
  clientId: string;
  onCancel: () => void;
  onDone: () => void | Promise<void>;
}) {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    nutritionService.getPlans().then((p) => {
      if (!active) return;
      setPlans(p);
      setSelected(p[0]?.id ?? "");
    });
    return () => {
      active = false;
    };
  }, []);

  if (plans.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Aún no hay planes de nutrición. Créalos en su sección.
        </p>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!selected) return;
        setSaving(true);
        await nutritionService.assignToClient(clientId, selected);
        await onDone();
      }}
    >
      <SelectField
        label="Plan de nutrición"
        value={selected}
        onChange={setSelected}
        options={plans.map((p) => p.id)}
        labels={Object.fromEntries(plans.map((p) => [p.id, p.name]))}
      />
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {saving ? "Asignando..." : "Asignar plan"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

/* ---------- Editar / eliminar lead ---------- */
function LeadForm({
  lead,
  onCancel,
  onDone,
}: {
  lead: Lead;
  onCancel: () => void;
  onDone: () => void | Promise<void>;
}) {
  const toast = useToast();
  const [name, setName] = useState(lead.name);
  const [email, setEmail] = useState(lead.email);
  const [phone, setPhone] = useState(lead.phone);
  const [objective, setObjective] = useState(lead.objective);
  const [message, setMessage] = useState(lead.message);
  const [saving, setSaving] = useState(false);

  return (
    <Form
      saving={saving}
      onCancel={onCancel}
      onSubmit={async (event) => {
        event.preventDefault();
        if (!name.trim()) return;
        if (email.trim() && !isValidEmail(email)) {
          toast.error("El email del lead no es válido.");
          return;
        }
        setSaving(true);
        await leadService.updateLead(lead.id, {
          name,
          email,
          phone,
          objective,
          message,
        });
        await onDone();
        toast.success("Lead actualizado.");
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Nombre" value={name} onChange={setName} required />
        <TextField label="Email" value={email} onChange={setEmail} />
        <TextField label="Teléfono" value={phone} onChange={setPhone} />
        <TextField label="Objetivo" value={objective} onChange={setObjective} />
      </div>
      <div className="mt-4">
        <TextField label="Mensaje" value={message} onChange={setMessage} />
      </div>
    </Form>
  );
}

function DeleteLeadForm({
  lead,
  onCancel,
  onDone,
}: {
  lead: Lead;
  onCancel: () => void;
  onDone: () => void | Promise<void>;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4 text-sm leading-6">
        <p className="font-bold text-white">¿Eliminar el lead {lead.name}?</p>
        <p className="mt-1 text-zinc-400">
          Se quitará de la lista de leads. Esta acción no se puede deshacer.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          className={dangerBtn}
          onClick={async () => {
            setSaving(true);
            await leadService.deleteLead(lead.id);
            await onDone();
            toast.success("Lead eliminado.");
          }}
        >
          <Trash2 size={16} />
          {saving ? "Eliminando..." : "Sí, eliminar lead"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </div>
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

function DeleteClientForm({
  client,
  onConfirm,
  onCancel,
}: {
  client: AdminClientRow;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4">
        <AlertTriangle className="mt-0.5 shrink-0 text-red-400" size={20} />
        <div className="text-sm leading-6 text-zinc-200">
          <p className="font-bold text-white">
            ¿Eliminar a {client.name}?
          </p>
          <p className="mt-1 text-zinc-400">
            Se borrarán su ficha, su progreso, sus fotos y sus checklists. Esta
            acción no se puede deshacer. La cuenta de inicio de sesión del alumno
            no se elimina.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onConfirm();
          }}
          className={dangerBtn}
        >
          <Trash2 size={16} />
          {saving ? "Eliminando..." : "Sí, eliminar alumno"}
        </button>
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Cancelar
        </button>
      </div>
    </div>
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
  labels,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
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
            {labels?.[option] ?? option}
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
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  const tone = danger
    ? "border-red-500/30 text-red-400 hover:border-red-500/60 hover:text-red-300 disabled:hover:border-red-500/30 disabled:hover:text-red-400"
    : "border-white/15 text-zinc-300 hover:border-[#65ff4f]/50 hover:text-[#65ff4f] disabled:hover:border-white/15 disabled:hover:text-zinc-300";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${tone}`}
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
