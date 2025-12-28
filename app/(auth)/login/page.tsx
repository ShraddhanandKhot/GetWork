"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      // Check role and redirect
      // Note: The AuthContext listener will also trigger, but we can fast-track redirect here
      if (data.user) {
        // Fetch role to know where to redirect
        // Try Worker
        const { data: worker } = await supabase.from('workers').select('id').eq('id', data.user.id).single();
        if (worker) {
          window.location.href = "/worker";
          return;
        }

        // Try Org
        const { data: org } = await supabase.from('organizations').select('id').eq('id', data.user.id).single();
        if (org) {
          window.location.href = "/organization";
          return;
        }

        // Try Referral Partner
        const { data: partner } = await supabase.from('referral_partners').select('id').eq('id', data.user.id).single();
        if (partner) {
          // Assuming referral dashboard exists or will exist. 
          // For now maybe redirect to home or a generic dashboard? 
          // Based on conversation history, maybe it's just /referral?
          // I'll default to home if unsure, or /referral.
          // Checking user request: "referral_partners" table exists.
          window.location.href = "/referral";
          return;
        }

        // If no profile found (maybe new user or error?)
        alert("Login successful but no profile found. Please contact support.");
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
          Login to GetWork
        </h2>

        <div className="mb-4">
          <p className="text-gray-500 text-sm text-center mb-4">
            Sign in with your email and password
          </p>
        </div>

        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded-lg mb-4 placeholder-gray-600 text-gray-900"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-4 text-black">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-600 font-semibold">
            Register
          </Link>
        </p>
        <div className="text-center mt-2">
          <Link href="/forgot-password" className="text-blue-600 text-sm">
            Forgot Password?
          </Link>
        </div>

      </div>
    </div>
  );
}
