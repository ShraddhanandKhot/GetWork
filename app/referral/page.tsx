"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function ReferralPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginRole, setLoginRole] = useState<"referral" | "worker">("referral");

  // Login State
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    const endpoint =
      loginRole === "worker"
        ? "https://getwork-backend.onrender.com/api/worker/login"
        : "https://getwork-backend.onrender.com/api/referral/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Login failed");
        return;
      }

      // If worker logs in here, we treat them as 'referral' role for the session
      // to hide the worker dashboard.
      const sessionRole = "referral";

      // Save token and forced role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", sessionRole);

      // Update context
      login(data.token, sessionRole);

      alert("Login Successful as Referral!");
      // Stay on page or redirect if needed. For now, maybe just refresh or show referral dashboard content?
      // The requirement says "worker dashboard should not display there".
      // We are already on the referral page, so we might want to show a "Referral Dashboard" view here eventually.
      // For now, we'll just reload or keep them here.
      router.refresh();

    } catch (err) {
      console.error(err);
      alert("Server error during login");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("https://getwork-backend.onrender.com/api/referral/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Registration Successful! Please login.");
        setActiveTab("login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error during registration");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">

        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Referral Program
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us and earn rewards by referring workers.
          </p>
        </div>

        {/* Tabs */}
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

        {/* Login Form */}
        {activeTab === "login" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="loginRole"
                    value="referral"
                    checked={loginRole === "referral"}
                    onChange={() => setLoginRole("referral")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">Referral Partner</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="loginRole"
                    value="worker"
                    checked={loginRole === "worker"}
                    onChange={() => setLoginRole("worker")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">Worker</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="login-phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="login-phone"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Phone Number"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="sr-only">
                Password
              </label>
              <input
                id="login-password"
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
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          </div>
        )}

        {/* Register Form */}
        {activeTab === "register" && (
          <div className="space-y-6">
            <div>
              <label htmlFor="reg-name" className="sr-only">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-3"
                placeholder="Full Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="sr-only">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-3"
                placeholder="Email address"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reg-phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="reg-phone"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-3"
                placeholder="Phone Number"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="sr-only">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>

            <button
              onClick={handleRegister}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Register as Referral
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
