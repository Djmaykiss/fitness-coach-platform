/**
 * BodySilhouette — silueta anatómica vectorial (SVG) para el paso "tipo de cuerpo"
 * del onboarding. Estilo premium tipo apps de composición corporal (no caricatura,
 * no fotografía). Parametrizada por SEXO (male/female) y TIPO de composición, con
 * proporciones anatómicas reales por categoría.
 *
 * Diseño técnico:
 * - 100% vectorial y coloreada con `currentColor` -> el color/estado (neón,
 *   selección, glow) lo controla el CSS del contenedor, sin tocar este componente.
 * - El torso es un `path` relleno; las extremidades son trazos con extremos
 *   redondeados (linecap/linejoin round) que se funden por compartir color -> lectura
 *   orgánica y mantenible.
 * - Accesible: `role="img"` + `aria-label`.
 * - Responsive: escala con el contenedor (width/height 100%).
 */

type Sex = "male" | "female";
export type BodyTypeKey =
  | "muy-delgado"
  | "delgado"
  | "atletico"
  | "promedio"
  | "sobrepeso"
  | "obesidad";

/** Medios-anchos (px, viewBox 200 de ancho, centro x=100) y flags por composición. */
type Params = {
  neck: number;
  shoulder: number;
  chest: number;
  waist: number;
  hip: number;
  thigh: number;
  calf: number;
  arm: number;
  belly: number; // 0..1 bulto abdominal (grasa)
  carve?: boolean; // líneas sutiles de definición muscular (atlético)
};

const MALE: Record<BodyTypeKey, Params> = {
  "muy-delgado": { neck: 6, shoulder: 22, chest: 17, waist: 14, hip: 18, thigh: 9, calf: 6, arm: 6, belly: 0 },
  delgado: { neck: 7, shoulder: 26, chest: 21, waist: 17, hip: 21, thigh: 11, calf: 7, arm: 7, belly: 0 },
  atletico: { neck: 8, shoulder: 37, chest: 27, waist: 17, hip: 23, thigh: 15, calf: 8, arm: 10, belly: 0, carve: true },
  promedio: { neck: 7, shoulder: 30, chest: 26, waist: 23, hip: 26, thigh: 15, calf: 9, arm: 9, belly: 0.18 },
  sobrepeso: { neck: 9, shoulder: 33, chest: 33, waist: 33, hip: 34, thigh: 19, calf: 11, arm: 11, belly: 0.5 },
  obesidad: { neck: 11, shoulder: 38, chest: 43, waist: 46, hip: 44, thigh: 23, calf: 13, arm: 13, belly: 0.92 },
};

/** Ajustes femeninos: hombros/cintura más estrechos, cadera más ancha, busto, cabello. */
function femaleOf(p: Params): Params {
  return {
    neck: p.neck * 0.85,
    shoulder: p.shoulder * 0.84,
    chest: p.chest * 0.92,
    waist: p.waist * 0.85,
    hip: p.hip * 1.12,
    thigh: p.thigh * 1.04,
    calf: p.calf,
    arm: p.arm * 0.9,
    belly: p.belly,
    carve: p.carve,
  };
}

const CX = 100;
const r = (n: number) => Math.round(n * 100) / 100;

function torsoPath(p: Params): string {
  const bulge = p.belly * 16; // ensanche extra en la cintura para tipos con grasa
  const s = p.shoulder;
  const c = p.chest;
  const w = p.waist;
  const h = p.hip;
  const n = p.neck;
  // Puntos clave en Y
  const yNeck = 88;
  const yShoulder = 98;
  const yChest = 126;
  const yWaist = 172;
  const yHip = 200;
  const yCrotch = 212;
  return [
    `M ${r(CX - s)} ${yShoulder}`,
    `Q ${r(CX - n - 2)} ${86} ${r(CX - n)} ${yNeck}`,
    `L ${r(CX + n)} ${yNeck}`,
    `Q ${r(CX + n + 2)} ${86} ${r(CX + s)} ${yShoulder}`,
    `C ${r(CX + c + 4)} ${110} ${r(CX + c)} ${118} ${r(CX + c)} ${yChest}`,
    `C ${r(CX + c)} ${144} ${r(CX + w + bulge)} ${154} ${r(CX + w)} ${yWaist}`,
    `C ${r(CX + w)} ${184} ${r(CX + h)} ${190} ${r(CX + h)} ${yHip}`,
    `C ${r(CX + h)} ${208} ${r(CX + h * 0.5)} ${yCrotch} ${CX} ${yCrotch}`,
    `C ${r(CX - h * 0.5)} ${yCrotch} ${r(CX - h)} ${208} ${r(CX - h)} ${yHip}`,
    `C ${r(CX - h)} ${190} ${r(CX - w)} ${184} ${r(CX - w)} ${yWaist}`,
    `C ${r(CX - w - bulge)} ${154} ${r(CX - c)} ${144} ${r(CX - c)} ${yChest}`,
    `C ${r(CX - c)} ${118} ${r(CX - s - 4)} ${110} ${r(CX - s)} ${yShoulder}`,
    "Z",
  ].join(" ");
}

/** Extremidad = trazo (se funde por compartir color). */
function Limb({ x1, y1, x2, y2, w }: { x1: number; y1: number; x2: number; y2: number; w: number }) {
  return <line x1={r(x1)} y1={r(y1)} x2={r(x2)} y2={r(y2)} strokeWidth={r(w)} />;
}

export function BodySilhouette({
  sex,
  type,
  label,
  className,
}: {
  sex: Sex;
  type: BodyTypeKey;
  label?: string;
  className?: string;
}) {
  const base = MALE[type] ?? MALE.promedio;
  const p = sex === "female" ? femaleOf(base) : base;

  // Cabeza / cuello
  const headCy = sex === "female" ? 45 : 44;
  const headRx = sex === "female" ? 17 : 20;
  const headRy = sex === "female" ? 21 : 23;

  // Piernas (trazos con quiebre rodilla)
  const split = Math.max(7, p.hip * 0.42);
  const kneeY = 278;
  const ankleY = 338;

  // Brazos (hombro -> codo -> muñeca, ligeramente separados del cuerpo)
  const shX = p.shoulder - 1;
  const elbowX = p.shoulder + p.arm * 0.5 + 3;
  const wristX = p.hip + 4;

  return (
    <svg
      viewBox="0 0 200 360"
      className={className}
      role="img"
      aria-label={label ? `Silueta de cuerpo: ${label}` : "Silueta de cuerpo"}
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Cabello (femenino): marco sutil detrás de la cabeza */}
      {sex === "female" ? (
        <path
          d={`M ${CX - headRx - 3} ${headCy - 4}
              Q ${CX - headRx - 4} ${headCy + headRy + 6} ${CX - headRx + 2} ${headCy + headRy + 10}
              L ${CX + headRx - 2} ${headCy + headRy + 10}
              Q ${CX + headRx + 4} ${headCy + headRy + 6} ${CX + headRx + 3} ${headCy - 4}
              Q ${CX} ${headCy - headRy - 6} ${CX - headRx - 3} ${headCy - 4} Z`}
          opacity={0.85}
        />
      ) : null}

      {/* Cabeza */}
      <ellipse cx={CX} cy={headCy} rx={headRx} ry={headRy} />
      {/* Cuello */}
      <line x1={CX} y1={headCy + headRy - 3} x2={CX} y2={92} strokeWidth={r(p.neck * 2)} />

      {/* Brazos */}
      <g>
        <Limb x1={CX + shX} y1={102} x2={CX + elbowX} y2={152} w={p.arm * 2} />
        <Limb x1={CX + elbowX} y1={152} x2={CX + wristX} y2={198} w={p.arm * 1.7} />
        <ellipse cx={r(CX + wristX)} cy={202} rx={r(p.arm * 1.05)} ry={r(p.arm * 1.25)} />
        <Limb x1={CX - shX} y1={102} x2={CX - elbowX} y2={152} w={p.arm * 2} />
        <Limb x1={CX - elbowX} y1={152} x2={CX - wristX} y2={198} w={p.arm * 1.7} />
        <ellipse cx={r(CX - wristX)} cy={202} rx={r(p.arm * 1.05)} ry={r(p.arm * 1.25)} />
      </g>

      {/* Piernas */}
      <g>
        <Limb x1={CX + split} y1={206} x2={CX + split * 0.72} y2={kneeY} w={p.thigh * 2} />
        <Limb x1={CX + split * 0.72} y1={kneeY} x2={CX + split * 0.64} y2={ankleY} w={p.calf * 2} />
        <ellipse cx={r(CX + split * 0.64)} cy={ankleY + 4} rx={r(p.calf * 1.3)} ry={r(p.calf * 0.7)} />
        <Limb x1={CX - split} y1={206} x2={CX - split * 0.72} y2={kneeY} w={p.thigh * 2} />
        <Limb x1={CX - split * 0.72} y1={kneeY} x2={CX - split * 0.64} y2={ankleY} w={p.calf * 2} />
        <ellipse cx={r(CX - split * 0.64)} cy={ankleY + 4} rx={r(p.calf * 1.3)} ry={r(p.calf * 0.7)} />
      </g>

      {/* Torso */}
      <path d={torsoPath(p)} />

      {/* Busto (femenino) */}
      {sex === "female" ? (
        <g>
          <ellipse cx={r(CX - p.chest * 0.42)} cy={130} rx={r(Math.max(5, p.chest * 0.34))} ry={r(Math.max(5, p.chest * 0.3))} />
          <ellipse cx={r(CX + p.chest * 0.42)} cy={130} rx={r(Math.max(5, p.chest * 0.34))} ry={r(Math.max(5, p.chest * 0.3))} />
        </g>
      ) : null}

      {/* Definición muscular sutil (atlético): líneas talladas en negro translúcido */}
      {p.carve ? (
        <g stroke="rgba(0,0,0,0.22)" fill="none" strokeWidth={2}>
          <line x1={CX} y1={132} x2={CX} y2={168} />
          <path d={`M ${CX - 9} ${142} Q ${CX} ${150} ${CX + 9} ${142}`} />
          <path d={`M ${CX - 8} ${156} L ${CX + 8} ${156}`} />
          <path d={`M ${CX - p.chest * 0.6} ${118} Q ${CX} ${112} ${CX + p.chest * 0.6} ${118}`} />
        </g>
      ) : null}
    </svg>
  );
}
