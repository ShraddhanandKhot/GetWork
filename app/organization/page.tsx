"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { LogOut, PlusCircle } from "lucide-react";

interface Organization {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  created_at: string;
}

export default function OrganizationPage() {
  const { user, isLoading, logout } = useAuth();
  const supabase = createClient();

  const role = user?.user_metadata?.role;

  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Job modal state
  const [showPostJob, setShowPostJob] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    salary_range: "",
    location: "",
    category: "",
  });

  /* ---------------- LOAD / CREATE ORG ---------------- */
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    if (role && role !== "organization") {
      setError("Access denied");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadOrCreateOrganization = async () => {
      try {
        const { data: existing, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        if (!existing) {
          const meta = user.user_metadata || {};

          const { error: insertError } = await supabase
            .from("organizations")
            .insert({
              user_id: user.id,
              name: meta.full_name || "New Organization",
              email: user.email,
              phone: meta.phone || null,
              location: meta.location || null,
            });

          if (insertError) throw insertError;

          const { data: created } = await supabase
            .from("organizations")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!cancelled) setOrg(created);
        } else {
          if (!cancelled) setOrg(existing);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrCreateOrganization();
    return () => {
      cancelled = true;
    };
  }, [user, role, isLoading]);

  /* ---------------- POST JOB ---------------- */
  const handlePostJob = async () => {
    if (!org) return;

    const { error } = await supabase.from("jobs").insert({
      org_id: org.id, // ✅ correct org reference
      title: jobForm.title,
      description: jobForm.description,
      salary_range: jobForm.salary_range,
      location: jobForm.location,
      category: jobForm.category,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Job posted successfully!");
    setShowPostJob(false);
    setJobForm({
      title: "",
      description: "",
      salary_range: "",
      location: "",
      category: "",
    });
  };

  /* ---------------- UI STATES ---------------- */
  if (isLoading || loading) {
    return <p className="p-6">Loading organization...</p>;
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-red-600 font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!org) {
    return <p className="p-6">Organization not found</p>;
  }

  /* ---------------- DASHBOARD ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-blue-600">
            Welcome, {org.name}
          </h1>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

        <div className="space-y-2 text-gray-700">
          <p><b>Email:</b> {org.email}</p>
          <p><b>Phone:</b> {org.phone || "-"}</p>
          <p><b>Location:</b> {org.location || "-"}</p>
        </div>

        <button
          onClick={() => setShowPostJob(true)}
          className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          Post Job
        </button>
      </div>

      {/* ---------------- POST JOB MODAL ---------------- */}
      {showPostJob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow">
            <h2 className="text-xl font-bold mb-4">Post a Job</h2>

            <input
              className="w-full p-3 border rounded mb-3"
              placeholder="Job Title"
              value={jobForm.title}
              onChange={(e) =>
                setJobForm({ ...jobForm, title: e.target.value })
              }
            />

            <textarea
              className="w-full p-3 border rounded mb-3"
              placeholder="Job Description"
              value={jobForm.description}
              onChange={(e) =>
                setJobForm({ ...jobForm, description: e.target.value })
              }
            />

            <input
              className="w-full p-3 border rounded mb-3"
              placeholder="Salary Range"
              value={jobForm.salary_range}
              onChange={(e) =>
                setJobForm({ ...jobForm, salary_range: e.target.value })
              }
            />

            <input
              className="w-full p-3 border rounded mb-3"
              placeholder="Location"
              value={jobForm.location}
              onChange={(e) =>
                setJobForm({ ...jobForm, location: e.target.value })
              }
            />

            <input
              className="w-full p-3 border rounded mb-4"
              placeholder="Category"
              value={jobForm.category}
              onChange={(e) =>
                setJobForm({ ...jobForm, category: e.target.value })
              }
            />

            <div className="flex gap-3">
              <button
                onClick={handlePostJob}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
              >
                Submit
              </button>
              <button
                onClick={() => setShowPostJob(false)}
                className="flex-1 border py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
