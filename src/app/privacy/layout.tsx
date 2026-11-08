import type { ReactNode } from 'react';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata(
  '/privacy',
  'Privacy Policy',
  'Learn how QuickWeds handles personal information for accounts, wedding websites, and planning tools.',
);

export default function PageLayout({ children }: { children: ReactNode }) {
  return children;
}
