/**
 * Compresión de imágenes en el navegador (sin dependencias). Se ejecuta ANTES de subir:
 * valida el tipo, reescala al lado máximo configurado, re-codifica a WebP (si el
 * navegador lo soporta) o JPEG de alta calidad, genera una miniatura y calcula un
 * checksum SHA-256 para deduplicar. Nunca corre en SSR (solo se invoca desde la UI).
 *
 * Regla del sistema de imágenes: se comprime en frontend y solo se sube el binario
 * optimizado; en las tablas se guarda ruta/URL + metadata, nunca la imagen.
 */

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_IMAGE_EXT = ".jpg,.jpeg,.png,.webp";

export type CompressOptions = {
  /** Lado máximo (px) de la imagen principal. Sin límite de entrada; solo se acota la salida. */
  maxSize?: number;
  /** Lado máximo (px) de la miniatura. */
  thumbSize?: number;
  /** Calidad 0..1 para WebP/JPEG. */
  quality?: number;
};

export type CompressedImage = {
  blob: Blob;
  thumb: Blob;
  width: number;
  height: number;
  size: number;
  mime: string;
  /** SHA-256 hex del blob comprimido (para dedupe). */
  checksum: string;
  /** Extensión de archivo derivada del mime (sin punto). */
  ext: string;
};

const DEFAULTS: Required<CompressOptions> = { maxSize: 2000, thumbSize: 400, quality: 0.82 };

let webpSupport: boolean | null = null;
/** ¿El navegador puede codificar WebP con canvas? (cacheado). */
export function supportsWebp(): boolean {
  if (webpSupport !== null) return webpSupport;
  if (typeof document === "undefined") return false;
  const c = document.createElement("canvas");
  c.width = 1;
  c.height = 1;
  webpSupport = c.toDataURL("image/webp").startsWith("data:image/webp");
  return webpSupport;
}

export function isAcceptedImage(file: File): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type);
}

function extFor(mime: string): string {
  if (mime === "image/webp") return "webp";
  if (mime === "image/png") return "png";
  return "jpg";
}

function scaledDims(w: number, h: number, max: number): { w: number; h: number } {
  if (w <= max && h <= max) return { w, h };
  const ratio = w >= h ? max / w : max / h;
  return { w: Math.round(w * ratio), h: Math.round(h * ratio) };
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo codificar la imagen."))),
      mime,
      quality,
    );
  });
}

async function sha256Hex(blob: Blob): Promise<string> {
  try {
    const buf = await blob.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    // Contextos sin crypto.subtle (p. ej. http): fallback determinista simple.
    return `${blob.size}-${blob.type}`;
  }
}

/** Decodifica el archivo respetando la orientación EXIF cuando el navegador lo permite. */
async function decode(file: File): Promise<{ bitmap: ImageBitmap; w: number; h: number }> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { bitmap, w: bitmap.width, h: bitmap.height };
  } catch {
    // Fallback: <img> + objectURL.
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error("No se pudo leer la imagen."));
        i.src = url;
      });
      const bitmap = await createImageBitmap(img);
      return { bitmap, w: img.naturalWidth, h: img.naturalHeight };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function render(bitmap: ImageBitmap, w: number, h: number, mime: string, quality: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvasToBlob(canvas, mime, quality);
}

/**
 * Comprime `file` y genera su miniatura. Lanza si el tipo no es jpg/png/webp.
 */
export async function compressImage(file: File, opts: CompressOptions = {}): Promise<CompressedImage> {
  if (!isAcceptedImage(file)) {
    throw new Error("Formato no permitido. Usa JPG, PNG o WebP.");
  }
  const o = { ...DEFAULTS, ...opts };
  const mime = supportsWebp() ? "image/webp" : "image/jpeg";

  const { bitmap, w, h } = await decode(file);
  try {
    const main = scaledDims(w, h, o.maxSize);
    const thumbDims = scaledDims(w, h, o.thumbSize);
    const [blob, thumb] = await Promise.all([
      render(bitmap, main.w, main.h, mime, o.quality),
      render(bitmap, thumbDims.w, thumbDims.h, mime, 0.7),
    ]);
    const checksum = await sha256Hex(blob);
    return {
      blob,
      thumb,
      width: main.w,
      height: main.h,
      size: blob.size,
      mime,
      checksum,
      ext: extFor(mime),
    };
  } finally {
    bitmap.close?.();
  }
}
