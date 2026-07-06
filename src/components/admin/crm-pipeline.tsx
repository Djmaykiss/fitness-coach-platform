"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Clock,
  History,
  MessageCircle,
  Search,
  Target,
  UserPlus,
  Workflow,
} from "lucide-react";
import { crmService, CRM_STAGES, CRM_STAGE_STYLE } from "@/services/crm.service";
import { leadService } from "@/services/lead.service";
import { useToast } from "@/context/toast-context";
import { whatsappTo } from "@/config/coachConfig";
import { formatDate } from "@/lib/format";
import type { CrmItem, CrmStage, Lead } from "@/types";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#65ff4f] focus:bg-black/50 focus:shadow-[0_0_0_3px_rgba(101,255,79,0.12)]";
const rowBtn =
  "inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-bold text-zinc-300 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]";

export function CrmPipeline() {
  const toast = useToast();
  const [items, setItems] = useState<CrmItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<CrmStage | "todas">("todas");
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    setItems(await crmService.getPipeline());
    setLoaded(true);
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = items.filter(
    (it) =>
      !q ||
      it.name.toLowerCase().includes(q) ||
      it.email.toLowerCase().includes(q) ||
      it.objective.toLowerCase().includes(q),
  );
  const countByStage = (stage: CrmStage) =>
    filtered.filter((it) => it.stage === stage).length;
  const visibleStages =
    stageFilter === "todas" ? CRM_STAGES : ([stageFilter] as CrmStage[]);

  async function changeStage(id: string, stage: CrmStage) {
    await crmService.setStage(id, stage);
    await load();
    toast.success(`Movido a "${stage}".`);
  }
  async function convert(item: CrmItem) {
    const leads = await leadService.getLeads();
    const lead = leads.find((l) => l.id === item.id) as Lead | undefined;
    if (!lead) return;
    await crmService.convertLead(lead);
    await load();
    toast.success(`${item.name} ahora es alumno.`);
  }
  async function saveMeta(
    id: string,
    patch: { notes: string; nextAction: string; followUpDate: string },
  ) {
    await crmService.updateMeta(id, patch);
    await load();
    toast.success("Notas guardadas.");
  }

  return (
    <section className="premium-card mt-6 overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <Workflow size={18} className="text-[#65ff4f]" />
            CRM · Pipeline
          </h2>
          <p className="mt-1 hidden text-sm text-zinc-400 sm:block">
            Leads y alumnos por etapa. Filtra o cambia la etapa de cada tarjeta.
          </p>
        </div>
        <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-zinc-300">
          {filtered.length} en pipeline
        </span>
      </div>

      {/* Buscador + filtros por etapa */}
      <div className="space-y-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, email u objetivo…"
            className={`${inputClass} pl-9`}
          />
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <FilterChip active={stageFilter === "todas"} onClick={() => setStageFilter("todas")}>
            Todas ({filtered.length})
          </FilterChip>
          {CRM_STAGES.map((s) => (
            <FilterChip key={s} active={stageFilter === s} onClick={() => setStageFilter(s)}>
              {s} ({countByStage(s)})
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {!loaded ? (
          <p className="text-sm text-zinc-400">Cargando pipeline...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No hay leads ni alumnos que coincidan con la búsqueda.
          </p>
        ) : (
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
            {visibleStages.map((stage) => {
              const cards = filtered.filter((it) => it.stage === stage);
              const style = CRM_STAGE_STYLE[stage];
              return (
                <div key={stage} className="w-72 shrink-0">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-black">
                      <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                      {stage}
                    </span>
                    <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-xs font-bold text-zinc-400">
                      {cards.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {cards.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-zinc-600">
                        Vacío
                      </p>
                    ) : (
                      cards.map((it) => (
                        <PipelineCard
                          key={it.id}
                          item={it}
                          open={openId === it.id}
                          onToggle={() => setOpenId(openId === it.id ? null : it.id)}
                          onChangeStage={(s) => changeStage(it.id, s)}
                          onConvert={() => convert(it)}
                          onSaveMeta={(patch) => saveMeta(it.id, patch)}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
        active
          ? "border-[#65ff4f] bg-[#65ff4f]/10 text-[#65ff4f]"
          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-[#65ff4f]/40"
      }`}
    >
      {children}
    </button>
  );
}

function PipelineCard({
  item,
  open,
  onToggle,
  onChangeStage,
  onConvert,
  onSaveMeta,
}: {
  item: CrmItem;
  open: boolean;
  onToggle: () => void;
  onChangeStage: (stage: CrmStage) => void;
  onConvert: () => void;
  onSaveMeta: (patch: { notes: string; nextAction: string; followUpDate: string }) => void;
}) {
  const style = CRM_STAGE_STYLE[item.stage];
  const [notes, setNotes] = useState(item.notes);
  const [nextAction, setNextAction] = useState(item.nextAction);
  const [followUpDate, setFollowUpDate] = useState(item.followUpDate);
  const wa = item.phone
    ? whatsappTo(item.phone, `Hola ${item.name}, soy tu coach fitness. ¿Cómo vas?`)
    : null;

  return (
    <div className={`rounded-xl border ${style.border} bg-white/[0.03] p-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-bold text-white">{item.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
            {item.entityType === "lead" ? (
              <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-bold text-zinc-400">Lead</span>
            ) : (
              <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-bold text-zinc-400">Alumno</span>
            )}
            {item.objective ? <span className="truncate">· {item.objective}</span> : null}
          </p>
        </div>
        <span className={`shrink-0 text-[10px] font-black uppercase ${style.text}`}>●</span>
      </div>

      {item.nextAction || item.followUpDate ? (
        <div className="mt-2 space-y-1 text-xs">
          {item.nextAction ? (
            <p className="flex items-center gap-1.5 text-zinc-300">
              <Target size={12} className="shrink-0 text-[#65ff4f]" />
              {item.nextAction}
            </p>
          ) : null}
          {item.followUpDate ? (
            <p className="flex items-center gap-1.5 text-zinc-400">
              <Clock size={12} className="shrink-0 text-[#65ff4f]" />
              Seguimiento: {formatDate(item.followUpDate)}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {wa ? (
          <a href={wa} target="_blank" rel="noreferrer" className={rowBtn}>
            <MessageCircle size={13} />
            WhatsApp
          </a>
        ) : null}
        {item.entityType === "lead" ? (
          <button type="button" onClick={onConvert} className={rowBtn}>
            <UserPlus size={13} />
            Convertir
          </button>
        ) : null}
        <button type="button" onClick={onToggle} className={rowBtn}>
          <ChevronDown size={13} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
          {open ? "Cerrar" : "Editar"}
        </button>
      </div>

      {open ? (
        <div className="mt-3 space-y-3 border-t border-white/10 pt-3">
          <label className="block text-xs font-bold text-zinc-300">
            Etapa
            <select
              value={item.stage}
              onChange={(e) => onChangeStage(e.target.value as CrmStage)}
              className={`${inputClass} mt-1`}
            >
              {CRM_STAGES.map((s) => (
                <option key={s} value={s} className="bg-[#0a0d0b]">
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-bold text-zinc-300">
            Próxima acción
            <input value={nextAction} onChange={(e) => setNextAction(e.target.value)} placeholder="Ej: Llamar el lunes" className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-xs font-bold text-zinc-300">
            Fecha de seguimiento
            <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-xs font-bold text-zinc-300">
            Notas internas
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas privadas del coach" className={`${inputClass} mt-1`} />
          </label>
          <button
            type="button"
            onClick={() => onSaveMeta({ notes, nextAction, followUpDate })}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-4 text-xs font-black uppercase tracking-wide text-black transition hover:brightness-110"
          >
            Guardar
          </button>

          {item.history.length > 0 ? (
            <div className="border-t border-white/10 pt-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-zinc-500">
                <History size={12} />
                Historial
              </p>
              <ul className="space-y-1">
                {[...item.history].reverse().map((h, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-xs text-zinc-400">
                    <span>{h.stage}</span>
                    <span className="text-zinc-600">{formatDate(h.date)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
