"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import { hardLogout } from "@/utils/auth-helpers";
import { createClient } from "@/utils/supabase/client";

interface WorkerProfile {
  id: string;
  name: string;
  age: number;
  skills: string[];
  location: string;
  phone: string;
}

export default function WorkerDashboard() {
  const { user, role, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⛔ Wait for auth to resolve
    if (authLoading) return;

    // ⛔ Not logged in
    if (!user) {
      setLoading(false);
      window.location.href = "/login";
      return;
    }

    // ⛔ Wrong role
    if (role && role !== "worker") {
      setLoading(false);
      window.location.href = `/${role}`;
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      try {
        let { data } = await supabase
          .from("workers")
          .select("*")
          .eq("id", user.id)
          .limit(1);

        let profileData = data?.[0] ?? null;

        // 🧠 Self-heal if profile missing
        if (!profileData && user.user_metadata?.role === "worker") {
          const meta = user.user_metadata || {};

          const { error: insertError } = await supabase.from("workers").insert({
            id: user.id,
            name: meta.full_name || user.email?.split("@")[0] || "Worker",
            email: user.email,
            phone: meta.phone || "",
            age: meta.age ? Number(meta.age) : null,
            skills: typeof meta.skills === "string"
              ? meta.skills.split(",").map((s: string) => s.trim())
              : meta.skills || [],
            location: meta.location || "",
            verified: false,
          });

          if (!insertError) {
            const retry = await supabase
              .from("workers")
              .select("*")
              .eq("id", user.id)
              .limit(1);

            profileData = retry.data?.[0] ?? null;
          }
        }

        // ✅ Normal DB profile
        if (profileData && !cancelled) {
          setProfile(profileData as WorkerProfile);
          setIsFallback(false);
          return;
        }

        // 🧩 Metadata fallback
        const meta = user.user_metadata || {};
        const fallback: WorkerProfile = {
          id: user.id,
          name: meta.full_name || user.email?.split("@")[0] || "Worker",
          age: Number(meta.age) || 0,
          skills: typeof meta.skills === "string"
            ? meta.skills.split(",").map((s: string) => s.trim())
            : meta.skills || [],
          location: meta.location || "",
          phone: meta.phone || "",
        };

        if (!cancelled) {
          setProfile(fallback);
          setIsFallback(true);
        }
      } catch (err: any) {
        console.error("Worker Dashboard Error:", err);
        if (!cancelled) setFetchError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, role, supabase]);

  // 🔄 Unified loading gate
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-blue-600 font-medium">Loading session...</p>
      </div>
    );
  }

  // ❌ Failed state
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <p className="text-gray-600 mb-2">Unable to load profile</p>
        <p className="text-sm text-gray-500 mb-4">
          Reason: {fetchError || "Unknown error"}
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
          Welcome, {profile.name}
          {isFallback && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300">
              Offline Mode
            </span>
          )}
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
          <p><strong>Age:</strong> {profile.age}</p>
          <p><strong>Skills:</strong> {profile.skills.join(", ")}</p>
          <p><strong>Location:</strong> {profile.location}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
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
