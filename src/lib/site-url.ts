export function getPublicAppUrl() {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

    if (envUrl) {
        return envUrl.replace(/\/+$/, '');
    }

    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    return 'http://localhost:3000';
}

export function getPublicRedirectUrl(path: string) {
    const baseUrl = getPublicAppUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${normalizedPath}`;
}
