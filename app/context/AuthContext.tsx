"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

type Role = "worker" | "organization" | "referral" | null;

interface AuthContextType {
    user: User | null;
    role: Role;
    isLoading: boolean;
    logout: () => Promise<void>;
    isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();

    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 🔑 Resolve role (READ ONLY)
    const resolveRole = async (userId: string) => {
        // Worker
        const { data: worker } = await supabase
            .from("workers")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

        if (worker) {
            setRole("worker");
            return;
        }

        // Organization
        const { data: org } = await supabase
            .from("organizations")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

        if (org) {
            setRole("organization");
            return;
        }

        // Referral
        const { data: ref } = await supabase
            .from("referral_partners")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

        if (ref) {
            setRole("referral");
            return;
        }

        // Profile not created yet
        setRole(null);
    };

    useEffect(() => {
        const init = async () => {
            try {
                const { data } = await supabase.auth.getUser();
                const sessionUser = data.user ?? null;

                setUser(sessionUser);

                if (sessionUser) {
                    await resolveRole(sessionUser.id);
                } else {
                    setRole(null);
                }
            } catch (err) {
                console.error("Auth init error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        init();

        const { data: listener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                const sessionUser = session?.user ?? null;
                setUser(sessionUser);

                if (sessionUser) {
                    await resolveRole(sessionUser.id);
                } else {
                    setRole(null);
                }
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                isLoading,
                logout,
                isLoggedIn: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
