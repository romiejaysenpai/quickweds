import type { Metadata } from 'next';
import FeatureLandingPage from '@/components/feature-landing/FeatureLandingPage';
import { featureContent } from '@/components/feature-landing/content';
const content = featureContent.rsvp;
export const metadata: Metadata = { title: { absolute: content.title }, description: content.description, keywords: content.keywords, alternates: { canonical: content.path }, openGraph: { title: content.title, description: content.description, url: content.path, type: 'website', images: [{ url: 'https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/Smart%20RSVP%20Management.png', alt: 'QuickWeds Wedding RSVP' }] }, twitter: { card: 'summary_large_image', title: content.title, description: content.description, images: ['https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/landing_page_images/Smart%20RSVP%20Management.png'] } };
export default function WeddingRsvpPage() { return <FeatureLandingPage feature="rsvp" />; }
