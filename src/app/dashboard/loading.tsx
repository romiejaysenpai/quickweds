import LoadingState from '@/components/ui/LoadingState';

export default function DashboardLoading() {
    return (
        <main className="mobile-safe-screen flex items-center justify-center bg-background px-4 py-6">
            <LoadingState
                label="Loading your wedding workspace…"
                description="Bringing your plans and guest details together."
                className="max-w-lg"
            />
        </main>
    );
}
