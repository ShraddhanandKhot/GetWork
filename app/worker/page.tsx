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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          Welcome, {profile.name}
        </h1>

        <button
          onClick={hardLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-3">Your Profile</h2>

        <div className="space-y-2 text-gray-600">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Age:</strong> {profile.age ?? "—"}</p>
          <p><strong>Skills:</strong> {profile.skills.join(", ") || "—"}</p>
          <p><strong>Location:</strong> {profile.location || "—"}</p>
          <p><strong>Phone:</strong> {profile.phone || "—"}</p>
        </div>

        <button
          onClick={() => (window.location.href = "/worker/edit")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
