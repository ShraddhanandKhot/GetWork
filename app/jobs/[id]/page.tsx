"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Job {
  _id: string;
  title: string;
  description: string;
  salaryRange: string;
  location: string;
  category: string;
  orgId: {
    phone: string;
  };
}

export default function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchJob() {
      const res = await fetch(`https://getwork-backend.onrender.com/api/jobs/${id}`);
      const data = await res.json();
      if (data.success) setJob(data.job);
    }
    fetchJob();
  }, [id]);

  if (!job) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">{job.title}</h1>

      <div className="bg-white p-6 rounded-xl shadow text-gray-900">
        <p><strong>Location:</strong> {job.location}</p>
        <p><strong>Salary:</strong> {job.salaryRange}</p>
        <p><strong>Category:</strong> {job.category}</p>

        <h2 className="text-xl font-bold mt-4 mb-2">Description</h2>
        <p>{job.description}</p>

        <div className="mt-6 flex gap-4">
          <a
            href={`tel:${job.orgId?.phone}`}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Call Now
          </a>

          {/* Only show Apply button if not an organization (or if not logged in, let them click to login) */}
          {typeof window !== 'undefined' && localStorage.getItem("role") !== "organization" ? (
            <button
              onClick={async () => {
                const token = localStorage.getItem("token");
                if (!token) {
                  router.push("/login");
                  return;
                }

                try {
                  const res = await fetch(`https://getwork-backend.onrender.com/api/jobs/${id}/apply`, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  const data = await res.json();
                  alert(data.message);
                } catch (err) {
                  console.error(err);
                  alert("Failed to apply");
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Apply Now
            </button>
          ) : (
            localStorage.getItem("role") === "organization" && (
              <p className="text-red-500 font-semibold self-center">Organizations cannot apply</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
