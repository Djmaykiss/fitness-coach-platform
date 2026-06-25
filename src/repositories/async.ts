/**
 * Simula una operacion asincrona (como lo seria una llamada a Supabase).
 * Devolver el valor envuelto en una promesa permite que toda la app ya
 * trabaje con `await`, asi la migracion futura no cambia las firmas.
 */
export function resolveMock<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}
