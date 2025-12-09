"use client";

import { useEffect, useState } from "react";

interface Job {
  _id: string;
  title: string;
  orgId: {
    name: string;
  };
  location: string;
  salaryRange: string;
  category: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchLocation, setSearchLocation] = useState("");

  useEffect(() => {
    async function loadJobs() {
      const res = await fetch("https://getwork-backend.onrender.com/api/jobs");
      const data = await res.json();

      if (data.success) setJobs(data.jobs);
    }

    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.location.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Available Jobs</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Location..."
          className="w-full max-w-md p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-text-gray-400 text-gray-700"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
      </div>

      {filteredJobs.length === 0 ? (
        <p className="text-gray-600">No jobs found.</p>
      ) : (
        filteredJobs.map((job) => (
          <div
            key={job._id}
            className="mb-6 bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Header Section */}
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
              <h2 className="text-2xl font-bold text-blue-900">{job.title}</h2>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="mb-6 space-y-3">
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <span className="text-blue-600">Company:</span> {job.orgId.name}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <span className="text-gray-400">Location:</span> {job.location}
                </p>
                <div>
                  <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm inline-block">
                    ₹{job.salaryRange}
                  </span>
                </div>
                <p className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">
                  {job.category}
                </p>
              </div>

              <a
                href={`/jobs/${job._id}`}
                className="block w-full text-center py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Details
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
