"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    // ✅ WAIT until Supabase finishes session hydration
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                router.replace("/login");
            } else {
                setReady(true);
            }
        };
        checkSession();
    }, [router, supabase]);

    const handleUpdatePassword = async () => {
        if (password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        if (password !== confirm) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            alert("Error updating password: " + error.message);
        } else {
            alert("Password updated successfully!");
            await supabase.auth.signOut(); // 🔒 important security step
            router.replace("/login");
        }

        setLoading(false);
    };

    // ⏳ Avoid flicker
    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Verifying reset link...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
                <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
                    Set New Password
                </h2>

                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full p-3 border rounded-lg mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full p-3 border rounded-lg mb-6"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                />

                <button
                    onClick={handleUpdatePassword}
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </div>
        </div>
    );
}
