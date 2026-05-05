'use client';

import Link from 'next/link';
import { ArrowLeft, Crown, CheckCircle2 } from 'lucide-react';
import UpgradeButton from '@/components/UpgradeButton';
import { useAuth } from '@/context/AuthContext';

export default function PlannerGatewayPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto pt-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8 transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-[2rem] border border-border p-8 sm:p-12 shadow-xl shadow-primary/5 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Crown className="w-10 h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">Planner Pro</h1>
          <p className="text-text-secondary text-lg mb-8 max-w-md mx-auto">
            Unlock our premium wedding planning suite. Keep every detail organized in one beautiful dashboard.
          </p>
          
          <div className="text-left max-w-sm mx-auto mb-8 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span className="text-foreground font-medium">Smart Budget Tracker</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span className="text-foreground font-medium">Interactive Seating Charts</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span className="text-foreground font-medium">Vendor Management</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              <span className="text-foreground font-medium">Partner Collaboration</span>
            </div>
          </div>

          <div className="mb-10 flex justify-center">
             <UpgradeButton userEmail={user?.email || ''} />
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-sm text-text-secondary">
              Already have a Pro account? <br/>
              <Link href="/dashboard" className="text-primary font-bold hover:underline mt-2 inline-block">Select your wedding from the dashboard</Link> to access your planner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
