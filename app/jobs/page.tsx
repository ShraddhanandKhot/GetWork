"use client";

import { useEffect, useState } from "react";
import { Building2, MapPin, Search, Wallet } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadJobs() {
      const res = await fetch("https://getwork-backend.onrender.com/api/jobs");
      const data = await res.json();

      if (data.success) setJobs(data.jobs);
    }

    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Available Jobs</h1>

      {/* Search Bar */}
      <div className="mb-6 relative max-w-md">
        <input
          type="text"
          placeholder="Search by Title or Location..."
          className="w-full p-3 pl-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-text-gray-400 text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
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
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-start gap-4">
              <h2 className="text-2xl font-bold text-blue-900">{job.title}</h2>
              <span className="text-lg font-semibold text-blue-800 whitespace-nowrap mt-1">
                ₹{job.salaryRange}
              </span>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="mb-6 space-y-3">
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600" />
                  <span>{job.orgId.name}</span>
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <MapPin size={20} className="text-gray-500" />
                  <span>{job.location}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Wallet size={20} className="text-green-600" />
                  <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm inline-block">
                    ₹{job.salaryRange}
                  </span>
                </div>
                <p className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block ml-8">
                  {job.category}
                </p>
              </div>

              <a
                href={`/jobs/${job._id}`}
                className="block w-full text-center py-3 bg-white border border-blue-200 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
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
