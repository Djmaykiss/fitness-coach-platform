import { mediaRepository } from "@/repositories";
import { storageService } from "@/services/storage.service";
import type { MediaAsset, MediaQuery } from "@/types";

/**
 * mediaService — API de alto nivel de la BIBLIOTECA MULTIMEDIA del coach. Combina la
 * subida (compresión + Storage via `storageService`) con la persistencia de metadata en
 * `media_assets` (via `mediaRepository`), con deduplicación por checksum y borrado seguro
 * (Storage + fila). Funciona en Local y Supabase según el flag. Es para CONTENIDO del
 * coach; las fotos privadas del alumno tienen su propio flujo (progress/transformation).
 */

export type UploadAndSaveOptions = {
  /** Org destino: primera carpeta del path (requisito de la RLS de Storage). */
  orgId: string;
  bucket: string;
  /** exercise | plan | transformation | article | resource | cover | gallery | library */
  context: string;
  ownerKind?: string;
  ownerId?: string;
  title?: string;
  onProgress?: (pct: number) => void;
};

export const mediaService = {
  list: (query?: MediaQuery) => mediaRepository.list(query),
  findByChecksum: (checksum: string) => mediaRepository.findByChecksum(checksum),

  /**
   * Sube (comprime) la imagen y guarda su metadata. Deduplica: si ya existe un asset con
   * el mismo checksum, borra el binario recién subido y devuelve el existente.
   */
  async uploadAndSave(file: File, opts: UploadAndSaveOptions): Promise<MediaAsset> {
    const ownerSeg = opts.ownerId || "general";
    const uploaded = await storageService.uploadImage(file, {
      bucket: opts.bucket,
      pathPrefix: `${opts.orgId}/${opts.context}/${ownerSeg}`,
      onProgress: opts.onProgress,
    });

    const dup = await mediaRepository.findByChecksum(uploaded.checksum);
    if (dup) {
      await storageService
        .remove(opts.bucket, [uploaded.main.path, uploaded.thumb.path])
        .catch(() => {});
      return dup;
    }

    return mediaRepository.create({
      kind: "image",
      bucket: uploaded.main.bucket,
      path: uploaded.main.path,
      url: uploaded.main.url,
      thumbPath: uploaded.thumb.path,
      thumbUrl: uploaded.thumb.url,
      mime: uploaded.mime,
      width: uploaded.width,
      height: uploaded.height,
      size: uploaded.size,
      checksum: uploaded.checksum,
      title: opts.title ?? "",
      context: opts.context,
      ownerKind: opts.ownerKind ?? "",
      ownerId: opts.ownerId ?? "",
      metadata: {},
    });
  },

  /** Borra el asset: quita imagen + miniatura de Storage y la fila de metadata. */
  async remove(asset: MediaAsset): Promise<boolean> {
    await storageService
      .remove(asset.bucket, [asset.path, asset.thumbPath].filter(Boolean))
      .catch(() => {});
    return mediaRepository.remove(asset.id);
  },
};
