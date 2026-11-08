import type { ReactNode } from 'react';
import { publicPageMetadata } from '@/lib/seo';

export const metadata = publicPageMetadata(
  '/support',
  'Help & Support',
  'Get help with your QuickWeds account, wedding website, RSVPs, or planning tools.',
);

export default function PageLayout({ children }: { children: ReactNode }) {
  return children;
}
