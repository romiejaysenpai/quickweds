'use client';

import { supabase } from '@/lib/supabase';
import { getCachedSession } from '@/lib/session-cache';

export type AuthenticatedUploadPurpose =
    | 'builder-media'
    | 'supplier-logo'
    | 'supplier-gallery'
    | 'planner-food-reference';

type UploadOptions = {
    purpose: AuthenticatedUploadPurpose;
    file: File;
    weddingId?: string;
    accessToken?: string;
};

type PreparedUpload = {
    bucket: string;
    path: string;
    token: string;
    publicUrl: string;
    contentType: string;
};

function getErrorMessage(payload: unknown, fallback: string) {
    if (payload && typeof payload === 'object' && 'error' in payload) {
        const message = String((payload as { error?: unknown }).error || '').trim();
        if (message) return message;
    }
    return fallback;
}

/**
 * Upload a file only after the server has authenticated and authorized a
 * single, scoped Storage object. The browser never receives broad bucket
 * write permission or chooses the final object path.
 */
export async function uploadAuthenticatedFile({ purpose, file, weddingId, accessToken }: UploadOptions) {
    let token = accessToken;
    if (!token) {
        const { data } = await getCachedSession();
        token = data.session?.access_token;
    }

    if (!token) {
        throw new Error('Please sign in again before uploading a file.');
    }

    const response = await fetch('/api/uploads/prepare', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            purpose,
            weddingId,
            file: {
                name: file.name,
                type: file.type,
                size: file.size,
            },
        }),
    });
    const payload = await response.json().catch(() => null) as PreparedUpload | { error?: unknown } | null;
    if (!response.ok || !payload || !('token' in payload)) {
        throw new Error(getErrorMessage(payload, 'Unable to prepare this upload. Please try again.'));
    }

    const { error } = await supabase.storage
        .from(payload.bucket)
        .uploadToSignedUrl(payload.path, payload.token, file, {
            upsert: false,
            contentType: payload.contentType,
            cacheControl: '3600',
        });

    if (error) {
        throw error;
    }

    return payload.publicUrl;
}
