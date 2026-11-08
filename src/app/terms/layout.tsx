import type { ReactNode } from 'react';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata(
  '/terms',
  'Terms of Service',
  'Read the terms for using QuickWeds wedding websites and planning tools.',
);

export default function PageLayout({ children }: { children: ReactNode }) {
  return children;
}
