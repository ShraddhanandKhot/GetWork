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
  const [jobs, setJobs] = useState<any[]>([]); // New state for jobs
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

        let currentOrg = existing;

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

          currentOrg = created;
        }

        if (!cancelled && currentOrg) {
          setOrg(currentOrg);
          // Fetch jobs for this organization
          const { data: orgJobs, error: jobsError } = await supabase
            .from("jobs")
            .select("*")
            .eq("org_id", currentOrg.id)
            .order("created_at", { ascending: false });

          if (!jobsError && orgJobs) {
            setJobs(orgJobs);
          }
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

    // Refresh jobs list
    const { data: newJobs } = await supabase
      .from("jobs")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });

    if (newJobs) setJobs(newJobs);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-red-600 font-bold mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
        <button onClick={logout} className="mt-4 text-blue-600 underline">Logout</button>
      </div>
    );
  }

  if (!org) {
    return <p className="p-6">Organization not found</p>;
  }

  /* ---------------- DASHBOARD ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {org.name}
              </h1>
              <p className="text-gray-500 text-sm">Organization Dashboard</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowPostJob(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <PlusCircle size={18} />
                Post Job
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
            <div>
              <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">Email</span>
              <span className="text-gray-700">{org.email}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">Phone</span>
              <span className="text-gray-700">{org.phone || "-"}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">Location</span>
              <span className="text-gray-700">{org.location || "-"}</span>
            </div>
          </div>
        </div>

        {/* Jobs Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Posted Jobs</h2>

          {jobs.length === 0 ? (
            <div className="bg-white p-10 rounded-xl text-center border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">You haven't posted any jobs yet.</p>
              <button
                onClick={() => setShowPostJob(true)}
                className="text-blue-600 font-medium hover:underline"
              >
                Post your first job now
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                    <div className="flex gap-4 mt-1 text-sm text-gray-500">
                      {job.location && <span>📍 {job.location}</span>}
                      {job.salary_range && <span>💰 {job.salary_range}</span>}
                      <span>📅 {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/jobs/${job.id}/edit`}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                      Edit
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------------- POST JOB MODAL ---------------- */}
      {showPostJob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Post a New Job</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Senior Electrician"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[100px]"
                  placeholder="Describe the role and requirements..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                  <input
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g. ₹15k - ₹25k"
                    value={jobForm.salary_range}
                    onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g. Mumbai"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Construction"
                  value={jobForm.category}
                  onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPostJob(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePostJob}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Post Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
