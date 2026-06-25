import type { AccessStatus } from "@/types";

const STYLES: Record<AccessStatus, string> = {
  Activo: "bg-[#65ff4f]/10 text-[#65ff4f]",
  Vencido: "bg-red-500/15 text-red-400",
  Pausado: "bg-amber-400/15 text-amber-300",
};

/** Badge con color segun el estado de acceso del alumno. */
export function AccessBadge({ status }: { status: AccessStatus }) {
  return (
    <span
      className={`inline-block rounded-lg px-3 py-1 text-xs font-black uppercase tracking-wide ${
        STYLES[status] ?? STYLES.Vencido
      }`}
    >
      {status}
    </span>
  );
}
