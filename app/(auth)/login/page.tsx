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
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setLoading(false);
        return;
      }

      // Check user metadata for role
      const metadata = user.user_metadata || {};
      const role = metadata.role || 'worker'; // Default to worker if unknown

      // Attempt to find existing profile
      let profileExists = false;

      if (role === 'worker') {
        const { data: worker } = await supabase.from('workers').select('id').eq('id', user.id).single();
        if (worker) profileExists = true;
      } else if (role === 'organization') {
        const { data: org } = await supabase.from('organizations').select('id').eq('id', user.id).single();
        if (org) profileExists = true;
      } else if (role === 'referral') {
        const { data: partner } = await supabase.from('referral_partners').select('id').eq('id', user.id).single();
        if (partner) profileExists = true;
      }

      // If profile does NOT exist, create it now (Lazy Creation)
      if (!profileExists) {
        console.log("Profile missing, creating now from metadata...");

        let createError = null;

        if (role === 'worker') {
          const { error: err } = await supabase.from("workers").insert({
            id: user.id,
            name: metadata.full_name || "",
            email: user.email,
            phone: (metadata.phone || "").replace(/^0+/, ""),
            age: metadata.age ? Number(metadata.age) : null,
            skills: metadata.skills ? metadata.skills.split(",").map((s: string) => s.trim()) : [],
            location: metadata.location || "",
            created_at: new Date().toISOString(),
            verified: false
          });
          createError = err;
        } else if (role === 'organization') {
          const { error: err } = await supabase.from("organizations").insert({
            id: user.id,
            name: metadata.full_name || "", // Register page uses 'name' which maps to full_name in metadata logic I just wrote
            email: user.email,
            phone: (metadata.phone || "").replace(/^0+/, ""),
            location: metadata.location || "",
            created_at: new Date().toISOString(),
            verified: false
          });
          createError = err;
        } else if (role === 'referral') {
          const { error: err } = await supabase.from("referral_partners").insert({
            id: user.id,
            name: metadata.full_name || "",
            email: user.email,
            phone: (metadata.phone || "").replace(/^0+/, "")
          });
          createError = err;
        }

        if (createError) {
          console.error("Failed to create missing profile:", createError);
          alert("Login successful, but failed to initialize profile: " + createError.message);
          setLoading(false);
          return;
        }
      }

      // Redirect based on role
      if (role === 'worker') {
        router.push("/worker");
      } else if (role === 'organization') {
        router.push("/organization");
      } else if (role === 'referral') {
        router.push("/referral");
      } else {
        router.push("/");
      }

    } catch (err) {
      alert("Something went wrong");
      console.error(err);
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
