"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Action, 4: Reset Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // State to hold data from verification
    const [state, setState] = useState({
        token: "",
        role: "",
        name: ""
    });

    // Step 1: Send OTP
    const handleSendOtp = async () => {
        if (!email) {
            alert("Please enter your registered email");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("https://getwork-backend.onrender.com/api/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                alert("OTP sent to your email!");
                setStep(2);
            } else {
                alert(data.message || "Failed to send OTP");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        if (!otp) {
            alert("Please enter the OTP");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("https://getwork-backend.onrender.com/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (data.success) {
                // Store state
                setState({
                    token: data.token,
                    role: data.role,
                    name: data.name
                });

                alert("OTP Verified Successfully!");
                setStep(3);
            } else {
                alert(data.message || "Invalid OTP");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Step 3 Actions
    const handleLogin = () => {
        if (!state.token || !state.role) return;

        // Match LoginPage behavior
        if (state.name) {
            localStorage.setItem("name", state.name);
        }
        login(state.token, state.role);

        // Redirect based on role (matched from LoginPage behavior)
        if (state.role === "worker") {
            window.location.href = "/worker";
        } else {
            window.location.href = "/organization";
        }
    };

    const handleGoToReset = () => {
        setStep(4);
    };

    // Step 4: Reset Password
    const handleResetPassword = async () => {
        if (!newPassword) {
            alert("Please enter a new password");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("https://getwork-backend.onrender.com/api/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${state.token}`
                },
                body: JSON.stringify({ newPassword }),
            });
            const data = await res.json();
            if (data.success) {
                alert("Password reset successfully! Logging you in...");
                handleLogin(); // Auto login after reset
            } else {
                alert(data.message || "Failed to reset password");
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
                    {step === 1 && "Forgot Password"}
                    {step === 2 && "Enter OTP"}
                    {step === 3 && "Verified"}
                    {step === 4 && "Reset Password"}
                </h1>

                {/* Step 1: Email Input */}
                {step === 1 && (
                    <div>
                        <p className="text-gray-600 mb-4 text-center">
                            Enter your registered email address to receive an OTP.
                        </p>
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </div>
                )}

                {/* Step 2: OTP Input */}
                {step === 2 && (
                    <div>
                        <p className="text-gray-600 mb-4 text-center">
                            Enter the OTP sent to <strong>{email}</strong>
                        </p>
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none text-center text-lg tracking-widest"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </div>
                )}

                {/* Step 3: Selection (Login or Reset) */}
                {step === 3 && (
                    <div className="flex flex-col gap-4">
                        <p className="text-green-600 font-medium text-center mb-2">
                            Identity verified! What would you like to do?
                        </p>
                        <button
                            onClick={handleLogin}
                            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
                        >
                            Login Directly
                        </button>
                        <button
                            onClick={handleGoToReset}
                            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Reset Password
                        </button>
                    </div>
                )}

                {/* Step 4: Reset Password Form */}
                {step === 4 && (
                    <div>
                        <p className="text-gray-600 mb-4 text-center">
                            Create a new password for your account.
                        </p>
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                            onClick={handleResetPassword}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {loading ? "Resetting..." : "Set New Password"}
                        </button>
                    </div>
                )}

                {step === 1 && (
                    <p className="mt-4 text-center text-sm text-gray-500">
                        Remember your password? <a href="/login" className="text-blue-600 hover:underline">Login</a>
                    </p>
                )}
            </div>
        </div>
    );
}
