'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MonogramMark } from '@/components/MonogramMark';
import { getTemplateVisualProfile } from '@/lib/theme-engine';
import type { Wedding } from '@/types/wedding';

export default function WeddingFooter({ wedding }: { wedding: Wedding }) {
    const visual = getTemplateVisualProfile(wedding.template, wedding.motif_color);
    return (
        <footer className={`wedding-signature relative px-6 pb-32 pt-16 text-center ${visual.sectionClass}`} style={visual.sectionStyle}>
            <div className="mx-auto max-w-xl border-t border-current/15 pt-12">
                {wedding.logo_initials && <MonogramMark initials={wedding.logo_initials} brideName={wedding.bride_name} groomName={wedding.groom_name} shape={wedding.logo_shape} animation="none" color={wedding.logo_color} motifColor={wedding.motif_color} size="md" className="mx-auto mb-6" />}
                <p className={`text-xs uppercase tracking-[0.18em] ${visual.bodyClass}`}>With love</p>
                <p className="mt-4 break-words font-serif text-3xl leading-tight sm:text-4xl">{wedding.bride_name} &amp; {wedding.groom_name}</p>
                {wedding.hashtag && <p className={`mt-4 break-words text-sm ${visual.bodyClass}`}>#{wedding.hashtag}</p>}
                {wedding.wedding_date && <p className={`mt-4 text-sm ${visual.bodyClass}`}>{new Date(`${wedding.wedding_date.slice(0, 10)}T12:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
                <Link href="/" aria-label="Made with QuickWeds" className="mt-10 inline-flex min-h-11 items-center opacity-60 transition-opacity hover:opacity-100">
                    <Image src="/logo.png" alt="QuickWeds" width={100} height={36} className={`h-5 w-auto grayscale ${visual.isDark ? 'brightness-0 invert' : ''}`} />
                </Link>
            </div>
        </footer>
    );
}
