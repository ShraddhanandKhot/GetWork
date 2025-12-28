"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1); // 1: Input Email, 2: Check Inbox
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleReset = async () => {
        if (!email) {
            alert("Please enter your registered email");
            return;
        }
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
            });
            // Note: You need a route to handle the update-password usually, 
            // or standard redirect to a page where they can use updateUser({password: ...})
            // For now, Supabase sends a magic link that logs them in. 
            // The standard behavior is it redirects to the generic site URL or specified redirect.

            if (error) {
                alert(error.message);
            } else {
                setStep(2);
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    {step === 1 ? "Forgot Password" : "Check Your Email"}
                </h1>

                {step === 1 && (
                    <div>
                        <p className="text-gray-600 mb-4 text-center">
                            Enter your registered email address to receive a password reset link.
                        </p>
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            onClick={handleReset}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? "Sending Link..." : "Send Reset Link"}
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="text-center">
                        <p className="text-gray-600 mb-6">
                            We have sent a password reset link to <strong>{email}</strong>.
                            Please check your inbox (and spam folder) and click the link to reset your password.
                        </p>

                        <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 mb-4">
                            Tip: The link will log you in automatically. You can then go to your profile settings to set a new password.
                        </div>

                        <Link
                            href="/login"
                            className="block w-full bg-gray-200 text-gray-800 p-3 rounded-lg hover:bg-gray-300 transition"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}

                {step === 1 && (
                    <p className="mt-4 text-center text-sm text-gray-500">
                        Remember your password? <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
                    </p>
                )}
            </div>
        </div>
    );
}
