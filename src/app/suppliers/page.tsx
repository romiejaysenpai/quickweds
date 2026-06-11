import type { Metadata } from 'next';
import SupplierDirectoryClient from '@/components/suppliers/SupplierDirectoryClient';
import { getCachedServerValue } from '@/lib/server-cache';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import type { SupplierProfile } from '@/lib/suppliers';

export const revalidate = 300;

const SUPPLIERS_CACHE_TTL_MS = 5 * 60 * 1000;

export const metadata: Metadata = {
  title: 'Wedding Supplier Directory | QuickWeds',
  description: 'Browse trusted Philippines wedding suppliers for venues, catering, photography, coordination, styling, and more.',
  alternates: {
    canonical: '/suppliers',
  },
};

async function getApprovedSuppliers() {
  const { value } = await getCachedServerValue<SupplierProfile[]>(
    'supplier_profiles:approved:active',
    SUPPLIERS_CACHE_TTL_MS,
    async () => {
      const db = getSupabaseAdminClient() as any;
      const { data, error } = await db
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
    }
  );

  return value;
}

export default async function SuppliersPage() {
  const suppliers = await getApprovedSuppliers();

  return <SupplierDirectoryClient suppliers={suppliers} />;
}
