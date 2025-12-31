"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
  description?: string;
  category?: string;
}

export default function OrganizationDashboard() {
  const { user, role, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const [org, setOrg] = useState<Organization | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (role && role !== "organization") {
      window.location.href = `/${role}`;
      return;
    }

    const load = async () => {
      // Fetch org
      const { data } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", user.id)
        .limit(1);

      let orgData = data?.[0] ?? null;

      // Self-heal
      if (!orgData && user.user_metadata?.role === "organization") {
        await supabase.from("organizations").insert({
          id: user.id,
          name: user.user_metadata.full_name || "Organization",
          email: user.email,
          phone: user.user_metadata.phone || "",
          location: user.user_metadata.location || "",
          verified: false,
        });

        const retry = await supabase
          .from("organizations")
          .select("*")
          .eq("id", user.id)
          .limit(1);

        orgData = retry.data?.[0] ?? null;
      }

      setOrg(orgData);

      // Fetch jobs
      const { data: jobsData } = await supabase
        .from("jobs")
        .select("*")
        .eq("org_id", user.id);

      setJobs(jobsData || []);
      setLoading(false);
    };

    load();
  }, [authLoading, user, role]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-600 font-medium">Loading session…</p>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4">Unable to load organization</p>
        <button onClick={hardLogout} className="bg-red-600 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Welcome, {org.name}</h1>
        <button onClick={hardLogout} className="flex items-center gap-2 text-red-600">
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
