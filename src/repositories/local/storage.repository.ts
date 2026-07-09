import type { StorageRepository, StorageRef, UploadInput } from "@/repositories/storage.types";

/**
 * LocalStorageRepository — modo local/offline. Guarda el BLOB en IndexedDB (no en
 * localStorage, que tiene ~5 MB) y devuelve un dataURL como `url` para mostrarlo
 * directamente en `<img>` y persistirlo como string en la referencia. Paridad de
 * interfaz con el de Supabase; rollback por flag.
 */

const DB_NAME = "coach-fitness-media";
const STORE = "blobs";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB no disponible."));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("No se pudo abrir IndexedDB."));
  });
}

async function idbPut(key: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function idbDelete(key: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export class LocalStorageRepository implements StorageRepository {
  async upload(input: UploadInput): Promise<StorageRef> {
    const key = `${input.bucket}/${input.path}`;
    // Guardar el blob en IndexedDB (best-effort; no bloquea la subida si falla).
    try {
      await idbPut(key, input.blob);
    } catch {
      /* offline sin IndexedDB: seguimos con el dataURL */
    }
    input.onProgress?.(100);
    const url = await blobToDataUrl(input.blob);
    return { bucket: input.bucket, path: input.path, url };
  }

  async remove(bucket: string, paths: string[]): Promise<void> {
    await Promise.all(
      paths.map((p) => idbDelete(`${bucket}/${p}`).catch(() => {})),
    );
  }

  getPublicUrl(): string {
    // En local la URL utilizable es el dataURL devuelto por `upload`.
    return "";
  }

  async createSignedUrl(): Promise<string> {
    return "";
  }
}
