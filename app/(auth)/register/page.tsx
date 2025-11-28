"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [role, setRole] = useState("worker");

  // Worker fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");

  // Common fields
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const endpoint =
      role === "worker"
        ? "https://getwork-backend.onrender.com/api/worker/register"
        : "https://getwork-backend.onrender.com/api/org/register";

    const body =
      role === "worker"
        ? {
          name,
          age: Number(age),
          skills: skills.split(",").map((s) => s.trim()),
          location,
          phone,
          email,
          password,
        }
        : {
          name,
          location,
          phone,
          email,
          password,
        };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      alert(data.message);

      if (data.success) {
        window.location.href = "/login";
      }
    } catch (err) {
      alert("Server not reachable");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Create Account
        </h2>

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

        {role === "worker" && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Age"
              className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />

            <input
              type="text"
              placeholder="Skills (Cleaning, Cooking...)"
              className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />

            <input
              type="text"
              placeholder="Location"
              className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </>
        )}

        {role === "organization" && (
          <>
            <input
              type="text"
              placeholder="Organization Name"
              className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Location"
              className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </>
        )}

        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone Number"
          className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-green-700"
          onClick={handleRegister}
        >
          Register
        </button>

        <p className="text-center mt-4 text-black">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
