"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type ToastKind = "success" | "error" | "info";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const KIND_STYLE: Record<
  ToastKind,
  { border: string; icon: ReactNode; bar: string }
> = {
  success: {
    border: "border-[#65ff4f]/40",
    bar: "bg-[#65ff4f]",
    icon: <CheckCircle2 size={18} className="text-[#65ff4f]" />,
  },
  error: {
    border: "border-red-500/50",
    bar: "bg-red-500",
    icon: <AlertTriangle size={18} className="text-red-400" />,
  },
  info: {
    border: "border-white/20",
    bar: "bg-white/60",
    icon: <Info size={18} className="text-zinc-300" />,
  },
};

/**
 * Notificaciones "toast" globales (exito / error / info). Sin dependencias: se
 * apilan arriba a la derecha (full-width en movil), se autocierran y respetan
 * `prefers-reduced-motion` via la clase de animacion en globals.css.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, kind, message }]);
      window.setTimeout(() => remove(id), 3500);
    },
    [remove],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
      info: (m) => push("info", m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-3 top-3 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:items-end"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => {
          const style = KIND_STYLE[t.kind];
          return (
            <div
              key={t.id}
              role="status"
              className={`toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border ${style.border} bg-[#0b0f0d]/95 p-3 pr-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl`}
            >
              <span className="mt-0.5 shrink-0">{style.icon}</span>
              <p className="min-w-0 flex-1 text-sm font-semibold leading-6 text-white">
                {t.message}
              </p>
              <button
                type="button"
                onClick={() => remove(t.id)}
                aria-label="Cerrar notificación"
                className="shrink-0 rounded-md p-1 text-zinc-500 transition hover:text-white"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>.");
  }
  return context;
}
