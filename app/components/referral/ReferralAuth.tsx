"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { hardLogout } from "@/utils/auth-helpers";

export default function ReferralAuth({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");

    // Login State
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register State
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPhone, setRegPhone] = useState("");
    const [regPassword, setRegPassword] = useState("");

    const supabase = createClient();

    const handleLogin = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword,
            });

            if (error) {
                alert(error.message);
                return;
            }

            // 📧 EMAIL VERIFICATION ENFORCEMENT
            if (data.user && !data.user.email_confirmed_at) {
                alert("Please verify your email before logging in.");
                await hardLogout();
                return;
            }

            // Lazy Profile Creation
            if (data.user) {
                const user = data.user;
                const { data: partner } = await supabase.from('referral_partners').select('id').eq('id', user.id).single();

                if (!partner) {
                    console.log("Referral Profile missing, creating now...");
                    const metadata = user.user_metadata || {};

                    const { error: createError } = await supabase.from('referral_partners').insert({
                        id: user.id,
                        name: metadata.full_name || "",
                        email: user.email,
                        // 🧠 NORMALIZATION
                        phone: (metadata.phone || "").replace(/^0+/, "")
                    });

                    if (createError) {
                        console.error("Failed to create referral profile:", createError);
                        alert("Login successful but profile setup failed: " + createError.message);
                        await hardLogout();
                        return;
                    }

                    window.location.reload();
                    return;
                }
            }

            // Success
            alert("Login Successful!");
            window.location.reload();

        } catch (err) {
            console.error(err);
            alert("Error during login");
        }
    };

    const handleRegister = async () => {
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: regEmail,
                password: regPassword,
                options: {
                    data: {
                        full_name: regName,
                        // 🧠 NORMALIZATION
                        phone: regPhone.replace(/^0+/, ""),
                        role: 'referral'
                    }
                }
            });

            if (authError) {
                alert(authError.message);
                return;
            }

            if (authData.user) {
                alert("Registration Successful! Please check your email to verify your account, then Login.");
                setActiveTab("login");
            }
        } catch (err) {
            console.error(err);
            alert("Error during registration");
        }
    };

    return (
        <div className="flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Referral Program
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join us and earn rewards by referring workers.
                    </p>
                </div>

                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-4 text-center font-medium text-sm focus:outline-none ${activeTab === "login"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("login")}
                    >
                        Login
                    </button>
                    <button
                        className={`flex-1 py-4 text-center font-medium text-sm focus:outline-none ${activeTab === "register"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                        onClick={() => setActiveTab("register")}
                    >
                        Register
                    </button>
                </div>

                {activeTab === "login" && (
                    <div className="space-y-6">
                        <div>
                            <input
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Email Address"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleLogin}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Login
                        </button>
                    </div>
                )}

                {activeTab === "register" && (
                    <div className="space-y-6">
                        <input
                            type="text"
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-3"
                            placeholder="Full Name"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                        />
                        <input
                            type="email"
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-3"
                            placeholder="Email address"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                        />
                        <input
                            type="text"
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-3"
                            placeholder="Phone Number"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                        />
                        <input
                            type="password"
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                        />
                        <button
                            onClick={handleRegister}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                            Register as Referral
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
