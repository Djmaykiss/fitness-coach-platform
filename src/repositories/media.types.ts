import type { CreateMediaAsset, MediaAsset, MediaQuery } from "@/types";

/**
 * Repositorio de METADATA de medios del coach (tabla `media_assets`). Guarda solo la
 * referencia (bucket/path/url) + metadata; el binario lo maneja `storageRepository`.
 * Dual Local/Supabase tras el flag. Las fotos privadas del alumno NO pasan por aquí.
 */
export interface MediaRepository {
  /** Lista (más nuevo primero), con filtro opcional por contexto/dueño. */
  list(query?: MediaQuery): Promise<MediaAsset[]>;
  create(input: CreateMediaAsset): Promise<MediaAsset>;
  /** Borra la fila (soft delete en Supabase). El borrado del binario lo hace el service. */
  remove(id: string): Promise<boolean>;
  /** Deduplicación: busca un asset con el mismo checksum. */
  findByChecksum(checksum: string): Promise<MediaAsset | null>;
}
