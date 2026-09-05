'use client';

import React from 'react';
import AppSidebar from '@/components/dashboard/AppSidebar';

interface DashboardShellProps {
    children: React.ReactNode;
    weddingId?: string;
    weddingTitle?: string;
    weddingSlug?: string | null;
    weddings?: Array<{ id: string; bride_name?: string; groom_name?: string; couple_name?: string; public_slug?: string }>;
    canManageWorkspace?: boolean;
    className?: string;
}

export default function DashboardShell({
    children,
    weddingId,
    weddingTitle,
    weddingSlug,
    weddings = [],
    canManageWorkspace = true,
    className = '',
}: DashboardShellProps) {
    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Left Navigation Sidebar - Hidden on mobile (< md) */}
            <AppSidebar
                weddingId={weddingId}
                weddingTitle={weddingTitle}
                weddingSlug={weddingSlug}
                weddings={weddings}
                canManageWorkspace={canManageWorkspace}
            />

            {/* Main Content Area */}
            <div className={`flex-1 min-w-0 flex flex-col ${className}`}>
                {children}
            </div>
        </div>
    );
}
