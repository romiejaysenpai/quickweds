import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to manage your QuickWeds wedding website, RSVPs, guest list, and planner.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
