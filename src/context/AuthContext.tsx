'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    loading: true,
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // CRITICAL FIX #2: Check admin status server-side
    const checkAdminStatus = async (user: User | null) => {
        if (!user) {
            setIsAdmin(false);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                setIsAdmin(false);
                return;
            }

            const response = await fetch('/api/auth/check-admin', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsAdmin(data.isAdmin);

                // If not admin from server check, fallback to env comparison (development safety net)
                if (!data.isAdmin && process.env.NODE_ENV === 'development') {
                    const devAdminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
                    if (devAdminEmail && user.email?.toLowerCase() === devAdminEmail.toLowerCase()) {
                        console.log('Dev fallback: granting admin access based on env check');
                        setIsAdmin(true);
                    }
                }
            } else {
                setIsAdmin(false);
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            checkAdminStatus(currentUser);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            checkAdminStatus(currentUser);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
