/** Keep a user-initiated send's identity across network errors and explicit retries. */
export function emailOperationId(weddingId: string, kind: string) {
    const key = `quickweds-email-operation:${weddingId}:${kind}`;
    try { const saved = sessionStorage.getItem(key); if (saved) return saved; const id = crypto.randomUUID(); sessionStorage.setItem(key, id); return id; }
    catch { return crypto.randomUUID(); }
}
export function completeEmailOperation(weddingId: string, kind: string) {
    try { sessionStorage.removeItem(`quickweds-email-operation:${weddingId}:${kind}`); } catch { /* Storage can be disabled. */ }
}
