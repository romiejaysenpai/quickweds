import LoadingState from '@/components/ui/LoadingState';

export default function BuilderLoading() {
    return (
        <main className="mobile-safe-screen flex items-center justify-center bg-neutral px-4 py-6">
            <LoadingState
                label="Preparing your builder…"
                description="Your wedding workspace is on its way."
                className="max-w-lg"
            />
        </main>
    );
}
