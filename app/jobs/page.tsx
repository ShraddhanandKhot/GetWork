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
            className="p-4 mb-4 bg-white shadow rounded-lg border"
          >
            <h2 className="text-xl font-semibold text-gray-700">{job.title}</h2>
            <p className="text-gray-700">{job.orgId.name}</p>
            <p className="text-gray-700">{job.location}</p>
            <p className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full inline-block mt-2">₹{job.salaryRange}</p>
            <p className="text-sm text-gray-500">{job.category}</p>

            <a
              href={`/jobs/${job._id}`}
              className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              View Details
            </a>
          </div>
        ))
      )}
    </div>
  );
}
