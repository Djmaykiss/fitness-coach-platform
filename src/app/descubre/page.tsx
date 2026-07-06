"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Dumbbell,
  Flame,
  ImageIcon,
  Layers,
  Target,
  Timer,
  Zap,
} from "lucide-react";
import { DashboardShell } from "@/layouts/dashboard-shell";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/context/auth-context";
import { discoverService } from "@/services/discover.service";
import { exerciseLibraryService } from "@/services/exercise-library.service";
import type {
  DiscoverArticle,
  DiscoverCategory,
  DiscoverRoutine,
  LibraryExercise,
} from "@/types";

/** Icono de categoria por nombre (el coach elige el icono desde el panel). */
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  dumbbell: <Dumbbell size={18} />,
  flame: <Flame size={18} />,
  activity: <Activity size={18} />,
  target: <Target size={18} />,
  zap: <Zap size={18} />,
};

function categoryIcon(icon: string) {
  return CATEGORY_ICONS[icon] ?? <Dumbbell size={18} />;
}

export default function DiscoverPage() {
  return (
    <RequireAuth role="client">
      <Discover />
    </RequireAuth>
  );
}

function Discover() {
  const { user } = useAuth();
  const realName =
    user?.firstName && user.firstName !== "Cliente" ? user.firstName : "";

  const [routines, setRoutines] = useState<DiscoverRoutine[]>([]);
  const [categories, setCategories] = useState<DiscoverCategory[]>([]);
  const [articles, setArticles] = useState<DiscoverArticle[]>([]);
  const [library, setLibrary] = useState<LibraryExercise[]>([]);
  const [openCat, setOpenCat] = useState<DiscoverCategory | null>(null);
  const [openArticle, setOpenArticle] = useState<DiscoverArticle | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      discoverService.getPublishedRoutines(),
      discoverService.getPublishedCategories(),
      discoverService.getPublishedArticles(),
      exerciseLibraryService.getExercises(),
    ]).then(([r, c, a, lib]) => {
      if (!active) return;
      setRoutines(r);
      setCategories(c);
      setArticles(a);
      setLibrary(lib);
    });
    return () => {
      active = false;
    };
  }, []);

  const exercisesFor = (cat: DiscoverCategory) =>
    library.filter((e) => cat.muscleGroups.includes(e.muscleGroup));

  return (
    <DashboardShell
      title="Descubre"
      subtitle="Rutinas, categorías y recursos para inspirar tu entrenamiento."
      minimalNav
      navName={realName}
      navHref="/perfil"
    >
      <div className="mb-5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-zinc-200 transition hover:border-[#65ff4f]/50 hover:text-[#65ff4f]"
        >
          <ArrowLeft size={16} /> Volver al panel
        </Link>
      </div>

      {/* Rutinas populares */}
      <Section icon={<Flame size={18} />} title="Rutinas populares">
        <Row>
          {routines.map((r) => (
            <article
              key={r.id}
              className="premium-card w-64 shrink-0 snap-start overflow-hidden rounded-2xl"
            >
              <Media src={r.image} alt={r.name} />
              <div className="p-4">
                <span className="text-xs font-black uppercase tracking-wide text-[#65ff4f]">
                  {r.category}
                </span>
                <h3 className="mt-1 text-lg font-black">{r.name}</h3>
                {r.description ? (
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    {r.description}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                  <Chip>{r.level}</Chip>
                  <Chip>
                    <Timer size={11} /> {r.minutes}
                  </Chip>
                  <Chip>{r.duration}</Chip>
                </div>
              </div>
            </article>
          ))}
        </Row>
      </Section>

      {/* Categorias por zona */}
      <Section icon={<Layers size={18} />} title="Categorías por zona">
        <Row>
          {categories.map((c) => {
            const count = exercisesFor(c).length;
            const active = openCat?.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setOpenCat(active ? null : c)}
                className={`w-52 shrink-0 snap-start rounded-2xl border p-5 text-left transition ${
                  active
                    ? "border-[#65ff4f] bg-[#65ff4f]/10"
                    : "border-white/10 bg-white/[0.03] hover:border-[#65ff4f]/40"
                }`}
              >
                <span className="inline-flex rounded-xl border border-[#65ff4f]/20 bg-[#65ff4f]/10 p-2 text-[#65ff4f]">
                  {categoryIcon(c.icon)}
                </span>
                <h3 className="mt-3 font-black">{c.label}</h3>
                <p className="mt-1 text-xs text-zinc-400">{c.description}</p>
                <p className="mt-3 text-xs font-bold text-[#65ff4f]">
                  {count} ejercicios
                </p>
              </button>
            );
          })}
        </Row>

        {openCat ? (
          <div className="premium-card mt-4 rounded-2xl p-5">
            <h3 className="text-lg font-black">
              {openCat.label}{" "}
              <span className="text-sm font-bold text-zinc-500">
                · {exercisesFor(openCat).length} ejercicios
              </span>
            </h3>
            {exercisesFor(openCat).length === 0 ? (
              <p className="mt-2 text-sm text-zinc-400">
                Aún no hay ejercicios de esta zona en la biblioteca.
              </p>
            ) : (
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {exercisesFor(openCat).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm"
                  >
                    <Dumbbell size={14} className="text-[#65ff4f]" />
                    <span className="font-semibold text-white">{e.name}</span>
                    <span className="ml-auto text-xs text-zinc-500">
                      {e.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </Section>

      {/* Articulos */}
      <Section icon={<BookOpen size={18} />} title="Artículos y recursos">
        <Row>
          {articles.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() =>
                setOpenArticle(openArticle?.id === a.id ? null : a)
              }
              className="w-72 shrink-0 snap-start rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-[#65ff4f]/40"
            >
              <span className="text-xs font-black uppercase tracking-wide text-[#65ff4f]">
                {a.category} · {a.readTime}
              </span>
              <h3 className="mt-2 font-black leading-snug">{a.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">
                {a.content}
              </p>
            </button>
          ))}
        </Row>

        {openArticle ? (
          <div className="premium-card mt-4 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wide text-[#65ff4f]">
                  {openArticle.category} · {openArticle.readTime}
                </span>
                <h3 className="mt-1 text-lg font-black">{openArticle.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenArticle(null)}
                className="text-sm font-bold text-zinc-500 hover:text-[#65ff4f]"
              >
                Cerrar
              </button>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-300">
              {openArticle.content}
            </p>
            <p className="mt-3 text-xs text-zinc-600">
              Contenido educativo de tu coach.
            </p>
          </div>
        ) : null}
      </Section>
    </DashboardShell>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-black tracking-tight sm:text-2xl">
        <span className="text-[#65ff4f]">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
      {children}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-zinc-300">
      {children}
    </span>
  );
}

function Media({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(Boolean(src));
  if (!src || !ok) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center bg-white/[0.04] text-zinc-600">
        <ImageIcon size={28} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="aspect-[16/9] w-full object-cover"
      onError={() => setOk(false)}
    />
  );
}
