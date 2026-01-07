"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import { hardLogout } from "@/utils/auth-helpers";
import { createClient } from "@/utils/supabase/client";

interface WorkerProfile {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  skills: string[];
  location: string | null;
  phone: string | null;
}

export default function WorkerDashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const role = user?.user_metadata?.role;

  const supabase = createClient();

  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    // 🚨 Only block if role is known AND wrong
    if (role && role !== "worker") {
      window.location.href = `/${role}`;
      return;
    }

    let cancelled = false;

    const loadOrCreateProfile = async () => {
      try {
        // 1️⃣ Fetch worker
        const { data: existing, error } = await supabase
          .from("workers")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        // 2️⃣ Create if missing
        if (!existing) {
          const meta = user.user_metadata || {};

          const { error: insertError } = await supabase.from("workers").insert({
            user_id: user.id,
            name: meta.full_name || "Worker",
            email: user.email,
            phone: meta.phone || null,
            age: meta.age ? Number(meta.age) : null,
            skills: meta.skills
              ? Array.isArray(meta.skills)
                ? meta.skills
                : meta.skills.split(",").map((s: string) => s.trim())
              : [],
            location: meta.location || null,
            verified: false,
          });

          if (insertError) throw insertError;

          // 3️⃣ Fetch newly created profile
          const { data: created, error: retryError } = await supabase
            .from("workers")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (retryError) throw retryError;

          if (!cancelled) setProfile(created);
        } else {
          if (!cancelled) setProfile(existing);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrCreateProfile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, role]);

  /* ---------- UI STATES ---------- */

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-blue-600 font-medium">Loading profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <p className="text-gray-600 mb-2">Unable to load profile</p>
        <p className="text-sm text-gray-500 mb-4">
          Reason: {error || "Unknown error"}
        </p>
        <button
          onClick={hardLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout & Retry
        </button>
      </div>
    );
  }

  /* ---------- DASHBOARD ---------- */

  /* ---------- DASHBOARD ---------- */

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-blue-100 font-medium mb-1">Welcome back,</p>
              <h1 className="text-4xl font-bold tracking-tight">
                {profile.name}
              </h1>
              <p className="text-blue-100 text-sm mt-2 opacity-90 flex items-center gap-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-semibold">Worker</span>
                Dashboard
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button
                onClick={() => (window.location.href = "/worker/edit")}
                className="flex items-center justify-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-sm w-full sm:w-auto"
              >
                Edit Profile
              </button>
              <button
                onClick={hardLogout}
                className="flex items-center justify-center gap-2 px-6 py-3 text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition backdrop-blur-sm w-full sm:w-auto"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8 mt-8 border-t border-white/20 relative z-10">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <span className="block text-xs text-blue-200 uppercase tracking-wider font-semibold mb-1">Age</span>
              <span className="text-white font-medium">{profile.age ?? "—"}</span>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm md:col-span-2">
              <span className="block text-xs text-blue-200 uppercase tracking-wider font-semibold mb-1">Skills</span>
              <span className="text-white font-medium">{profile.skills.join(", ") || "—"}</span>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <span className="block text-xs text-blue-200 uppercase tracking-wider font-semibold mb-1">Location</span>
              <span className="text-white font-medium">{profile.location || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
