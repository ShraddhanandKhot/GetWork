"use client";
import { useState } from "react";

export default function LoginPage() {
  const [role, setRole] = useState("worker");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const endpoint =
      role === "worker"
        ? "http://localhost:5000/api/worker/login"
        : "http://localhost:5000/api/org/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      // Save token to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", role === "worker" ? data.user.name : data.org.name);

      alert("Login Successful!");

      // Redirect based on role
      if (role === "worker") {
        window.location.href = "/worker";
      } else {
        window.location.href = "/organization";
      }

    } catch (err) {
      alert("Server not reachable");
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-600">
          Login to GetWork
        </h2>

        <div className="flex gap-3 mb-6">
          <button
            className={`flex-1 py-2 rounded-lg ${
              role === "worker"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setRole("worker")}
          >
            Worker
          </button>

          <button
            className={`flex-1 py-2 rounded-lg ${
              role === "organization"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setRole("organization")}
          >
            Organization
          </button>
        </div>

        <input
          type="text"
          placeholder="Phone Number"
          className="w-full p-3 border rounded-lg mb-4"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          onClick={handleLogin}
        >
          Login
        </button>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <a href="/register" className="text-green-600 font-semibold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
