import type { ReactNode } from 'react';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata(
  '/templates',
  'Wedding Website Templates & Invitation Designs',
  'Browse wedding website templates by style, from classic to modern. Choose a design and make it your own with photos, venue details, and online RSVP.',
);

export default function PageLayout({ children }: { children: ReactNode }) {
  return children;
}
