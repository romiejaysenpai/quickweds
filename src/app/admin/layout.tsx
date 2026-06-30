'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAdmin, adminChecked, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isVerified = !loading && adminChecked && Boolean(user) && isAdmin;

    useEffect(() => {
        if (loading || !adminChecked) return;

        if (!user) {
            router.replace(`/login?next=${encodeURIComponent(pathname || '/admin')}`);
            return;
        }

        if (!isAdmin) {
            router.replace('/dashboard');
        }
    }, [adminChecked, isAdmin, loading, pathname, router, user]);

    if (!isVerified) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
