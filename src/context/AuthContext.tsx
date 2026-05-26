'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { clearLocalSupabaseSession, isInvalidRefreshTokenError } from '@/lib/supabase-auth';
import { getCachedSession, invalidateSessionCache } from '@/lib/session-cache';

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
                const { data: { session: loadedSession }, error } = await getCachedSession();
                if (error) {
                    if (isInvalidRefreshTokenError(error)) {
                        await clearLocalSupabaseSession();
                        setUser(null);
                    }
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
        // Check active sessions and sets the user
        getCachedSession()
            .then(async ({ data: { session }, error }) => {
                if (error) {
                    if (isInvalidRefreshTokenError(error)) {
                        await clearLocalSupabaseSession();
                    } else {
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
            invalidateSessionCache();
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            void checkAdminStatus(currentUser, session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [checkAdminStatus]);

    const logout = async () => {
        await supabase.auth.signOut();
        invalidateSessionCache();
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
