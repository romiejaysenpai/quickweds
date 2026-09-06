'use client';

import Link from 'next/link';
import { ArrowLeft, User, Shield, Loader2, Save, CheckCircle2, AlertCircle, Trash2, AlertTriangle, FileText, LifeBuoy, LockKeyhole } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getCachedSession } from '@/lib/session-cache';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default function SettingsPage() {
  const { user, logout } = useAuth();
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
      const { data: sessionData } = await getCachedSession();
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          ...(sessionData.session?.access_token ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {}),
          'X-QuickWeds-Delete-Confirmation': 'DELETE',
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

  return (
    <DashboardShell>
      <div className="min-h-screen bg-background p-4 sm:p-6 pb-24 flex-1">
        <div className="max-w-6xl mx-auto pt-4 sm:pt-6">
          {/* Desktop Breadcrumbs & Back */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-text-secondary">
              <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
              <span>/</span>
              <span className="text-foreground">Settings</span>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-white text-xs font-bold text-text-secondary hover:text-primary hover:border-primary/30 transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            {/* Left Sidebar Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
              <div className="relative overflow-hidden rounded-[2rem] bg-primary p-6 sm:p-8 flex items-center min-h-[160px] sm:min-h-[190px] shadow-xl shadow-primary/15">
                {/* Decorative curve */}
                <div className="absolute right-[-20%] sm:right-[-10%] top-[-20%] bottom-[-20%] w-[70%] sm:w-[50%] rounded-l-[100%] bg-white/10 z-0" />
                
                <div className="relative z-20 w-[60%] sm:w-[65%] pr-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Account Center</span>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight mt-1">Settings</h1>
                  <p className="text-white/80 mt-1.5 text-xs sm:text-sm leading-relaxed">Manage your credentials and preferences.</p>
                </div>
                
                <img 
                  src="https://jioouyzzitvtlpzqqbkz.supabase.co/storage/v1/object/public/quickweds/icons/settings%20quicky.png" 
                  alt="Settings Mascot" 
                  className="absolute bottom-0 right-[-10px] sm:right-2 z-10 h-[140px] sm:h-[180px] w-auto object-contain drop-shadow-2xl transition duration-500 hover:-translate-y-2 hover:scale-[1.03]"
                />
              </div>

              {/* User Identity Snapshot Card */}
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-base shadow-inner">
                    {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground text-sm truncate">{fullName || 'Wedding Organizer'}</p>
                    <p className="text-xs text-text-secondary truncate">{email}</p>
                  </div>
                </div>
              </div>

              {/* Quick Legal & Help Links */}
              <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  { href: '/privacy', label: 'Privacy Policy', icon: LockKeyhole },
                  { href: '/terms', label: 'Terms of Service', icon: FileText },
                  { href: '/support', label: 'Help & Support', icon: LifeBuoy },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex min-h-[48px] items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-xs font-bold text-text-secondary shadow-2xs transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Main Column (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-border p-6 sm:p-8 shadow-sm">
                <h2 className="text-lg font-serif font-bold text-foreground mb-1">Profile & Security</h2>
                <p className="text-xs text-text-secondary mb-6">Update your account information and authentication credentials.</p>

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

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-neutral/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-sm font-medium"
                      placeholder="Your Name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-neutral/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-sm font-medium"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="pt-4 border-t border-border/70">
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
                      New Password <span className="text-text-secondary/60 font-normal lowercase">(leave blank to keep current)</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-neutral/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground text-sm"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px] text-sm"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-sm font-bold text-foreground mb-1">Danger Zone</h3>
                  <p className="text-xs text-text-secondary mb-4">
                    Deleting your account will permanently remove all your weddings, guests, and settings.
                  </p>
                  
                  {!showDeleteConfirmation ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-bold text-red-900">Are you absolutely sure?</h4>
                          <p className="text-xs text-red-700 mt-1">
                            Please type <span className="font-mono font-bold">DELETE</span> to confirm account deletion.
                          </p>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Type DELETE"
                        className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                      />

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Confirm Delete'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteConfirmation(false);
                            setDeleteConfirmation('');
                          }}
                          disabled={isDeleting}
                          className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-border bg-white px-5 py-2 text-xs font-bold text-text-secondary transition hover:text-foreground disabled:opacity-50"
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
      </div>
    </DashboardShell>
  );
}
