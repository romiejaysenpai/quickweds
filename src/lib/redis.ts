import 'server-only';

import { Redis } from '@upstash/redis';

let cachedRedis: Redis | null | undefined;

export function getRedisClient() {
    if (cachedRedis !== undefined) return cachedRedis;

    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        if (process.env.NODE_ENV === 'production') {
            console.warn('Upstash Redis env vars are missing; Redis-backed features will use fallbacks where possible.');
        }
        cachedRedis = null;
        return cachedRedis;
    }

    cachedRedis = Redis.fromEnv();
    return cachedRedis;
}

export function isRedisConfigured() {
    return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function logRedisFailure(action: string, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[redis] ${action} failed: ${message}`);
}

export async function redisJsonGet<T>(key: string): Promise<T | null> {
    const redis = getRedisClient();
    if (!redis) return null;

    try {
        return await redis.get<T>(key);
    } catch (error) {
        logRedisFailure(`get ${key}`, error);
        return null;
    }
}

export async function redisJsonSet(key: string, value: unknown, ttlSeconds: number) {
    const redis = getRedisClient();
    if (!redis) return false;

    try {
        await redis.set(key, value, { ex: ttlSeconds });
        return true;
    } catch (error) {
        logRedisFailure(`set ${key}`, error);
        return false;
    }
}

export async function redisDel(...keys: string[]) {
    const redis = getRedisClient();
    if (!redis || keys.length === 0) return false;

    try {
        await redis.del(...keys);
        return true;
    } catch (error) {
        logRedisFailure(`del ${keys.join(',')}`, error);
        return false;
    }
}

export async function redisSetNxEx(key: string, value: string, ttlSeconds: number) {
    const redis = getRedisClient();
    if (!redis) return null;

    try {
        const result = await redis.set(key, value, { nx: true, ex: ttlSeconds });
        return result === 'OK';
    } catch (error) {
        logRedisFailure(`set nx ${key}`, error);
        return null;
    }
}
