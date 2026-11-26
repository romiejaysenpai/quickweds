'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { invalidateSessionCache } from '@/lib/session-cache';
import { clearLocalSupabaseSession, getSafeSupabaseSession, isInvalidRefreshTokenError } from '@/lib/supabase-auth';

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    adminChecked: boolean;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    adminChecked: false,
    loading: true,
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminChecked, setAdminChecked] = useState(false);
    const [loading, setLoading] = useState(true);
    const completedAdminCheckRef = useRef<{ key: string; isAdmin: boolean } | null>(null);
    const pendingAdminCheckRef = useRef<{ key: string; promise: Promise<boolean> } | null>(null);
    const isMountedRef = useRef(true);

    // CRITICAL FIX #2: Check admin status server-side without duplicate/racy requests
    const checkAdminStatus = useCallback(async (currentUser: User | null, session?: Session | null) => {
        if (!currentUser) {
            completedAdminCheckRef.current = null;
            pendingAdminCheckRef.current = null;
            if (isMountedRef.current) {
                setIsAdmin(false);
                setAdminChecked(true);
            }
            return;
        }

        try {
            let activeSession = session || null;
            if (!activeSession) {
                const { session: loadedSession, error } = await getSafeSupabaseSession();
                if (error) {
                    if (isMountedRef.current) {
                        setIsAdmin(false);
                        setAdminChecked(true);
                    }
                    return;
                }
                activeSession = loadedSession;
            }

            if (!activeSession?.access_token) {
                if (isMountedRef.current) {
                    setIsAdmin(false);
                    setAdminChecked(true);
                }
                return;
            }

            const adminCheckKey = `${currentUser.id}:${activeSession.access_token.slice(-16)}`;
            if (completedAdminCheckRef.current?.key === adminCheckKey) {
                if (isMountedRef.current) {
                    setIsAdmin(completedAdminCheckRef.current.isAdmin);
                    setAdminChecked(true);
                }
                return;
            }

            if (isMountedRef.current) {
                setAdminChecked(false);
            }

            let checkPromise: Promise<boolean>;
            if (pendingAdminCheckRef.current?.key === adminCheckKey) {
                checkPromise = pendingAdminCheckRef.current.promise;
            } else {
                const accessToken = activeSession.access_token;
                checkPromise = fetch('/api/auth/check-admin', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                })
                    .then(async (response) => {
                        if (!response.ok) return false;
                        const data = await response.json();
                        const nextIsAdmin = Boolean(data.isAdmin);
                        completedAdminCheckRef.current = { key: adminCheckKey, isAdmin: nextIsAdmin };
                        return nextIsAdmin;
                    })
                    .finally(() => {
                        if (pendingAdminCheckRef.current?.key === adminCheckKey) {
                            pendingAdminCheckRef.current = null;
                        }
                    });

                pendingAdminCheckRef.current = { key: adminCheckKey, promise: checkPromise };
            }

            const resolvedIsAdmin = await checkPromise;
            if (isMountedRef.current) {
                setIsAdmin(resolvedIsAdmin);
                setAdminChecked(true);
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            if (isMountedRef.current) {
                setIsAdmin(false);
                setAdminChecked(true);
            }
        }
    }, []);

    useEffect(() => {
        isMountedRef.current = true;

        const handleRejectedAuthRefresh = (event: PromiseRejectionEvent) => {
            if (!isInvalidRefreshTokenError(event.reason)) return;

            event.preventDefault();
            invalidateSessionCache();
            completedAdminCheckRef.current = null;
            pendingAdminCheckRef.current = null;
            void clearLocalSupabaseSession().finally(() => {
                if (!isMountedRef.current) return;
                setUser(null);
                setIsAdmin(false);
                setAdminChecked(true);
                setLoading(false);
            });
        };

        window.addEventListener('unhandledrejection', handleRejectedAuthRefresh);

        // Resolve session immediately and run admin check without blocking loading state
        getSafeSupabaseSession()
            .then(({ session, error }) => {
                if (!isMountedRef.current) return;
                if (error) {
                    if (!isInvalidRefreshTokenError(error)) {
                        console.error('Error loading auth session:', error);
                    }
                    setUser(null);
                    setIsAdmin(false);
                    setAdminChecked(true);
                    setLoading(false);
                    return;
                }

                const currentUser = session?.user ?? null;
                setUser(currentUser);
                setLoading(false);
                void checkAdminStatus(currentUser, session);
            })
            .catch(async (error) => {
                if (isInvalidRefreshTokenError(error)) {
                    await clearLocalSupabaseSession();
                } else {
                    console.error('Error loading auth session:', error);
                }
                if (!isMountedRef.current) return;
                setUser(null);
                setIsAdmin(false);
                setAdminChecked(true);
                setLoading(false);
            });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            invalidateSessionCache();
            if (!isMountedRef.current) return;
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setLoading(false);
            void checkAdminStatus(currentUser, session);
        });

        return () => {
            isMountedRef.current = false;
            window.removeEventListener('unhandledrejection', handleRejectedAuthRefresh);
            subscription.unsubscribe();
        };
    }, [checkAdminStatus]);

    const logout = useCallback(async () => {
        invalidateSessionCache();
        try {
            const { error } = await supabase.auth.signOut();

            if (error && isInvalidRefreshTokenError(error)) {
                await clearLocalSupabaseSession();
            } else if (error) {
                throw error;
            }
        } catch (error) {
            if (isInvalidRefreshTokenError(error)) {
                await clearLocalSupabaseSession();
            } else {
                throw error;
            }
        } finally {
            invalidateSessionCache();
            if (typeof window !== 'undefined' && 'caches' in window) {
                void window.caches.keys()
                    .then((keys) => Promise.all(
                        keys
                            .filter((key) => key.startsWith('quickweds-pwa-') && key.endsWith('-pages'))
                            .map((key) => window.caches.delete(key))
                    ))
                    .catch(() => {});
            }
        }

        completedAdminCheckRef.current = null;
        pendingAdminCheckRef.current = null;
        setUser(null);
        setIsAdmin(false);
        setAdminChecked(true);
    }, []);

    const value = useMemo(
        () => ({ user, isAdmin, adminChecked, loading, logout }),
        [user, isAdmin, adminChecked, loading, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
