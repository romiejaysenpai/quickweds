'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, adminChecked, loading } = useAuth();
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (!loading && adminChecked) {
            if (!user || !isAdmin) {
                router.replace('/dashboard');
            } else {
                setIsVerified(true);
            }
        }
    }, [loading, adminChecked, user, isAdmin, router]);

    if (!isVerified) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
