import { Metadata } from 'next';
import OperationsWorkspace from '@/components/dashboard/OperationsWorkspace';

export const metadata: Metadata = {
  title: 'Needs Attention Across Weddings | Coordinator | QuickWeds',
  description: 'Operations, failed deliveries, pending RSVPs, and urgent tasks across your active weddings.',
};

export default function CoordinatorPage() {
  return (
    <main className="min-h-screen bg-neutral px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <OperationsWorkspace />
      </div>
    </main>
  );
}
