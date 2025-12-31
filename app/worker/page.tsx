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
  const { logout, user, role: contextRole, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 1. Wait for Auth to settle - GLOBAL BLOCKER
    if (authLoading) return;

    // 2. Redirect if no user - SESSION BLOCKER
    if (!user) {
      window.location.href = '/login';
      return;
    }

    // 3. HARD ROLE GUARD
    if (contextRole !== 'worker' && contextRole !== null) {
      if (contextRole === 'organization') {
        window.location.href = '/organization';
        return;
      }
      if (contextRole === 'referral') {
        window.location.href = '/referral';
        return;
      }
    }

    async function fetchProfile() {
      try {
        // 4. PREFERRED FETCH PATTERN: limit(1) instead of single()
        let { data, error } = await supabase
          .from('workers')
          .select('*')
          .eq('id', user!.id)
          .limit(1);

        let profileData = data?.[0] ?? null;

        // Self-Healing
        if (!profileData) {
          console.log("Worker Profile missing, attempting self-heal...");
          const metadata = user!.user_metadata || {};

          if (metadata.role === 'worker') {
            const { error: insertError } = await supabase.from('workers').insert({
              id: user!.id,
              name: metadata.full_name || user!.email?.split('@')[0] || "New Worker",
              email: user!.email,
              phone: (metadata.phone || "").replace(/^0+/, ""),
              age: metadata.age ? Number(metadata.age) : null,
              skills: metadata.skills ? (typeof metadata.skills === 'string' ? metadata.skills.split(',') : metadata.skills) : [],
              location: metadata.location || "",
              created_at: new Date().toISOString(),
              verified: false
            });

            if (!insertError) {
              const retry = await supabase.from('workers').select('*').eq('id', user!.id).limit(1);
              profileData = retry.data?.[0] ?? null;
            } else {
              console.error("Self-heal failed:", insertError);
            }
          }
        }

        if (error && !profileData) {
          console.error("Worker fetch error:", error);
          setFetchError(error.message);
        }

        if (profileData) {
          setProfile(profileData as unknown as WorkerProfile);
          setIsFallback(false);
        } else {
          // Fallback to Metadata
          console.warn("Using Metadata Fallback for Profile");
          const metadata = user!.user_metadata || {};
          const fallback: WorkerProfile = {
            id: user!.id,
            name: metadata.full_name || user!.email?.split('@')[0] || "Worker",
            age: Number(metadata.age) || 0,
            skills: typeof metadata.skills === 'string' ? metadata.skills.split(',').map((s: string) => s.trim()) : (metadata.skills || []),
            location: metadata.location || "",
            phone: metadata.phone || "",
          };
          setProfile(fallback);
          setIsFallback(true);
        }
      } catch (err: any) {
        console.error("Worker Dashboard Fatal:", err);
        setFetchError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [user, authLoading, contextRole, supabase]);

  // handleFailsafeLogout replaced by global hardLogout

  // 1. Loading State (Global Auth or Local Fetch)
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-blue-600 font-medium">Loading session...</p>
      </div>
    );
  }

  // 2. Error State
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <p className="text-gray-600 mb-2">Unable to load profile</p>
        <p className="text-sm text-gray-500 mb-4">Reason: {fetchError || "Unknown Session/DB Error"}</p>
        <button
          onClick={hardLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout & Retry
        </button>

        {/* DEBUG INFO */}
        <div className="mt-8 p-4 bg-gray-100 rounded text-left text-xs font-mono max-w-lg w-full overflow-auto border border-gray-300">
          <p className="font-bold border-b border-gray-300 pb-2 mb-2">Debug Information</p>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role (Metadata):</strong> {user?.user_metadata?.role || "undefined"}</p>
          <p><strong>Role (Context):</strong> {contextRole || "null"}</p>
          <p><strong>Fetch Error:</strong> {fetchError || "None"}</p>
          <p className="mt-2 text-gray-500">Share this screenshot with support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
          Welcome, {profile.name}
          {isFallback && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-300">Offline Mode</span>}
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
