"use client";
import { useEffect, useState } from "react";
import Notifications from "../components/Notifications";

interface Organization {
  name: string;
  location: string;
  phone: string;
  email: string;
}

interface Job {
  _id: string;
  title: string;
  location: string;
  salaryRange: string;
}

type JobType = {
  _id: string;
  title: string;
  location?: string;
  salaryRange?: string;
  description?: string;
  category?: string;
};


export default function OrganizationDashboard() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);



  const [form, setForm] = useState({
    title: "",
    description: "",
    salaryRange: "",
    location: "",
    category: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "organization") {
      window.location.href = "/login";
      return;
    }

    async function fetchOrg() {
      const res = await fetch(
        "https://getwork-backend.onrender.com/api/org/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setOrg(data.org);
    }

    async function fetchJobs() {
      const res = await fetch(
        "https://getwork-backend.onrender.com/api/jobs/my-jobs",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setJobs(data.jobs);
    }

    fetchOrg();
    fetchJobs();
  }, []);

  const postJob = async () => {
    const token = localStorage.getItem("token");

    const url = editingJobId
      ? `https://getwork-backend.onrender.com/api/jobs/${editingJobId}`
      : `https://getwork-backend.onrender.com/api/jobs/create-job`;

    const method = editingJobId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      setShowPostForm(false);
      setEditingJobId(null);

      // refresh job list
      const jobsRes = await fetch(
        `https://getwork-backend.onrender.com/api/jobs/my-jobs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const jobsData = await jobsRes.json();
      setJobs(jobsData.jobs);
    }
  };

  const deleteJob = async (id: string) => {
    const token = localStorage.getItem("token");

    if (!confirm("Are you sure you want to delete this job?")) return;

    const res = await fetch(
      `https://getwork-backend.onrender.com/api/jobs/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    alert(data.message);

    if (data.success) {
      setJobs(jobs.filter((job) => job._id !== id));
    }
  };

  const startEdit = (job: JobType) => {
    setShowPostForm(true);
    setEditingJobId(job._id);
    setForm({
      title: job.title,
      description: job.description || "",
      salaryRange: job.salaryRange || "",
      location: job.location || "",
      category: job.category || "",
    });

  };


  if (!org) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Welcome, {org.name}
      </h1>

      <Notifications />

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
            onClick={() => setShowPostForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            + Post New Job
          </button>
        </div>

        {!Array.isArray(jobs) || jobs.length === 0 ? (
          <p className="text-gray-600">No jobs posted yet.</p>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="p-3 border rounded-lg mb-3">
              <h3 className="font-bold text-gray-600">{job.title}</h3>
              <p className="text-sm text-gray-600">{job.location}</p>
              <p className="text-sm text-gray-700">{job.salaryRange}</p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => startEdit(job)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteJob(job._id)}
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
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-400">Post New Job</h2>

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
              type="number"
              className="w-full p-3 border rounded-lg mb-3 placeholder:text-gray-400 text-gray-600"
              placeholder="Salary (Amount)"
              value={form.salaryRange}
              onChange={(e) =>
                setForm({ ...form, salaryRange: e.target.value })
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
              Post Job
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
