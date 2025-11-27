"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      alert("Please enter Phone/Email and Password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("https://getwork-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        if (data.user.isProfileComplete) {
          // Redirect based on role
          if (data.user.role === "worker") {
            router.push("/worker");
          } else if (data.user.role === "organization") {
            router.push("/organization");
          } else {
            router.push("/"); // Fallback
          }
        } else {
          router.push("/onboarding");
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      alert("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Welcome Back
        </h2>

        <input
          type="text"
          placeholder="Phone Number or Email"
          className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-4 text-black">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 font-semibold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
