"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Job {
  id: string;
  title: string;
  description: string;
  salary_range: string;
  location: string;
  category: string;
  org_id: {
    phone: string;
  };
}

export default function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Job
      const { data: jobData, error } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          salary_range,
          location,
          category,
          org_id (
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching job:", error);
      } else {
        setJob(jobData as unknown as Job);
      }

      // 2. Check if user applied (if logged in)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: application } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', id)
          .eq('worker_id', user.id)
          .single();

        if (application) {
          setHasApplied(true);
        }
      }
    }
    fetchData();
  }, [id, supabase]);

  const handleApply = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Role check (Optional: could rely on RLS, but UI feedback is nice)
    // We can check role from context if we want, or just try insert.
    // If we assume only workers can insert into job_applications via RLS policy:

    const { error } = await supabase
      .from('job_applications')
      .insert({
        job_id: id,
        worker_id: user.id,
        status: 'pending'
      });

    if (error) {
      // Basic RLS policy might block Org or duplicate apply
      // Error code 23505 is unique violation
      if (error.code === '23505') {
        alert("You have already applied to this job.");
      } else {
        alert("Failed to apply: " + error.message);
      }
    } else {
      alert("Applied successfully!");
      setHasApplied(true);
    }
  };

  if (!job) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">{job.title}</h1>

      <div className="bg-white p-6 rounded-xl shadow text-gray-900">
        <p><strong>Location:</strong> {job.location}</p>
        <p className="mt-2"><strong className="mr-2">Salary:</strong><span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full inline-block">{job.salary_range}</span></p>
        <p><strong>Category:</strong> {job.category}</p>

        <h2 className="text-xl font-bold mt-4 mb-2">Description</h2>
        <p>{job.description}</p>

        <div className="mt-6 flex gap-4">
          <a
            href={`tel:${job.org_id?.phone}`}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Call Now
          </a>

          {/* Logic to show Apply Button */}
          {/* Note: We rely on `hasApplied` state and general user session check */}
          {hasApplied ? (
            <button
              disabled
              className="px-6 py-3 bg-gray-400 text-white rounded-lg font-semibold cursor-not-allowed"
            >
              Applied
            </button>
          ) : (
            <button
              onClick={handleApply}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
