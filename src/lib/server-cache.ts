import 'server-only';

type CacheEntry<T> = {
    expiresAt: number;
    value: T;
};

const cache = new Map<string, CacheEntry<unknown>>();
const pending = new Map<string, Promise<unknown>>();

export async function getCachedServerValue<T>(
    key: string,
    ttlMs: number,
    loader: () => Promise<T>
): Promise<{ value: T; cacheStatus: 'HIT' | 'MISS' | 'STALE' }> {
    const now = Date.now();
    const entry = cache.get(key) as CacheEntry<T> | undefined;

    if (entry && entry.expiresAt > now) {
        return { value: entry.value, cacheStatus: 'HIT' };
    }

    const existingLoad = pending.get(key) as Promise<T> | undefined;
    if (existingLoad) {
        const value = await existingLoad;
        return { value, cacheStatus: entry ? 'STALE' : 'MISS' };
    }

    const load = loader()
        .then((value) => {
            cache.set(key, {
                expiresAt: Date.now() + ttlMs,
                value,
            });
            return value;
        })
        .finally(() => {
            pending.delete(key);
        });

    pending.set(key, load);

    return {
        value: await load,
        cacheStatus: entry ? 'STALE' : 'MISS',
    };
}

export function clearServerCache(keyPrefix?: string) {
    if (!keyPrefix) {
        cache.clear();
        pending.clear();
        return;
    }

    for (const key of cache.keys()) {
        if (key.startsWith(keyPrefix)) cache.delete(key);
    }

    for (const key of pending.keys()) {
        if (key.startsWith(keyPrefix)) pending.delete(key);
    }
}
