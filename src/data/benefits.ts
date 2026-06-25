import {
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  Target,
} from "lucide-react";
import type { Benefit } from "@/types";

export const benefits: Benefit[] = [
  {
    icon: Target,
    title: "Plan personalizado",
    description: "Entrenamiento segun objetivo, nivel, disponibilidad y progreso.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Seguimiento medible",
    description: "Peso, adherencia, fuerza y tareas visibles desde el dashboard.",
  },
  {
    icon: CalendarDays,
    title: "Llamadas programadas",
    description: "Agenda preparada para check-ins, consultorias y mentorias.",
  },
  {
    icon: CheckCircle2,
    title: "Sistema simple",
    description: "Menos ruido, mas ejecucion y decisiones semanales claras.",
  },
];
