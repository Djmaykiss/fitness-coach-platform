import type { LibraryExercise } from "@/types";
import { categoryIdForMuscleGroup } from "@/data/exercise-categories";

/**
 * Biblioteca de ejercicios inicial (seed). El coach la gestiona en `/admin` y al
 * crear un programa elige ejercicios de aqui. Persistida en `localStorage`.
 *
 * Las imagenes/gifs/videos quedan vacios por defecto (placeholder elegante via
 * `onError`); el coach puede pegar URLs propias. No se usan fotos de personas
 * reales. Uno trae video de demostracion de ejemplo (YouTube) para mostrar el flujo.
 */
function ex(
  id: string,
  name: string,
  muscleGroup: string,
  data: Partial<LibraryExercise>,
): LibraryExercise {
  return {
    id,
    name,
    muscleGroup,
    secondaryMuscles: "",
    image: "",
    gif: "",
    video: "",
    equipment: "",
    difficulty: "Intermedio",
    description: "",
    technique: "",
    commonMistakes: "",
    coachTips: "",
    variants: "",
    substitutions: "",
    recommendedTime: "",
    recommendedRest: "",
    visibility: "public", // seed demo: visibles en Descubre (solo modo demo/local)
    categoryId: categoryIdForMuscleGroup(muscleGroup),
    ...data,
  };
}

export const exerciseLibrarySeed: LibraryExercise[] = [
  ex("lib-press-banca", "Press banca", "Pecho", {
    secondaryMuscles: "Tríceps, hombro anterior",
    equipment: "Barra y banco",
    difficulty: "Intermedio",
    video: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
    description: "Empuje horizontal básico para desarrollar el pecho.",
    technique:
      "Escápulas retraídas, pies firmes, baja la barra al esternón y empuja en línea recta.",
    commonMistakes: "Rebotar la barra en el pecho; despegar la cadera del banco.",
    coachTips: "Controla la fase excéntrica 2-3 s y mantén tensión constante.",
    variants: "Press inclinado, press con mancuernas.",
    substitutions: "Press en máquina, flexiones lastradas.",
    recommendedTime: "—",
    recommendedRest: "90 s",
  }),
  ex("lib-press-inclinado", "Press inclinado mancuernas", "Pecho", {
    secondaryMuscles: "Hombro anterior, tríceps",
    equipment: "Mancuernas y banco inclinado",
    description: "Énfasis en la porción clavicular del pecho.",
    technique: "Banco a 30°, codos a ~45°, recorrido completo sin chocar mancuernas.",
    commonMistakes: "Inclinación excesiva del banco; arquear demasiado la espalda.",
    coachTips: "Aprieta el pecho arriba sin bloquear de golpe los codos.",
    recommendedRest: "75 s",
  }),
  ex("lib-fondos", "Fondos en paralelas", "Pecho", {
    secondaryMuscles: "Tríceps, hombro",
    equipment: "Paralelas",
    difficulty: "Avanzado",
    description: "Empuje vertical con peso corporal.",
    technique: "Ligera inclinación al frente para pecho; baja hasta 90° de codo.",
    commonMistakes: "Bajar demasiado forzando el hombro.",
    coachTips: "Usa asistencia o banda si aún no dominas el peso corporal.",
    substitutions: "Fondos en máquina asistida.",
    recommendedRest: "60 s",
  }),
  ex("lib-ext-triceps", "Extensión de tríceps en polea", "Tríceps", {
    secondaryMuscles: "",
    equipment: "Polea alta",
    difficulty: "Principiante",
    description: "Aislamiento de tríceps.",
    technique: "Codos pegados al cuerpo, extiende solo el antebrazo.",
    commonMistakes: "Mover los codos hacia adelante.",
    coachTips: "Aprieta arriba 1 s en cada repetición.",
    recommendedRest: "45 s",
  }),
  ex("lib-dominadas", "Dominadas", "Espalda", {
    secondaryMuscles: "Bíceps, antebrazo",
    equipment: "Barra fija",
    difficulty: "Avanzado",
    description: "Tracción vertical fundamental para la espalda.",
    technique: "Agarre prono, lleva el pecho a la barra y controla la bajada.",
    commonMistakes: "Balanceo (kipping) involuntario; rango incompleto.",
    coachTips: "Piensa en llevar los codos al bolsillo trasero.",
    substitutions: "Jalón al pecho, dominadas asistidas.",
    recommendedRest: "90 s",
  }),
  ex("lib-remo-barra", "Remo con barra", "Espalda", {
    secondaryMuscles: "Bíceps, lumbar",
    equipment: "Barra",
    description: "Tracción horizontal para grosor de espalda.",
    technique: "Bisagra de cadera, espalda neutra, lleva la barra al abdomen.",
    commonMistakes: "Redondear la espalda; usar impulso de cadera.",
    coachTips: "Mantén el core firme durante todo el recorrido.",
    recommendedRest: "90 s",
  }),
  ex("lib-jalon", "Jalón al pecho", "Espalda", {
    secondaryMuscles: "Bíceps",
    equipment: "Polea alta",
    difficulty: "Principiante",
    description: "Tracción vertical guiada.",
    technique: "Pecho arriba, lleva la barra a la clavícula, no detrás de la nuca.",
    commonMistakes: "Tirar con los brazos en vez de la espalda.",
    coachTips: "Inicia el movimiento bajando los hombros.",
    recommendedRest: "60 s",
  }),
  ex("lib-curl-biceps", "Curl de bíceps con barra", "Bíceps", {
    equipment: "Barra Z o recta",
    difficulty: "Principiante",
    description: "Aislamiento de bíceps.",
    technique: "Codos fijos al costado, sube sin balancear el torso.",
    commonMistakes: "Usar impulso de espalda; rango parcial.",
    coachTips: "Controla la bajada, no dejes caer la barra.",
    recommendedRest: "45 s",
  }),
  ex("lib-sentadilla", "Sentadilla", "Pierna", {
    secondaryMuscles: "Glúteo, core",
    equipment: "Barra y rack",
    difficulty: "Intermedio",
    description: "Ejercicio rey para tren inferior.",
    technique: "Pies al ancho de hombros, baja con la espalda neutra hasta paralelo.",
    commonMistakes: "Rodillas hacia adentro; talones que se despegan.",
    coachTips: "Empuja el suelo con todo el pie y mantén el pecho alto.",
    variants: "Sentadilla frontal, goblet.",
    substitutions: "Prensa de pierna.",
    recommendedRest: "120 s",
  }),
  ex("lib-peso-muerto-rumano", "Peso muerto rumano", "Isquiotibiales", {
    secondaryMuscles: "Glúteo, lumbar",
    equipment: "Barra",
    difficulty: "Intermedio",
    description: "Bisagra de cadera para cadena posterior.",
    technique: "Lleva la cadera atrás con piernas casi rectas, barra pegada al cuerpo.",
    commonMistakes: "Redondear la zona lumbar; doblar las rodillas en exceso.",
    coachTips: "Siente el estiramiento del isquio y aprieta glúteo arriba.",
    recommendedRest: "90 s",
  }),
  ex("lib-prensa", "Prensa de pierna", "Pierna", {
    secondaryMuscles: "Glúteo",
    equipment: "Máquina de prensa",
    difficulty: "Principiante",
    description: "Empuje de pierna guiado y seguro.",
    technique: "Pies a la altura de hombros, baja controlado hasta 90°.",
    commonMistakes: "Bloquear las rodillas de golpe; despegar la cadera.",
    coachTips: "No rebotes en la parte baja.",
    recommendedRest: "75 s",
  }),
  ex("lib-plancha", "Plancha", "Core", {
    equipment: "Peso corporal",
    difficulty: "Principiante",
    description: "Estabilización isométrica del core.",
    technique: "Cuerpo en línea, abdomen y glúteo apretados, no hundir la cadera.",
    commonMistakes: "Subir demasiado la cadera o dejarla caer.",
    coachTips: "Respira de forma constante durante el tiempo objetivo.",
    recommendedTime: "45 s",
    recommendedRest: "30 s",
  }),
];
