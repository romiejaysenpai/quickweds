'use client';

import Link from 'next/link';
import { Heart, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-serif text-text">Privacy Policy</h1>
        </div>

        <div className="prose prose-sm sm:prose max-w-none text-text-secondary space-y-6">
          <p className="text-sm italic">Last updated: April 23, 2026</p>

          <section>
            <h2 className="text-lg font-serif text-text font-bold mb-2">1. Introduction</h2>
            <p>Welcome to QuickWeds. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-text font-bold mb-2">2. Data We Collect</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Identity Data</strong> - includes first name, last name, username or similar identifier</li>
              <li><strong>Contact Data</strong> - includes email address and telephone numbers</li>
              <li><strong>Technical Data</strong> - includes internet protocol (IP) address, browser type and version, time zone setting and location</li>
              <li><strong>Usage Data</strong> - includes information about how you use our website and services</li>
              <li><strong>Wedding Event Data</strong> - includes wedding details, guest information, RSVP responses, and photos you upload</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-text font-bold mb-2">3. How We Use Your Data</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-text font-bold mb-2">4. Data Security</h2>
            <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-text font-bold mb-2">5. Data Retention</h2>
            <p>We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-text font-bold mb-2">6. Your Legal Rights</h2>
            <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Request access to your personal data</li>
              <li>Request correction or erasure of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing your personal data</li>
              <li>Request transfer of your personal data</li>
              <li>Right to withdraw consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-text font-bold mb-2">7. Third-Party Services</h2>
            <p>We may employ third-party companies and individuals due to the following reasons:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To facilitate our Service</li>
              <li>To provide the Service on our behalf</li>
              <li>To perform Service-related services</li>
              <li>To assist us in analyzing how our Service is used</li>
            </ul>
            <p className="mt-2">We use Supabase for authentication and database, Resend for email services, and Stripe for payment processing.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-text font-bold mb-2">8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>By email: romiejaybacasmas@gmail.com</li>
            </ul>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center">
          <p className="text-text-secondary text-sm">© 2026 QuickWeds. All rights reserved.</p>
        </div>
      </motion.div>
    </div>
  );
}