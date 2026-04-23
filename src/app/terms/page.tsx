'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-[2rem] p-6 sm:p-10 soft-shadow border border-border"
      >
        <Link href="/" className="inline-flex items-center text-primary hover:underline mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="QuickWeds" className="h-12 w-auto" />
          <h1 className="text-2xl font-serif text-text">Terms of Service</h1>
        </div>

        <div className="text-text-secondary space-y-6">
          <p className="text-sm italic">Last updated: April 23, 2026</p>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-text">1. Acceptance of Terms</h2>
            <p>By accessing and using QuickWeds, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-text">2. Description of Service</h2>
            <p>QuickWeds provides wedding website creation services, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Wedding landing page creation and hosting</li>
              <li>RSVP management and tracking</li>
              <li>Photo and video gallery hosting</li>
              <li>Wedding event timeline displays</li>
              <li>Custom domain mapping</li>
              <li>Email notifications for wedding events</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-text">3. User Accounts</h2>
            <p>When you create an account with us, you must provide us with accurate and complete information. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-text">4. User Content</h2>
            <p>You retain ownership of all content you upload to your wedding website, including photos, videos, text, and other materials. By uploading content, you grant QuickWeds a license to use, store, and display that content as necessary to provide our services.</p>
            <p className="mt-2">You represent and warrant that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>You own or have the right to use any content you upload</li>
              <li>Your content does not violate any third-party rights</li>
              <li>Your content does not contain harmful, illegal, or inappropriate material</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-text">5. Payment and Subscriptions</h2>
            <p>Some features of QuickWeds require payment. By subscribing to a paid plan, you agree to pay all fees and charges associated with your subscription. All payments are non-refundable unless otherwise specified.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-text">6. Prohibited Uses</h2>
            <p>You may not use our service to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Upload or transmit any content that is illegal, harmful, or offensive</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in any activity that could damage, disable, or impair our service</li>
              <li>Collect or store personal data about other users without their consent</li>
              <li>Use the service for any unlawful purpose</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-text">7. Limitation of Liability</h2>
            <p>QuickWeds shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your use or inability to use the service</li>
              <li>Any unauthorized access to or use of our servers</li>
              <li>Any interruption or cessation of transmission to or from our service</li>
              <li>Any bugs, viruses, or the like that may be transmitted through our service</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-text">8. Service Changes</h2>
            <p>We reserve the right to modify or discontinue the service at any time, with or without notice. We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the service.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-text">9. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including breach of these Terms. Upon termination, your right to use the Service will immediately cease.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-text">10. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of the Philippines, without regard to its conflict of law provisions.</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-text">11. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>By email: romiejaybacasmas@gmail.com</li>
            </ul>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-text-secondary text-sm">Copyright 2026 QuickWeds. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
}
