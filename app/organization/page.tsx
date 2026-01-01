"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";
import { hardLogout } from "@/utils/auth-helpers";

interface Organization {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
}

interface Job {
  id: string;
  title: string;
  location: string;
  salary_range: string;
}

export default function OrganizationDashboard() {
  const { user, role } = useAuth();
  const supabase = createClient();

  const [org, setOrg] = useState<Organization | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔍 DEBUG SESSION (ONCE)
    const debugSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log("SESSION USER:", data.user);
      console.log("SESSION ERROR:", error);
    };

    debugSession();

    // ⛔ Not logged in
    if (!user) {
      setLoading(false);
      return;
    }

    // ⛔ Wrong role
    if (role && role !== "organization") {
      window.location.href = `/${role}`;
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        // ✅ Fetch organization
        const { data, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        console.log("ORG FETCH:", data, error);

        let orgData = data;

        // 🧠 Self-heal if missing
        if (!orgData && user.user_metadata?.role === "organization") {
          const { error: insertError } = await supabase
            .from("organizations")
            .insert({
              id: user.id, // MUST match auth.uid()
              name: user.user_metadata.full_name || "Organization",
              email: user.email,
              phone: user.user_metadata.phone || "",
              location: user.user_metadata.location || "",
            });

          console.log("ORG INSERT ERROR:", insertError);

          const retry = await supabase
            .from("organizations")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          orgData = retry.data;
        }

        if (!cancelled) setOrg(orgData);

        // ✅ Fetch jobs
        const { data: jobsData } = await supabase
          .from("jobs")
          .select("*")
          .eq("org_id", user.id);

        if (!cancelled) setJobs(jobsData || []);
      } catch (err) {
        console.error("Organization dashboard error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user, role]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-600 font-medium">Loading organization…</p>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <p className="mb-2 text-red-600 font-semibold">
          Organization profile not found
        </p>
        <button
          onClick={hardLogout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Welcome, {org.name}</h1>
        <button
          onClick={hardLogout}
          className="flex items-center gap-2 text-red-600"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div className="bg-white p-4 rounded mb-6">
        <p><b>Email:</b> {org.email}</p>
        <p><b>Location:</b> {org.location}</p>
        <p><b>Phone:</b> {org.phone}</p>
      </div>

      <div className="bg-white p-4 rounded">
        <h2 className="font-bold mb-3">Your Jobs</h2>
        {jobs.length === 0 ? (
          <p>No jobs posted yet.</p>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="border p-3 mb-2 rounded">
              <p className="font-semibold">{job.title}</p>
              <p>{job.location}</p>
              <p className="text-green-600">{job.salary_range}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
