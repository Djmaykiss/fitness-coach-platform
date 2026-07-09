/**
 * Interfaz de la capa de STORAGE (binarios). Dual Local/Supabase tras el flag, misma
 * forma que el resto de repositorios del proyecto. La UI/servicios nunca hablan con
 * Storage directamente: pasan por `storageService` -> `storageRepository`.
 */

/** Referencia persistible de un objeto subido (lo que se guarda en tablas + metadata). */
export type StorageRef = {
  bucket: string;
  path: string;
  url: string;
};

export type UploadInput = {
  bucket: string;
  /** Ruta completa del objeto dentro del bucket. */
  path: string;
  blob: Blob;
  contentType: string;
  /** Cache-Control para el objeto (Fase 3). */
  cacheControl?: string;
  /** Progreso 0..100. */
  onProgress?: (pct: number) => void;
  /** Para cancelar/reintentar. */
  signal?: AbortSignal;
};

export interface StorageRepository {
  /** Sube el binario y devuelve su referencia (con URL utilizable). */
  upload(input: UploadInput): Promise<StorageRef>;
  /** Elimina uno o varios objetos de un bucket. */
  remove(bucket: string, paths: string[]): Promise<void>;
  /** URL pública (buckets públicos). */
  getPublicUrl(bucket: string, path: string): string;
  /** URL firmada temporal (buckets privados). */
  createSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<string>;
}
