import type { StorageRepository, StorageRef, UploadInput } from "@/repositories/storage.types";
import { getSupabaseClient } from "@/lib/supabase";
import { isPublicBucket } from "@/lib/storage-buckets";

/**
 * SupabaseStorageRepository — sube a Supabase Storage con el protocolo RESUMIBLE (tus),
 * lo que da barra de progreso real y reintento robusto (requisito del sistema
 * profesional). URL: pública para buckets públicos; firmada para privados.
 *
 * El endpoint resumible de Supabase es `${url}/storage/v1/upload/resumable`; requiere el
 * access token de la sesión (o la anon key), `chunkSize` de 6 MB y metadata
 * `bucketName/objectName/contentType/cacheControl`.
 */

const CHUNK_SIZE = 6 * 1024 * 1024; // 6 MB (requerido por el endpoint tus de Supabase)

export class SupabaseStorageRepository implements StorageRepository {
  private sb() {
    return getSupabaseClient();
  }

  private async accessToken(): Promise<string> {
    const { data } = await this.sb().auth.getSession();
    return data.session?.access_token ?? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string);
  }

  async upload(input: UploadInput): Promise<StorageRef> {
    const tus = await import("tus-js-client"); // carga solo en el navegador
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const token = await this.accessToken();

    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(input.blob, {
        endpoint: `${url}/storage/v1/upload/resumable`,
        retryDelays: [0, 1000, 3000, 5000],
        headers: {
          authorization: `Bearer ${token}`,
          "x-upsert": "true",
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: CHUNK_SIZE,
        metadata: {
          bucketName: input.bucket,
          objectName: input.path,
          contentType: input.contentType,
          cacheControl: String(input.cacheControl ?? 3600),
        },
        onError: (err) => reject(err),
        onProgress: (sent, total) => {
          if (total > 0) input.onProgress?.(Math.round((sent / total) * 100));
        },
        onSuccess: () => resolve(),
      });

      // Reintento sobre subidas previas incompletas (resumible).
      upload.findPreviousUploads().then((prev) => {
        if (prev.length > 0) upload.resumeFromPreviousUpload(prev[0]);
        upload.start();
      });

      if (input.signal) {
        input.signal.addEventListener("abort", () => {
          upload.abort().catch(() => {});
          reject(new DOMException("Subida cancelada", "AbortError"));
        });
      }
    });

    const finalUrl = isPublicBucket(input.bucket)
      ? this.getPublicUrl(input.bucket, input.path)
      : await this.createSignedUrl(input.bucket, input.path);

    return { bucket: input.bucket, path: input.path, url: finalUrl };
  }

  async remove(bucket: string, paths: string[]): Promise<void> {
    const { error } = await this.sb().storage.from(bucket).remove(paths);
    if (error) throw new Error(error.message);
  }

  getPublicUrl(bucket: string, path: string): string {
    return this.sb().storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }

  async createSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
    const { data, error } = await this.sb().storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) throw new Error(error.message);
    return data.signedUrl;
  }
}
