"use client";

import { useCallback, useId, useRef, useState } from "react";
import { UploadCloud, X, RefreshCw, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { storageService, type UploadedImage } from "@/services/storage.service";
import { mediaService } from "@/services/media.service";
import { isAcceptedImage, ACCEPTED_IMAGE_EXT } from "@/lib/image-compress";
import type { MediaAsset } from "@/types";

/**
 * <ImageUploader> — componente reutilizable de subida de imágenes. Drag & drop + selector,
 * preview inmediato, compresión + subida via `storageService` (Local o Supabase según el
 * flag), barra de progreso por archivo y reintento si falla. Responsive y accesible.
 * Es 100% presentación de la infraestructura: no conoce la entidad de destino; el padre
 * recibe el resultado (`onUploaded`) y persiste la referencia donde corresponda.
 */

type Status = "uploading" | "done" | "error";

type Item = {
  id: string;
  file: File;
  previewUrl: string;
  status: Status;
  progress: number;
  error?: string;
  result?: UploadedImage;
};

export type ImageUploaderProps = {
  bucket: string;
  pathPrefix: string;
  multiple?: boolean;
  /** Se llama por cada imagen subida con éxito (subida SOLO a Storage). */
  onUploaded?: (image: UploadedImage) => void;
  /**
   * Media Manager: si se pasa `mediaContext` + `orgId`, la subida se registra en
   * `media_assets` (via `mediaService.uploadAndSave`) y devuelve el `MediaAsset` por
   * `onMediaSaved`. `pathPrefix` se ignora (lo arma el service `{org}/{context}/…`).
   */
  mediaContext?: string;
  mediaOwnerKind?: string;
  orgId?: string;
  onMediaSaved?: (asset: MediaAsset) => void;
  /** Texto guía dentro de la zona de arrastre. */
  hint?: string;
  className?: string;
};

let uid = 0;
const nextId = () => `up-${Date.now()}-${uid++}`;

export function ImageUploader({
  bucket,
  pathPrefix,
  multiple = false,
  onUploaded,
  mediaContext,
  mediaOwnerKind,
  orgId,
  onMediaSaved,
  hint,
  className,
}: ImageUploaderProps) {
  const inputId = useId();
  const [items, setItems] = useState<Item[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const abortRef = useRef<Map<string, AbortController>>(new Map());

  const patch = (id: string, p: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...p } : it)));

  const startUpload = useCallback(
    async (item: Item) => {
      const controller = new AbortController();
      abortRef.current.set(item.id, controller);
      patch(item.id, { status: "uploading", progress: 0, error: undefined });
      try {
        if (mediaContext && orgId) {
          // Media Manager: sube + registra la fila en media_assets.
          const asset = await mediaService.uploadAndSave(item.file, {
            orgId,
            bucket,
            context: mediaContext,
            ownerKind: mediaOwnerKind ?? "",
            onProgress: (pct) => patch(item.id, { progress: pct }),
          });
          patch(item.id, { status: "done", progress: 100 });
          onMediaSaved?.(asset);
        } else {
          const result = await storageService.uploadImage(item.file, {
            bucket,
            pathPrefix,
            signal: controller.signal,
            onProgress: (pct) => patch(item.id, { progress: pct }),
          });
          patch(item.id, { status: "done", progress: 100, result });
          onUploaded?.(result);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo subir la imagen.";
        patch(item.id, { status: "error", error: message });
      } finally {
        abortRef.current.delete(item.id);
      }
    },
    [bucket, pathPrefix, mediaContext, mediaOwnerKind, orgId, onUploaded, onMediaSaved],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      const accepted = list.filter(isAcceptedImage);
      const rejected = list.length - accepted.length;
      const toAdd = multiple ? accepted : accepted.slice(0, 1);

      const newItems: Item[] = toAdd.map((file) => ({
        id: nextId(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "uploading",
        progress: 0,
      }));

      if (rejected > 0 && accepted.length === 0) {
        setItems((prev) => [
          ...(multiple ? prev : []),
          {
            id: nextId(),
            file: list[0],
            previewUrl: "",
            status: "error",
            progress: 0,
            error: "Formato no permitido. Usa JPG, PNG o WebP.",
          },
        ]);
        return;
      }

      setItems((prev) => (multiple ? [...prev, ...newItems] : newItems));
      newItems.forEach((it) => void startUpload(it));
    },
    [multiple, startUpload],
  );

  const removeItem = (id: string) => {
    abortRef.current.get(id)?.abort();
    abortRef.current.delete(id);
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it?.previewUrl) URL.revokeObjectURL(it.previewUrl);
      if (it?.result) {
        void storageService
          .remove(bucket, [it.result.main.path, it.result.thumb.path])
          .catch(() => {});
      }
      return prev.filter((x) => x.id !== id);
    });
  };

  return (
    <div className={className}>
      {/* Zona de arrastre / selector */}
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center transition ${
          dragOver
            ? "border-[#65ff4f] bg-[#65ff4f]/10"
            : "border-white/15 bg-white/[0.03] hover:border-[#65ff4f]/50 hover:bg-white/[0.05]"
        }`}
      >
        <UploadCloud className="text-[#65ff4f]" size={26} />
        <span className="text-sm font-bold text-zinc-200">
          Arrastra una imagen o haz clic para subir
        </span>
        <span className="text-xs text-zinc-500">{hint ?? "JPG, PNG o WebP · se optimiza automáticamente"}</span>
        <input
          id={inputId}
          type="file"
          accept={ACCEPTED_IMAGE_EXT}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {/* Previews + progreso */}
      {items.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it) => (
            <li
              key={it.id}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40"
            >
              <div className="relative flex aspect-square items-center justify-center bg-white/[0.02]">
                {it.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="text-zinc-600" size={28} />
                )}

                {it.status === "uploading" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-end bg-black/40 p-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-[#65ff4f] transition-[width] duration-200"
                        style={{ width: `${it.progress}%` }}
                      />
                    </div>
                    <span className="mt-1 text-[11px] font-bold text-white">{it.progress}%</span>
                  </div>
                ) : null}

                {it.status === "done" ? (
                  <span className="absolute left-2 top-2 rounded-full bg-black/60 p-1 text-[#65ff4f]">
                    <CheckCircle2 size={16} />
                  </span>
                ) : null}

                {it.status === "error" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 p-2 text-center">
                    <AlertCircle className="text-red-400" size={20} />
                    <span className="text-[11px] leading-tight text-red-200">{it.error}</span>
                    {it.previewUrl ? (
                      <button
                        type="button"
                        onClick={() => startUpload(it)}
                        className="mt-1 inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[11px] font-bold text-zinc-100 hover:bg-white/20"
                      >
                        <RefreshCw size={12} /> Reintentar
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                aria-label="Quitar"
                onClick={() => removeItem(it.id)}
                className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-zinc-200 transition hover:bg-black/80 hover:text-white"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
