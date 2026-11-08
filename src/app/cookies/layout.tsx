import type { ReactNode } from 'react';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata(
  '/cookies',
  'Cookie Policy',
  'Learn how QuickWeds uses cookies and browser storage.',
);

export default function PageLayout({ children }: { children: ReactNode }) {
  return children;
}
