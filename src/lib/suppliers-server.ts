import { getCachedServerValue } from '@/lib/server-cache';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import {
  PHILIPPINE_SUPPLIER_LOCATIONS,
  SUPPLIER_CATEGORIES,
  slugifySupplier,
  type SupplierProfile,
} from '@/lib/suppliers';

const SUPPLIERS_CACHE_TTL_MS = 5 * 60 * 1000;

export async function getApprovedSuppliers(): Promise<SupplierProfile[]> {
  const { value } = await getCachedServerValue<SupplierProfile[]>(
    'supplier_profiles:approved:active',
    SUPPLIERS_CACHE_TTL_MS,
    async () => {
      try {
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
      } catch (error) {
        console.warn('Unable to load suppliers:', error);
        return [];
      }
    },
  );

  return value;
}

export async function getApprovedSupplierBySlug(slug: string): Promise<SupplierProfile | null> {
  try {
    const db = getSupabaseAdminClient() as any;
    const { data, error } = await db
      .from('supplier_profiles')
      .select(
        'id, slug, business_name, category, summary, description, city, province, price_band, service_areas, cover_image_url, gallery_images, phone, email, whatsapp, website_url, instagram_url, facebook_url, is_featured, status, is_active, updated_at',
      )
      .eq('slug', slug)
      .eq('status', 'approved')
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.warn('Unable to load supplier:', error.message);
      return null;
    }

    return data as SupplierProfile | null;
  } catch (error) {
    console.warn('Unable to load supplier:', error);
    return null;
  }
}

export function getSupplierCategorySlug(category: string) {
  return slugifySupplier(category);
}

export function getSupplierLocationSlug(location: string) {
  return slugifySupplier(location);
}

export function resolveSupplierCategoryBySlug(slug: string) {
  return SUPPLIER_CATEGORIES.find((cat) => getSupplierCategorySlug(cat) === slug) ?? null;
}

export function resolveSupplierLocationBySlug(slug: string) {
  return PHILIPPINE_SUPPLIER_LOCATIONS.find((loc) => getSupplierLocationSlug(loc) === slug) ?? null;
}

export function filterSuppliersByLocation(suppliers: SupplierProfile[], location: string) {
  const target = location.toLowerCase();
  return suppliers.filter((supplier) => {
    const city = (supplier.city || '').toLowerCase();
    const province = (supplier.province || '').toLowerCase();
    const areas = (supplier.service_areas || []).map((area) => area.toLowerCase());
    return (
      city === target ||
      province === target ||
      areas.includes(target) ||
      city.includes(target) ||
      province.includes(target) ||
      areas.some((area) => area.includes(target) || target.includes(area))
    );
  });
}

export function getSchemaTypeForSupplierCategory(category: string): string {
  const normalized = category.toLowerCase();
  if (normalized.includes('venue')) return 'EventVenue';
  if (normalized.includes('catering') || normalized.includes('cake')) return 'FoodEstablishment';
  if (normalized.includes('florist')) return 'Florist';
  if (normalized.includes('hair') || normalized.includes('makeup')) return 'BeautySalon';
  if (normalized.includes('jewelry')) return 'JewelryStore';
  if (normalized.includes('attire')) return 'ClothingStore';
  return 'LocalBusiness';
}

export function isOptimizableImageHost(url?: string | null): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('.supabase.co') || parsed.hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}
