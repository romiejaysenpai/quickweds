import type { Metadata } from 'next';
import SupplierDirectoryClient from '@/components/suppliers/SupplierDirectoryClient';
import { supabase } from '@/lib/supabase';
import type { SupplierProfile } from '@/lib/suppliers';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Wedding Supplier Directory | QuickWeds',
  description: 'Browse trusted Philippines wedding suppliers for venues, catering, photography, coordination, styling, and more.',
  alternates: {
    canonical: '/suppliers',
  },
};

async function getApprovedSuppliers() {
  try {
    const { data, error } = await supabase
      .from('supplier_profiles')
      .select('*')
      .eq('status', 'approved')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('business_name', { ascending: true });

    if (error) {
      console.warn('Unable to load suppliers:', error.message);
      return [];
    }

    return (data || []) as SupplierProfile[];
  } catch (error) {
    console.warn('Unable to load suppliers:', error);
    return [];
  }
}

export default async function SuppliersPage() {
  const suppliers = await getApprovedSuppliers();

  return <SupplierDirectoryClient suppliers={suppliers} />;
}
