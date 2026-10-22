/** IndexedDB preserves selected File objects without converting large media to localStorage strings. */
export type BuilderDraftSnapshot = {
  legacyImport?: boolean;
  formData: Record<string, unknown>;
  currentStep: number;
  updatedAt: string;
  mediaFiles: Record<string, File | File[] | null>;
  previews: Record<string, string | string[]>;
};
export function builderDraftKey(userId: string, weddingId?: string | null) {
  return `v1:${userId}:${weddingId || "new"}`;
}
async function openDrafts() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("quickweds-builder-drafts", 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("drafts"))
        request.result.createObjectStore("drafts");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function transact<T>(
  key: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  const db = await openDrafts();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction("drafts", mode);
      const request = action(tx.objectStore("drafts"));
      tx.oncomplete = () => resolve(request.result as T);
      tx.onabort = () =>
        reject(tx.error || new Error("Draft storage was interrupted"));
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export const loadBuilderDraft = (key: string) =>
  transact<BuilderDraftSnapshot | undefined>(key, "readonly", (store) =>
    store.get(key),
  );
export const saveBuilderDraft = (key: string, value: BuilderDraftSnapshot) =>
  transact(key, "readwrite", (store) => store.put(value, key));
export const deleteBuilderDraft = (key: string) =>
  transact(key, "readwrite", (store) => store.delete(key));

/** Old drafts had no account ownership or recoverable File objects. Offer manual import only. */
export function readLegacyBuilderDraft(
  raw: string | null,
  mediaFiles: BuilderDraftSnapshot["mediaFiles"],
  previews: BuilderDraftSnapshot["previews"],
): BuilderDraftSnapshot | undefined {
  try {
    const value = raw ? JSON.parse(raw) : null;
    if (
      !value?.formData ||
      typeof value.formData !== "object" ||
      Array.isArray(value.formData)
    )
      return undefined;
    return {
      legacyImport: true,
      formData: value.formData,
      currentStep: Number.isInteger(value.currentStep)
        ? Math.max(0, Math.min(9, value.currentStep))
        : 0,
      updatedAt: Number.isFinite(Date.parse(value.updatedAt))
        ? value.updatedAt
        : new Date().toISOString(),
      mediaFiles,
      previews,
    };
  } catch {
    return undefined;
  }
}
