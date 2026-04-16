'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            // Supabase handles the code exchange automatically when it sees the session
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Auth callback error:', error);
                router.push('/login?error=auth-callback-failed');
                return;
            }

            if (data?.session) {
                // Check if user is new or returning if needed
                router.push('/dashboard');
            } else {
                // If no session is found, redirect to login
                router.push('/login');
            }
        };

        void handleCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-text-secondary font-serif italic">Completing secure sign in...</p>
        </div>
    );
}
