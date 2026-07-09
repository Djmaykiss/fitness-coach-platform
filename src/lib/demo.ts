/**
 * Interruptor único de CONTENIDO DEMO (Fase 1 · P1 de `PRODUCTION_READINESS_PLAN.md`).
 *
 * Regla permanente: la app es de PRODUCCIÓN. El contenido demo/seed SOLO puede mostrarse
 * en desarrollo local / pruebas internas, y SIEMPRE gateado por este helper. En producción
 * el flag no está definido -> `false` -> nada de demo, solo contenido real del coach o
 * Empty-States profesionales.
 *
 * - Producción: `NEXT_PUBLIC_DEMO_CONTENT` ausente o distinto de `"true"` -> `false`.
 * - Local/dev: poner `NEXT_PUBLIC_DEMO_CONTENT=true` en `.env.local` para ver el demo.
 *
 * SSR-safe: `NEXT_PUBLIC_*` se inyecta en build y funciona igual en servidor y navegador.
 */
export function isDemoContent(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_CONTENT === "true";
}
