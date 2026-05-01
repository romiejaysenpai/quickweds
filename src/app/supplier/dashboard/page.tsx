import type { Metadata } from 'next';
import SupplierProfileDashboard from '@/components/suppliers/SupplierProfileDashboard';

export const metadata: Metadata = {
  title: 'Supplier Dashboard | QuickWeds',
  description: 'Create, edit, and submit your QuickWeds supplier directory profile.',
};

export default function SupplierDashboardPage() {
  return <SupplierProfileDashboard />;
}
