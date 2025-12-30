"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { hardLogout } from "@/utils/auth-helpers";

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
        const init = async () => {
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
                console.error("Error initializing auth:", error);
            } finally {
                setIsLoading(false);
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setUser(session.user);
                // Only fetch role if we don't have it or if user changed (optimization)
                // But generally safe to refetch to be sure
                await fetchUserRole(session.user.id);
            } else {
                setUser(null);
                setRole(null);
                // We do NOT set isLoading to false here, as it should already be false by init
                // taking over. However, if onAuthStateChange fires before init completes (rare but possible),
                // it might race. But init's finally block handles the initial load.
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []); // Empty dependency array to run once

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
            setRole('referral');
            return;
        }

        // 4. Fallback: Check Metadata
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.role) {
            console.log("Role not found in DB, using metadata:", user.user_metadata.role);
            setRole(user.user_metadata.role);
            return;
        }

        setRole(null);
    };

    const logout = async () => {
        await hardLogout();
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
