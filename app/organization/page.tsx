"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

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
  const { logout, user } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const supabase = createClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    salary_range: "",
    location: "",
    category: "",
  });

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      // 1. Fetch Org Profile
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', user.id)
        .single();

      if (orgData) setOrg(orgData as Organization);

      // 2. Fetch Jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('org_id', user.id); // Assuming RLS allows this, or purely by ID match

      if (jobsData) setJobs(jobsData as unknown as Job[]);
    }

    fetchData();
  }, [user, supabase]);

  const postJob = async () => {
    if (!user || !org) return;

    const payload = {
      title: form.title,
      description: form.description,
      salary_range: form.salary_range,
      location: form.location,
      category: form.category,
      org_id: user.id
    };

    let error;

    if (editingJobId) {
      // Update
      const { error: updateError } = await supabase
        .from('jobs')
        .update(payload)
        .eq('id', editingJobId);
      error = updateError;
    } else {
      // Create
      const { error: insertError } = await supabase
        .from('jobs')
        .insert(payload);
      error = insertError;
    }

    if (error) {
      alert("Failed to save job: " + error.message);
    } else {
      alert(editingJobId ? "Job updated!" : "Job posted!");
      setShowPostForm(false);
      setEditingJobId(null);
      setForm({ title: "", description: "", salary_range: "", location: "", category: "" });

      // Refresh Jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('org_id', user.id);
      if (jobsData) setJobs(jobsData as unknown as Job[]);
    }
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    const { error } = await supabase.from('jobs').delete().eq('id', id);

    if (error) {
      alert("Failed to delete: " + error.message);
    } else {
      alert("Job deleted");
      setJobs(jobs.filter((job) => job.id !== id));
    }
  };

  const startEdit = (job: Job) => {
    setShowPostForm(true);
    setEditingJobId(job.id);
    setForm({
      title: job.title,
      description: job.description || "",
      salary_range: job.salary_range || "",
      location: job.location,
      category: job.category || "",
    });
  };

  const handleFailsafeLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (!org) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-600 mb-4">Loading Organization Profile...</p>
        <button
          onClick={handleFailsafeLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          Welcome, {org.name}
        </h1>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* ORG DETAILS */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold text-black">Organization Details</h2>

        <div className="mt-3 space-y-2 text-gray-700">
          <p><strong>Name:</strong> {org.name}</p>
          <p><strong>Location:</strong> {org.location}</p>
          <p><strong>Phone:</strong> {org.phone}</p>
          <p><strong>Email:</strong> {org.email}</p>
        </div>
      </div>

      {/* JOB SECTION */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Your Posted Jobs</h2>

          <button
            onClick={() => {
              setForm({ title: "", description: "", salary_range: "", location: "", category: "" });
              setEditingJobId(null);
              setShowPostForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            + Post New Job
          </button>
        </div>

        {!Array.isArray(jobs) || jobs.length === 0 ? (
          <p className="text-gray-600">No jobs posted yet.</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="p-3 border rounded-lg mb-3">
              <h3 className="font-bold text-gray-600">{job.title}</h3>
              <p className="text-sm text-gray-600">{job.location}</p>
              <p className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full inline-block text-sm">{job.salary_range}</p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => startEdit(job)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteJob(job.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* JOB POST FORM */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-400">{editingJobId ? "Edit Job" : "Post New Job"}</h2>

            <input
              className="w-full p-3 border rounded-lg mb-3 placeholder:text-gray-400 text-gray-600"
              placeholder="Job Title"
              list="job-titles"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <datalist id="job-titles">
              <option value="Cleaning" />
              <option value="Sweeper" />
              <option value="Cook" />
              <option value="Driver" />
              <option value="Gardener" />
              <option value="Nanny" />
              <option value="Security Guard" />
              <option value="Other" />
            </datalist>

            <input
              className="w-full p-3 border rounded-lg mb-3 placeholder:text-gray-400 text-gray-600"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <input
              type="text"
              className="w-full p-3 border rounded-lg mb-3 placeholder:text-gray-400 text-gray-600"
              placeholder="Salary (e.g. 5000-10000)"
              value={form.salary_range}
              onChange={(e) =>
                setForm({ ...form, salary_range: e.target.value })
              }
            />

            <input
              className="w-full p-3 border rounded-lg mb-3 placeholder:text-gray-400 text-gray-600"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <textarea
              className="w-full p-3 border rounded-lg mb-3 placeholder:text-gray-400 text-gray-600"
              placeholder="Description"
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <button
              onClick={postJob}
              className="w-full py-3 bg-blue-600 text-white rounded-lg mb-2"
            >
              {editingJobId ? "Update Job" : "Post Job"}
            </button>

            <button
              className="w-full py-3 bg-gray-400 text-white rounded-lg"
              onClick={() => setShowPostForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
