"use client";

import { useEffect, useState } from "react";
import { Building2, MapPin, Search, Wallet, Briefcase } from "lucide-react";
import { createClient } from "../../utils/supabase/client";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  org_id: {
    name: string;
  };
  location: string;
  salary_range: string;
  category: string;
  created_at: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function loadJobs() {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          location,
          salary_range,
          category,
          created_at,
          org_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching jobs:", error);
      } else if (data) {
        // Supabase returns org_id as an array or object depending on relationship.
        // Assuming Many-to-One, it returns a single object if configured correctly,
        // but Typescript might need assertion or handling.
        // The query `org_id (name)` usually returns { org_id: { name: '...' } }
        setJobs(data as unknown as Job[]);
      }
    }

    loadJobs();
  }, [supabase]);

  const filteredJobs = jobs.filter((job) =>
    (job.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Search Bar */}
      <div className="mb-6 relative max-w-md mx-auto">
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
        <p className="text-gray-600 text-center">No jobs found.</p>
      ) : (
        filteredJobs.map((job) => (
          <div
            key={job.id}
            className="mb-6 bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Header Section */}
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-start gap-4">
              <h2 className="text-2xl font-bold text-blue-900">{job.title}</h2>
              <span className="text-lg font-semibold text-blue-800 whitespace-nowrap mt-1">
                ₹{job.salary_range}
              </span>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="mb-6 space-y-3">
                <p className="text-gray-900 font-medium flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600" />
                  <span>{job.org_id?.name || "Unknown Company"}</span>
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <MapPin size={20} className="text-gray-500" />
                  <span>{job.location}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Wallet size={20} className="text-green-600" />
                  <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm inline-block">
                    ₹{job.salary_range}
                  </span>
                </div>
                <p className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block ml-8">
                  {job.category}
                </p>
              </div>

              <Link
                href={`/jobs/${job.id}`}
                className="block w-full text-center py-3 bg-white border border-blue-200 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                View Details
              </Link>

              {job.created_at && (
                <p className="text-xs text-center text-gray-400 mt-3">
                  Posted on {new Date(job.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
