"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [role, setRole] = useState("worker");
  const router = useRouter();
  const supabase = createClient();

  // Worker fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");

  // Common fields (Phone is just a field now, Email is Auth)
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);

    try {
      // 1. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            full_name: name,
          },
        },
      });

      if (authError) {
        alert(authError.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        // 2. Insert into Public Table
        let error = null;

        if (role === "worker") {
          const { error: workerError } = await supabase.from("workers").insert({
            id: authData.user.id,
            name,
            age: age ? Number(age) : null,
            skills: skills.split(",").map((s) => s.trim()),
            location,
            phone: phone.replace(/^0+/, ""),
            email,
            created_at: new Date().toISOString(),
            verified: false
          });
          error = workerError;
        } else {
          const { error: orgError } = await supabase.from("organizations").insert({
            id: authData.user.id,
            name,
            location,
            phone: phone.replace(/^0+/, ""),
            email,
            created_at: new Date().toISOString(),
            verified: false
          });
          error = orgError;
        }

        if (error) {
          console.error("Profile creation failed:", error);
          alert("Account created but profile setup failed: " + error.message);
          // Optional: delete the user if profile creation fails? or let them try again?
        } else {
          alert("Registration Successful!");
          router.push("/login");
        }
      }

    } catch (err) {
      alert("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
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
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="text-center mt-4 text-black">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
