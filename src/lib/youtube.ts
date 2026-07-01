/**
 * Utilidades para los enlaces de video del ejercicio.
 *
 * El coach puede pegar un enlace de YouTube en cualquiera de sus formatos
 * habituales (incluye enlaces NO LISTADOS, que se reproducen igual que uno
 * público). Convertimos ese enlace a una URL de inserción (`/embed/ID`) para
 * mostrarlo dentro de la ficha del ejercicio; si no es de YouTube, la UI cae al
 * comportamiento de abrir el enlace en una pestaña nueva.
 *
 * Nota: los videos realmente PRIVADOS de YouTube no se pueden reproducir fuera de
 * la cuenta del dueño; para compartir demostraciones usa "No listado".
 */

/** Extrae el ID de un video de YouTube desde los formatos comunes. Null si no aplica. */
export function youtubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  // Formatos: youtu.be/ID, youtube.com/watch?v=ID, /embed/ID, /shorts/ID, /live/ID
  const patterns = [
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/,
  ];
  for (const re of patterns) {
    const match = trimmed.match(re);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** URL de inserción de YouTube (`/embed/ID`) o null si el enlace no es de YouTube. */
export function youtubeEmbedUrl(url: string): string | null {
  const id = youtubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
