'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AdminDebugPage() {
    const { user, isAdmin, loading } = useAuth();
    const [apiResult, setApiResult] = useState<any>(null);
    const [envAdmin, setEnvAdmin] = useState<string>('');

    useEffect(() => {
        // Show what env says (client-accessible only)
        setEnvAdmin(process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'not set');

        // Fetch the admin check API directly
        fetch('/api/auth/check-admin')
            .then(res => res.json())
            .then(setApiResult)
            .catch(err => setApiResult({ error: err.message }));
    }, []);

    return (
        <div className="min-h-screen bg-neutral p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-xl">
                <h1 className="text-2xl font-serif font-bold mb-6">Admin Access Debug</h1>

                <div className="space-y-4">
                    <div className="p-4 bg-neutral rounded-xl">
                        <h2 className="font-bold mb-2">Auth Context</h2>
                        <p><strong>User email:</strong> {user?.email || 'not logged in'}</p>
                        <p><strong>isAdmin (from context):</strong> {loading ? 'loading...' : isAdmin ? '✅ true' : '❌ false'}</p>
                    </div>

                    <div className="p-4 bg-neutral rounded-xl">
                        <h2 className="font-bold mb-2">Admin Check API Response</h2>
                        {apiResult ? (
                            <pre className="text-xs overflow-auto bg-white p-2 rounded">{JSON.stringify(apiResult, null, 2)}</pre>
                        ) : (
                            <p className="text-text-secondary">Loading...</p>
                        )}
                    </div>

                    <div className="p-4 bg-neutral rounded-xl">
                        <h2 className="font-bold mb-2">Public Env Vars</h2>
                        <p><strong>NEXT_PUBLIC_ADMIN_EMAIL:</strong> {envAdmin}</p>
                        <p className="text-xs text-text-secondary mt-2">
                            Note: ADMIN_EMAIL (server-only) is not visible here for security.
                        </p>
                    </div>

                    <div className="p-4 bg-accent/10 rounded-xl border border-accent">
                        <h2 className="font-bold mb-2 text-accent">Expected</h2>
                        <p>If you are logged in as <strong>romiejaybacasmas@gmail.com</strong>, the API should return:</p>
                        <code className="block mt-2 p-2 bg-white rounded">{`{ "isAdmin": true }`}</code>
                    </div>
                </div>
            </div>
        </div>
    );
}
