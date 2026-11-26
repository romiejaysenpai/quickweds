import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Create Your Free Account',
  description: 'Sign up for QuickWeds to build your free wedding website, collect online RSVPs, and organize your wedding plan.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignupLayout({ children }: { children: ReactNode }) {
  return children;
}
