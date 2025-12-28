"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleUpdatePassword = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                alert("Error updating password: " + error.message);
            } else {
                alert("Password updated successfully!");
                router.push("/"); // Redirect to home or profile
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
                <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
                    Set New Password
                </h2>
                <p className="text-gray-600 mb-6 text-center">
                    Please enter your new password below.
                </p>

                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleUpdatePassword}
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </div>
        </div>
    );
}
