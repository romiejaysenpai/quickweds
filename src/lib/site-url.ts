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
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin.replace(/\/+$/, '')
        : getPublicAppUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `${baseUrl}${normalizedPath}`;
    
    if (process.env.NODE_ENV === 'development') {
        console.log('Redirect URL:', fullUrl);
    }
    
    return fullUrl;
}
