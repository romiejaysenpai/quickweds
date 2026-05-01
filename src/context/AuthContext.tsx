'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { isKnownAdminEmail } from '@/lib/admin';

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

    // CRITICAL FIX #2: Check admin status server-side
    const checkAdminStatus = async (user: User | null) => {
        setAdminChecked(false);
        if (!user) {
            setIsAdmin(false);
            setAdminChecked(true);
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                setIsAdmin(false);
                setAdminChecked(true);
                return;
            }

            const response = await fetch('/api/auth/check-admin', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setIsAdmin(Boolean(data.isAdmin) || isKnownAdminEmail(user.email));
            } else {
                setIsAdmin(isKnownAdminEmail(user.email));
            }
        } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(isKnownAdminEmail(user.email));
        } finally {
            setAdminChecked(true);
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
        setAdminChecked(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, adminChecked, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
