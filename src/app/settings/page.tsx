'use client';

import Link from 'next/link';
import { ArrowLeft, User, Shield, Loader2, Save, CheckCircle2, AlertCircle, Trash2, AlertTriangle, FileText, LifeBuoy, LockKeyhole } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?next=%2Fsettings');
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess('');
    setUpdateError('');

    try {
      const updates: any = {};
      
      if (fullName !== user?.user_metadata?.full_name) {
        updates.data = { full_name: fullName };
      }
      
      if (email !== user?.email) {
        updates.email = email;
      }
      
      if (password) {
        updates.password = password;
      }

      if (Object.keys(updates).length === 0) {
        setUpdateSuccess('No changes to save.');
        setIsUpdating(false);
        return;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      let successMsg = 'Profile updated successfully.';
      if (email !== user?.email) {
        successMsg += ' Please check your new email to verify the change.';
      }
      
      setUpdateSuccess(successMsg);
      setPassword(''); // Clear password field after update
    } catch (error: any) {
      setUpdateError(error.message || 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.trim().toUpperCase() !== 'DELETE') {
      setUpdateError('Type DELETE to confirm account deletion.');
      return;
    }

    setIsDeleting(true);
    setUpdateSuccess('');
    setUpdateError('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          ...(sessionData.session?.access_token ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {}),
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete account.');
      }

      await logout();
      router.replace('/?accountDeleted=1');
    } catch (error: any) {
      setUpdateError(error.message || 'Unable to delete account.');
      setIsDeleting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="mobile-safe-screen flex items-center justify-center bg-background px-4" aria-live="polite">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-4 text-sm font-semibold text-text-secondary shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          Checking your account…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24">
      <div className="max-w-2xl mx-auto pt-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-6 transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-primary p-6 sm:p-8 flex items-center min-h-[160px] sm:min-h-[200px]">
          {/* Decorative curve */}
          <div className="absolute right-[-20%] sm:right-[-10%] top-[-20%] bottom-[-20%] w-[70%] sm:w-[50%] rounded-l-[100%] bg-white/10 z-0" />
          
          <div className="relative z-20 w-[55%] sm:w-[65%] pr-2 sm:pr-0">
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">Account Settings</h1>
            <p className="text-white/80 mt-2 text-sm sm:text-base">Manage your profile details and security.</p>
          </div>
          
          <img 
            src="https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/icons/settings%20quicky.png" 
            alt="Settings Mascot" 
            className="absolute bottom-0 right-[-10px] sm:right-6 z-10 h-[150px] sm:h-[210px] w-auto object-contain drop-shadow-2xl transition duration-500 hover:-translate-y-2 hover:scale-[1.03]"
          />
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
            { href: '/privacy', label: 'Privacy Policy', icon: LockKeyhole },
            { href: '/terms', label: 'Terms', icon: FileText },
            { href: '/support', label: 'Support', icon: LifeBuoy },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-bold text-text-secondary shadow-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
            >
              <item.icon className="h-4 w-4 text-primary" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          {updateSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-green-800">{updateSuccess}</p>
            </div>
          )}

          {updateError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{updateError}</p>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <User className="w-5 h-5 text-primary" /> Profile Details
              </h2>
              
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-1" htmlFor="fullName">Full Name</label>
                <input 
                  type="text" 
                  id="fullName" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-neutral px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" 
                  placeholder="Your Name" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-1" htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-neutral px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" 
                  placeholder="your.email@example.com" 
                />
                <p className="text-xs text-text-secondary mt-1">Changing your email will require verification.</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-2">
                <Shield className="w-5 h-5 text-primary" /> Security
              </h2>
              
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-1" htmlFor="password">New Password</label>
                <input 
                  type="password" 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-neutral px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" 
                  placeholder="Leave blank to keep current password" 
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full sm:w-auto inline-flex justify-center items-center gap-2 min-h-[44px] rounded-xl bg-primary px-8 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-hover disabled:opacity-70"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 border border-red-200 bg-red-50 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-red-100 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-red-950">Delete Account</h2>
              <p className="mt-2 text-sm leading-6 text-red-900">
                Permanently delete your QuickWeds account, owned wedding workspaces, profile details, and associated account data. This cannot be undone.
              </p>

              {!showDeleteConfirmation ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirmation(true);
                    setUpdateError('');
                    setUpdateSuccess('');
                  }}
                  className="mt-5 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              ) : (
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-red-950 mb-1" htmlFor="deleteConfirmation">
                      Type DELETE to confirm
                    </label>
                    <input
                      id="deleteConfirmation"
                      type="text"
                      value={deleteConfirmation}
                      onChange={(event) => setDeleteConfirmation(event.target.value)}
                      className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                      autoComplete="off"
                    />
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isDeleting || deleteConfirmation.trim().toUpperCase() !== 'DELETE'}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Permanently Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirmation(false);
                        setDeleteConfirmation('');
                      }}
                      disabled={isDeleting}
                      className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border bg-white px-5 py-2 text-sm font-bold text-text-secondary transition hover:text-foreground disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
