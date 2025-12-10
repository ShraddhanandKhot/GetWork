"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [role, setRole] = useState("worker");
    const [phone, setPhone] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const resetPassword = async () => {
        if (!phone || !newPassword) {
            alert("Please enter phone number and new password");
            return;
        }

        const res = await fetch("https://getwork-backend.onrender.com/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, newPassword, role }),
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        alert("Password reset successfully! Please login with new password.");
        window.location.href = "/login";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
                <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>

                {/* Role Toggle */}
                <div className="flex gap-3 mb-6">
                    <button
                        className={`flex-1 py-2 rounded-lg ${role === "worker"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                        onClick={() => setRole("worker")}
                    >
                        Worker
                    </button>

                    <button
                        className={`flex-1 py-2 rounded-lg ${role === "organization"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700"
                            }`}
                        onClick={() => setRole("organization")}
                    >
                        Organization
                    </button>
                </div>

                <input
                    placeholder="Phone Number"
                    className="w-full p-3 border rounded-lg mb-4"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full p-3 border rounded-lg mb-4"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <button
                    onClick={resetPassword}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
                >
                    Reset Password
                </button>
            </div>
        </div>
    );
}
