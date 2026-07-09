/**
 * Buckets de Supabase Storage usados por el sistema de imágenes. Se REUSAN los buckets
 * por dominio ya definidos (migraciones 0004/0007) y se AGREGAN los faltantes
 * (`transformation-images`, `content-media`) en la migración 0020. Ningún bucket único:
 * la separación por dominio conserva la RLS ya endurecida.
 */

export const BUCKETS = {
  logos: "logos",
  exerciseImages: "exercise-images",
  discoverImages: "discover-images",
  nutritionImages: "nutrition-images",
  transformationImages: "transformation-images",
  contentMedia: "content-media",
  progressPhotos: "progress-photos",
} as const;

export type BucketId = (typeof BUCKETS)[keyof typeof BUCKETS];

/** Buckets de lectura pública (URL pública directa). El resto es privado (signed URL). */
export const PUBLIC_BUCKETS: ReadonlySet<string> = new Set<string>([
  BUCKETS.logos,
  BUCKETS.exerciseImages,
  BUCKETS.discoverImages,
  BUCKETS.nutritionImages,
  BUCKETS.transformationImages,
  BUCKETS.contentMedia,
]);

export function isPublicBucket(bucket: string): boolean {
  return PUBLIC_BUCKETS.has(bucket);
}
