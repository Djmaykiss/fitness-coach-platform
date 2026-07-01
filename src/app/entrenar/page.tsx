"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronsRight,
  Dumbbell,
  ImageIcon,
  Pause,
  Play,
  Plus,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { LogoutButton } from "@/components/logout-button";
import { ExerciseVideo } from "@/components/exercise-video";
import { useAuth } from "@/context/auth-context";
import { trainingService } from "@/services/training.service";
import { exerciseLibraryService } from "@/services/exercise-library.service";
import { clientDashboardService } from "@/services/dashboard.service";
import {
  estimateSessionCalories,
  formatClock,
  formatMinutes,
  parseSeconds,
} from "@/lib/workout";
import type {
  AssignedTraining,
  LibraryExercise,
  TrainingDay,
  WorkoutFeeling,
} from "@/types";

const WORK_DEFAULT = 40;
const REST_DEFAULT = 30;

type Phase = "prep" | "countdown" | "exercise" | "rest" | "summary";

export default function WorkoutModePage() {
  return (
    <RequireAuth role="client">
      <WorkoutMode />
    </RequireAuth>
  );
}

function WorkoutMode() {
  const { user } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<AssignedTraining | null>(null);
  const [library, setLibrary] = useState<Record<string, LibraryExercise>>({});
  const [active, setActive] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [day, setDay] = useState<TrainingDay | null>(null);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const dayParam = new URLSearchParams(window.location.search).get("day");
    Promise.all([
      trainingService.getAssignedForUser(user.id),
      exerciseLibraryService.getExercises(),
      clientDashboardService.getAccessForUser(user.id),
    ]).then(([assigned, lib, access]) => {
      if (!mounted) return;
      setData(assigned);
      setLibrary(Object.fromEntries(lib.map((e) => [e.id, e])));
      setActive(access ? access.accessStatus === "Activo" : true);
      if (assigned) {
        const completed = new Set(assigned.completedDayIds);
        const focus =
          assigned.program.days.find((d) => d.id === dayParam) ??
          assigned.program.days.find((d) => !completed.has(d.id)) ??
          assigned.program.days[0] ??
          null;
        setDay(focus);
      }
      setLoaded(true);
    });
    return () => {
      mounted = false;
    };
  }, [user]);

  if (!loaded) {
    return <Shell>Cargando tu entrenamiento…</Shell>;
  }
  if (active === false) {
    return (
      <Shell>
        <p className="text-zinc-300">
          Tu acceso no está activo. Renueva con tu coach para entrenar.
        </p>
        <Link href="/dashboard" className="mt-4 text-sm font-bold text-[#65ff4f]">
          Volver al inicio
        </Link>
      </Shell>
    );
  }
  if (!data || !day || day.exercises.length === 0) {
    return (
      <Shell>
        <p className="text-zinc-300">
          No hay un entrenamiento configurado para hoy.
        </p>
        <Link href="/dashboard" className="mt-4 text-sm font-bold text-[#65ff4f]">
          Volver al inicio
        </Link>
      </Shell>
    );
  }

  return (
    <Session
      day={day}
      programName={data.program.name}
      library={library}
      onFinish={async (feeling, durationSec) => {
        if (!user) return;
        await trainingService.saveResultForUser(user.id, {
          date: new Date().toISOString(),
          dayId: day.id,
          dayName: day.name,
          programName: data.program.name,
          exercises: day.exercises.length,
          durationSec,
          caloriesEst: estimateSessionCalories(durationSec),
          feeling,
        });
        // El dia queda marcado como completado en el programa.
        await trainingService.toggleDayForUser(user.id, day.id, true);
        router.push("/dashboard");
      }}
    />
  );
}

function Session({
  day,
  programName,
  library,
  onFinish,
}: {
  day: TrainingDay;
  programName: string;
  library: Record<string, LibraryExercise>;
  onFinish: (feeling: WorkoutFeeling, durationSec: number) => void;
}) {
  const exercises = day.exercises;
  const [phase, setPhase] = useState<Phase>("prep");
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const startRef = useRef<number>(0);
  const [feeling, setFeeling] = useState<WorkoutFeeling | null>(null);

  const current = exercises[index];
  const detail = current?.exerciseId ? library[current.exerciseId] : undefined;
  const workSec = parseSeconds(detail?.recommendedTime ?? "", WORK_DEFAULT);
  const restSec = parseSeconds(current?.rest ?? "", REST_DEFAULT);

  // Contador previo (3-2-1) y arranque de la sesion. Los cambios de estado se
  // hacen dentro de callbacks async para no violar el rule set-state-in-effect.
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      startRef.current = Date.now();
      const t = setTimeout(() => {
        setIndex(0);
        setRemaining(workSec);
        setPhase("exercise");
        setRunning(true);
      }, 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdown]);

  // Tic del temporizador (ejercicio / descanso).
  useEffect(() => {
    if (!running) return;
    if (phase !== "exercise" && phase !== "rest") return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [running, phase]);

  // Transicion cuando el temporizador llega a 0.
  useEffect(() => {
    if (remaining !== 0) return;
    if (phase !== "exercise" && phase !== "rest") return;
    const t = setTimeout(() => {
      if (phase === "exercise") {
        if (index >= exercises.length - 1) {
          finish();
        } else {
          setPhase("rest");
          setRemaining(restSec);
        }
      } else if (phase === "rest") {
        goToExercise(index + 1);
      }
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, phase]);

  function goToExercise(i: number) {
    const clamped = Math.max(0, Math.min(exercises.length - 1, i));
    const ex = exercises[clamped];
    const d = ex?.exerciseId ? library[ex.exerciseId] : undefined;
    setIndex(clamped);
    setRemaining(parseSeconds(d?.recommendedTime ?? "", WORK_DEFAULT));
    setPhase("exercise");
    setRunning(true);
  }

  function finish() {
    setPhase("summary");
    setRunning(false);
  }

  const elapsedSec = () =>
    startRef.current ? Math.round((Date.now() - startRef.current) / 1000) : 0;

  /* ---------- PREP ---------- */
  if (phase === "prep") {
    return (
      <Shell title={programName} progress={`${exercises.length} ejercicios`}>
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#65ff4f]/30 bg-[#65ff4f]/10 text-[#65ff4f]">
            <Dumbbell size={38} />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
            {day.name}
          </h1>
          <p className="mt-2 text-zinc-400">
            {exercises.length} ejercicios · descansos guiados
          </p>
          <ul className="mx-auto mt-6 max-w-md space-y-2 text-left">
            {exercises.map((ex) => (
              <li
                key={ex.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm"
              >
                <span className="text-[#65ff4f]">
                  <Dumbbell size={16} />
                </span>
                <span className="font-semibold text-white">{ex.name}</span>
                <span className="ml-auto text-zinc-500">
                  {ex.sets} × {ex.reps}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setCountdown(3);
              setPhase("countdown");
            }}
            className="mt-8 inline-flex min-h-14 w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-6 text-base font-black uppercase tracking-wide text-black shadow-[0_10px_40px_-10px_rgba(101,255,79,0.6)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.99]"
          >
            <Play size={20} />
            Comenzar entrenamiento
          </button>
        </div>
      </Shell>
    );
  }

  /* ---------- COUNTDOWN ---------- */
  if (phase === "countdown") {
    return (
      <Shell title={day.name}>
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#65ff4f]">
            Prepárate
          </p>
          <p className="mt-6 text-8xl font-black tabular-nums text-white">
            {countdown === 0 ? "¡Vamos!" : countdown}
          </p>
        </div>
      </Shell>
    );
  }

  /* ---------- REST ---------- */
  if (phase === "rest") {
    const next = exercises[index + 1];
    return (
      <Shell
        title="Descanso"
        progress={`Ejercicio ${index + 2}/${exercises.length}`}
      >
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#65ff4f]">
            Descanso
          </p>
          <p className="mt-4 text-7xl font-black tabular-nums text-white">
            {formatClock(remaining)}
          </p>
          {next ? (
            <p className="mt-4 text-zinc-400">
              Siguiente: <span className="font-bold text-white">{next.name}</span>
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setRemaining((r) => r + 20)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-6 text-sm font-black uppercase tracking-wide text-white transition hover:border-[#65ff4f]/50 hover:bg-[#65ff4f]/10"
            >
              <Plus size={18} />
              +20 s
            </button>
            <button
              type="button"
              onClick={() => goToExercise(index + 1)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-6 text-sm font-black uppercase tracking-wide text-black shadow-[0_8px_30px_-8px_rgba(101,255,79,0.5)] transition hover:-translate-y-0.5 hover:brightness-110"
            >
              <ChevronsRight size={18} />
              Omitir descanso
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  /* ---------- SUMMARY ---------- */
  if (phase === "summary") {
    const dur = elapsedSec();
    return (
      <Shell title="¡Entrenamiento completado!">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#65ff4f]/30 bg-[#65ff4f]/10 text-[#65ff4f]">
            <Trophy size={38} />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight">
            ¡Buen trabajo!
          </h1>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3">
            <Stat label="Duración" value={formatMinutes(dur)} />
            <Stat label="Ejercicios" value={String(exercises.length)} />
            <Stat
              label="Calorías*"
              value={String(estimateSessionCalories(dur))}
            />
          </div>
          <p className="mt-3 text-xs text-zinc-600">
            *Estimación informativa, no es una medición médica.
          </p>

          <p className="mt-8 text-sm font-bold text-zinc-200">
            ¿Cómo se sintió el entrenamiento?
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            {(
              [
                { key: "dificil", label: "Difícil" },
                { key: "adecuado", label: "Adecuado" },
                { key: "facil", label: "Fácil" },
              ] as { key: WorkoutFeeling; label: string }[]
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFeeling(f.key)}
                className={`min-h-12 rounded-xl border px-5 text-sm font-black transition ${
                  feeling === f.key
                    ? "border-[#65ff4f] bg-[#65ff4f]/10 text-[#65ff4f]"
                    : "border-white/10 bg-white/[0.03] text-zinc-200 hover:border-[#65ff4f]/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!feeling}
            onClick={() => feeling && onFinish(feeling, dur)}
            className="mt-8 inline-flex min-h-14 w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-6 text-base font-black uppercase tracking-wide text-black shadow-[0_10px_40px_-10px_rgba(101,255,79,0.6)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 size={20} />
            Guardar y finalizar
          </button>
        </div>
      </Shell>
    );
  }

  /* ---------- EXERCISE ---------- */
  return (
    <Shell
      title={day.name}
      progress={`Ejercicio ${index + 1}/${exercises.length}`}
    >
      <div className="mx-auto max-w-lg">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <Media src={detail?.gif || detail?.image || ""} alt={current.name} />
        </div>
        <h1 className="mt-5 text-center text-3xl font-black tracking-tight">
          {current.name}
        </h1>
        <p className="mt-1 text-center text-zinc-400">
          {current.sets} series × {current.reps}
          {current.rest ? ` · descanso ${current.rest}` : ""}
        </p>
        {current.notes ? (
          <p className="mt-2 text-center text-sm text-zinc-500">
            {current.notes}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-center gap-3 text-[#65ff4f]">
          <Timer size={22} />
          <span className="text-6xl font-black tabular-nums text-white">
            {formatClock(remaining)}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => goToExercise(index - 1)}
            disabled={index === 0}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-bold text-zinc-200 transition hover:border-[#65ff4f]/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft size={18} />
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-white/15"
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
            {running ? "Pausar" : "Reanudar"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (index >= exercises.length - 1) finish();
              else {
                setPhase("rest");
                setRemaining(restSec);
              }
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#85ff73] to-[#65ff4f] px-4 text-sm font-black uppercase tracking-wide text-black transition hover:-translate-y-0.5 hover:brightness-110"
          >
            {index >= exercises.length - 1 ? "Terminar" : "Siguiente"}
            <ArrowRight size={18} />
          </button>
        </div>

        {detail?.video ? (
          <ExerciseVideo url={detail.video} title={current.name} variant="link" />
        ) : null}
      </div>
    </Shell>
  );
}

/* ---------- UI ---------- */
function Shell({
  children,
  title,
  progress,
}: {
  children: React.ReactNode;
  title?: string;
  progress?: string;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-[#050706] text-white">
      <div className="hero-grid flex flex-1 flex-col">
        <nav className="sticky top-0 z-30 border-b border-white/10 bg-black/50 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-bold text-zinc-300 hover:text-[#65ff4f]"
            >
              <X size={18} />
              Salir del modo
            </Link>
            {progress ? (
              <span className="rounded-lg bg-[#65ff4f]/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#65ff4f]">
                {progress}
              </span>
            ) : null}
            <LogoutButton />
          </div>
        </nav>
        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-10 sm:px-8">
          {title ? (
            <p className="mb-6 text-center text-xs font-black uppercase tracking-[0.24em] text-zinc-500">
              {title}
            </p>
          ) : null}
          {children}
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function Media({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(Boolean(src));
  if (!src || !ok) {
    return (
      <div className="flex aspect-video w-full items-center justify-center text-zinc-600">
        <ImageIcon size={40} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="aspect-video w-full object-contain"
      onError={() => setOk(false)}
    />
  );
}
