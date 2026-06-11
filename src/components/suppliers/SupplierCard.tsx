import Link from 'next/link';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';
import type { SupplierProfile } from '@/lib/suppliers';
import { getSupplierDisplayLocation } from '@/lib/suppliers';
import SupplierSaveButton from '@/components/suppliers/SupplierSaveButton';

export default function SupplierCard({ supplier }: { supplier: SupplierProfile }) {
    return (
        <article className="group overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
            <Link href={`/suppliers/${supplier.slug}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral">
                    {supplier.cover_image_url ? (
                        <img
                            src={supplier.cover_image_url}
                            alt={`${supplier.business_name} cover`}
                            className="h-full w-full object-contain p-5 transition duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(209,108,120,0.18),transparent_35%),linear-gradient(135deg,#fff8f4,#f2dfd8)]">
                            <Sparkles className="h-10 w-10 text-primary/45" />
                        </div>
                    )}
                    {supplier.is_featured && (
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary shadow-sm">
                            Featured
                        </span>
                    )}
                </div>
            </Link>

            <div className="space-y-4 p-5">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">{supplier.category}</p>
                    <Link href={`/suppliers/${supplier.slug}`} className="inline-flex min-h-[44px] items-center">
                        <h3 className="mt-2 font-serif text-2xl font-bold leading-tight text-foreground transition group-hover:text-primary">
                            {supplier.business_name}
                        </h3>
                    </Link>
                    <p className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
                        <MapPin className="h-4 w-4 flex-none text-primary/60" />
                        {getSupplierDisplayLocation(supplier)}
                    </p>
                </div>

                <p className="line-clamp-3 min-h-[72px] text-sm leading-6 text-text-secondary">
                    {supplier.summary || supplier.description || 'A QuickWeds supplier profile ready for your wedding plans.'}
                </p>

                <div className="flex flex-col gap-3 border-t border-border pt-4">
                    <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-neutral px-3 py-1 text-xs font-bold text-text-secondary">
                        {supplier.price_band || 'Custom quote'}
                    </span>
                    <Link href={`/suppliers/${supplier.slug}`} className="inline-flex min-h-[44px] items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                        View
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                    </div>
                    <SupplierSaveButton supplierId={supplier.id} className="w-full px-4 py-2.5 text-xs" />
                </div>
            </div>
        </article>
    );
}
