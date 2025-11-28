"use client";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const sendOTP = async () => {
        const res = await fetch("https://getwork-backend.onrender.com/api/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone }),
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        alert("OTP sent successfully!");
        setStep(2);
    };


    const verifyOTP = async () => {
        const res = await fetch("https://getwork-backend.onrender.com/api/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, otp }),
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        alert("OTP verified successfully!");

        // Redirect based on role
        if (data.role === "worker") {
            window.location.href = "/worker";
        } else {
            window.location.href = "/organization";
        }
    };


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Forgot Password</h1>

            {step === 1 && (
                <>
                    <input
                        placeholder="Phone Number"
                        className="border p-2 mt-4"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <button onClick={sendOTP} className="bg-blue-600 text-white p-2 mt-3">
                        Send OTP
                    </button>
                </>
            )}

            {step === 2 && (
                <>
                    <input
                        placeholder="Enter OTP"
                        className="border p-2 mt-4"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <button
                        onClick={verifyOTP}
                        className="bg-green-600 text-white p-2 mt-3"
                    >
                        Verify OTP
                    </button>
                </>
            )}
        </div>
    );
}
