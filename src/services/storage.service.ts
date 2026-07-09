import { compressImage, type CompressOptions } from "@/lib/image-compress";
import { storageRepository } from "@/repositories";
import type { StorageRef } from "@/repositories/storage.types";

/**
 * storageService — orquesta el flujo de subida de una imagen: comprime en el navegador,
 * genera miniatura y sube ambos binarios via `storageRepository` (Local o Supabase según
 * el flag). Devuelve las referencias + metadata para que la capa de dominio guarde solo
 * ruta/URL + metadata (nunca el binario). La UI usa esto a través de `<ImageUploader>`.
 */

export type UploadedImage = {
  main: StorageRef;
  thumb: StorageRef;
  width: number;
  height: number;
  size: number;
  mime: string;
  checksum: string;
  ext: string;
};

export type UploadImageOptions = {
  bucket: string;
  /** Prefijo de ruta dentro del bucket, p. ej. `{org}/{context}/{ownerId}`. */
  pathPrefix: string;
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
  compress?: CompressOptions;
};

function newAssetId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export const storageService = {
  /** Comprime + sube imagen principal y miniatura; devuelve refs + metadata. */
  async uploadImage(file: File, opts: UploadImageOptions): Promise<UploadedImage> {
    const c = await compressImage(file, opts.compress);
    const assetId = newAssetId();
    const base = `${opts.pathPrefix.replace(/\/+$/, "")}/${assetId}`;

    // El progreso reportado corresponde a la imagen principal (la miniatura es pequeña).
    const main = await storageRepository.upload({
      bucket: opts.bucket,
      path: `${base}.${c.ext}`,
      blob: c.blob,
      contentType: c.mime,
      onProgress: (p) => opts.onProgress?.(Math.min(99, Math.round(p * 0.98))),
      signal: opts.signal,
    });
    const thumb = await storageRepository.upload({
      bucket: opts.bucket,
      path: `${base}_thumb.${c.ext}`,
      blob: c.thumb,
      contentType: c.mime,
      signal: opts.signal,
    });
    opts.onProgress?.(100);

    return {
      main,
      thumb,
      width: c.width,
      height: c.height,
      size: c.size,
      mime: c.mime,
      checksum: c.checksum,
      ext: c.ext,
    };
  },

  /** Borra objetos (imagen + miniatura) de un bucket. */
  remove(bucket: string, paths: string[]): Promise<void> {
    return storageRepository.remove(bucket, paths.filter(Boolean));
  },
};
