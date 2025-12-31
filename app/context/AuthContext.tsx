"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { hardLogout } from "@/utils/auth-helpers";

type Role = "worker" | "organization" | "referral" | null;

interface AuthContextType {
    isLoggedIn: boolean;
    role: Role;
    user: User | null;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();

    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role>(null);
    const [isLoading, setIsLoading] = useState(true);

    /* -------------------------------------------------
       ROLE RESOLUTION (NO .single(), RLS SAFE)
    --------------------------------------------------*/
    const fetchUserRole = async (userId: string) => {
        try {
            const { data: worker } = await supabase
                .from("workers")
                .select("id")
                .eq("id", userId)
                .limit(1);

            if (worker?.length) {
                setRole("worker");
                return;
            }

            const { data: org } = await supabase
                .from("organizations")
                .select("id")
                .eq("id", userId)
                .limit(1);

            if (org?.length) {
                setRole("organization");
                return;
            }

            const { data: ref } = await supabase
                .from("referral_partners")
                .select("id")
                .eq("id", userId)
                .limit(1);

            if (ref?.length) {
                setRole("referral");
                return;
            }

            // Metadata fallback (LAST resort)
            const { data } = await supabase.auth.getUser();
            const metaRole = data.user?.user_metadata?.role;

            if (metaRole === "worker" || metaRole === "organization" || metaRole === "referral") {
                setRole(metaRole);
                return;
            }

            setRole(null);
        } catch (err) {
            console.error("Role fetch failed:", err);
            setRole(null);
        }
    };

    /* -------------------------------------------------
       AUTH INITIALIZATION (FAILSAFE)
    --------------------------------------------------*/
    useEffect(() => {
        let cancelled = false;

        // 🔥 FAILSAFE: authLoading MUST end
        const failsafe = setTimeout(() => {
            if (!cancelled) {
                console.warn("AuthContext failsafe triggered");
                setIsLoading(false);
            }
        }, 800); // <— GUARANTEED EXIT

        const init = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const sessionUser = data.session?.user ?? null;

                if (cancelled) return;

                setUser(sessionUser);

                if (sessionUser) {
                    await fetchUserRole(sessionUser.id);
                } else {
                    setRole(null);
                }
            } catch (err) {
                console.error("Auth init error:", err);
                setUser(null);
                setRole(null);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        init();

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                const sessionUser = session?.user ?? null;
                setUser(sessionUser);

                if (sessionUser) {
                    await fetchUserRole(sessionUser.id);
                } else {
                    setRole(null);
                }
            }
        );

        return () => {
            cancelled = true;
            clearTimeout(failsafe);
            listener.subscription.unsubscribe();
        };
    }, []);

    const logout = async () => {
        await hardLogout();
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: !!user,
                role,
                user,
                logout,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
