import type { Metadata } from 'next';
import FeatureLandingPage from '@/components/feature-landing/FeatureLandingPage';
import { featureContent } from '@/components/feature-landing/content';
const content = featureContent.checklist;
export const metadata: Metadata = { title: { absolute: content.title }, description: content.description, keywords: content.keywords, alternates: { canonical: content.path }, openGraph: { title: content.title, description: content.description, url: content.path, type: 'website', images: [{ url: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/TASK%20AND%20CHECK%20LIST%20PALNNER.png', alt: 'QuickWeds Wedding Checklist' }] }, twitter: { card: 'summary_large_image', title: content.title, description: content.description, images: ['https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/TASK%20AND%20CHECK%20LIST%20PALNNER.png'] } };
export default function WeddingChecklistPage() { return <FeatureLandingPage feature="checklist" />; }
