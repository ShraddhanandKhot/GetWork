"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
    isLoggedIn: boolean;
    role: string | null;
    user: User | null;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser(session.user);
                    await fetchUserRole(session.user.id);
                } else {
                    setUser(null);
                    setRole(null);
                }
            } catch (error) {
                console.error("Error checking session:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                router.push("/update-password");
            }

            if (session?.user) {
                setUser(session.user);
                // Only fetch role if we don't have it or if user changed
                if (!role || user?.id !== session.user.id) {
                    await fetchUserRole(session.user.id);
                }
            } else {
                setUser(null);
                setRole(null);
                setIsLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, role, user?.id]);

    const fetchUserRole = async (userId: string) => {
        // Check Worker table
        const { data: worker } = await supabase
            .from('workers')
            .select('id')
            .eq('id', userId)
            .single();

        if (worker) {
            setRole('worker');
            return;
        }

        // Check Organization table
        const { data: org } = await supabase
            .from('organizations')
            .select('id')
            .eq('id', userId)
            .single();

        if (org) {
            setRole('organization');
            return;
        }

        // Check Referral Partner table
        const { data: partner } = await supabase
            .from('referral_partners')
            .select('id')
            .eq('id', userId)
            .single();

        if (partner) {
            setRole('referral_partner');
            return;
        }

        setRole(null);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn: !!user, role, user, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
