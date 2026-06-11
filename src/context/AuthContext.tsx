'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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
    const lastAdminCheckRef = useRef('');

    // CRITICAL FIX #2: Check admin status server-side
    const checkAdminStatus = useCallback(async (user: User | null, session?: Session | null) => {
        setAdminChecked(false);
        if (!user) {
            lastAdminCheckRef.current = '';
            setIsAdmin(false);
            setAdminChecked(true);
            return;
        }

        try {
            let activeSession = session || null;
            if (!activeSession) {
                const { session: loadedSession, error } = await getSafeSupabaseSession();
                if (error) {
                    setIsAdmin(false);
                    setAdminChecked(true);
                    return;
                }
                activeSession = loadedSession;
            }

            if (!activeSession?.access_token) {
                setIsAdmin(false);
                setAdminChecked(true);
                return;
            }

            const adminCheckKey = `${user.id}:${activeSession.access_token.slice(-16)}`;
            if (lastAdminCheckRef.current === adminCheckKey) {
                setAdminChecked(true);
                return;
            }
            lastAdminCheckRef.current = adminCheckKey;

            const response = await fetch('/api/auth/check-admin', {
                headers: {
                    'Authorization': `Bearer ${activeSession.access_token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsAdmin(Boolean(data.isAdmin));
            } else {
                setIsAdmin(false);
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
        } finally {
            setAdminChecked(true);
        }
    }, []);

    useEffect(() => {
        const handleRejectedAuthRefresh = (event: PromiseRejectionEvent) => {
            if (!isInvalidRefreshTokenError(event.reason)) return;

            event.preventDefault();
            void clearLocalSupabaseSession().finally(() => {
                setUser(null);
                setIsAdmin(false);
                setAdminChecked(true);
                setLoading(false);
            });
        };

        window.addEventListener('unhandledrejection', handleRejectedAuthRefresh);

        // Check active sessions and sets the user
        getSafeSupabaseSession()
            .then(async ({ session, error }) => {
                if (error) {
                    if (!isInvalidRefreshTokenError(error)) {
                        console.error('Error loading auth session:', error);
                    }
                    setUser(null);
                    setIsAdmin(false);
                    setAdminChecked(true);
                    return;
                }

                const currentUser = session?.user ?? null;
                setUser(currentUser);
                await checkAdminStatus(currentUser, session);
            })
            .catch(async (error) => {
                if (isInvalidRefreshTokenError(error)) {
                    await clearLocalSupabaseSession();
                } else {
                    console.error('Error loading auth session:', error);
                }
                setUser(null);
                setIsAdmin(false);
                setAdminChecked(true);
            })
            .finally(() => {
                setLoading(false);
            });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            void checkAdminStatus(currentUser, session);
            setLoading(false);
        });

        return () => {
            window.removeEventListener('unhandledrejection', handleRejectedAuthRefresh);
            subscription.unsubscribe();
        };
    }, [checkAdminStatus]);

    const logout = async () => {
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
        }

        setUser(null);
        setIsAdmin(false);
        setAdminChecked(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, adminChecked, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
