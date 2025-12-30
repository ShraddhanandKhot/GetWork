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
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      let { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', user.id)
        .single();

      // Self-Healing: If profile missing, create it from metadata
      if (!data) {
        console.log("Worker Profile missing, attempting self-heal...");
        const metadata = user.user_metadata || {};
        const intendedRole = metadata.role || 'worker';

        if (intendedRole === 'organization') {
          window.location.href = '/organization';
          return;
        }
        if (intendedRole === 'referral') {
          window.location.href = '/referral';
          return;
        }

        if (intendedRole === 'worker') {
          const { error: insertError } = await supabase.from('workers').insert({
            id: user.id,
            name: metadata.full_name || user.email?.split('@')[0] || "New Worker",
            email: user.email,
            phone: (metadata.phone || "").replace(/^0+/, ""),
            age: metadata.age ? Number(metadata.age) : null,
            skills: metadata.skills ? (typeof metadata.skills === 'string' ? metadata.skills.split(',') : metadata.skills) : [],
            location: metadata.location || "",
            created_at: new Date().toISOString(),
            verified: false
          });

          if (insertError) {
            console.error("Self-heal failed:", insertError);
          } else {
            // Retry fetch
            const retry = await supabase.from('workers').select('*').eq('id', user.id).single();
            data = retry.data;
            error = retry.error;

            // Force reload to sync AuthContext role if needed
            if (data) {
              window.location.reload();
              return;
            }
          }
        }
      }

      if (error) {
        console.error("Error fetching profile:", error);
        setFetchError(error.message);
      } else if (data) {
        setProfile(data as unknown as WorkerProfile);
      }
    }

    fetchProfile();
  }, [user, supabase]);

  // handleFailsafeLogout replaced by global hardLogout

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <p className="text-gray-600 mb-2">Unable to load profile</p>
        {fetchError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">Error: {fetchError}</p>}
        <button
          onClick={hardLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout & Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          Welcome, {profile.name}
        </h1>
        <button
          onClick={hardLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>


      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Your Profile
        </h2>

        <div className="space-y-2 text-gray-600">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Age:</strong> {profile.age}</p>
          <p><strong>Skills:</strong> {profile.skills?.join(", ")}</p>
          <p><strong>Location:</strong> {profile.location}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
        </div>

        <button
          onClick={() => window.location.href = "/worker/edit"}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
