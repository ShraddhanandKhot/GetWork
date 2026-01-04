"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/* ---------- TYPES ---------- */

interface Organization {
  id: string;
  user_id: string;
  phone: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  salary_range: string;
  location: string;
  category: string;
  org: Organization;
}

/* ---------- PAGE ---------- */

export default function JobDetails({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params; // ✅ CORRECT
  const [job, setJob] = useState<Job | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  /* ---------- FETCH ---------- */

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          description,
          salary_range,
          location,
          category,
          org_id (
            id,
            user_id,
            phone
          )
        `)
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching job:", error);
        return;
      }

      const org = data.org_id?.[0];
      if (!org) return;

      setJob({
        id: data.id,
        title: data.title,
        description: data.description,
        salary_range: data.salary_range,
        location: data.location,
        category: data.category,
        org,
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: application } = await supabase
          .from("job_applications")
          .select("id")
          .eq("job_id", id)
          .eq("worker_id", user.id)
          .single();

        if (application) setHasApplied(true);
      }
    };

    fetchData();
  }, [id, supabase]);

  /* ---------- APPLY ---------- */

  const handleApply = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!job) return;

    const { error } = await supabase.from("job_applications").insert({
      job_id: job.id,
      worker_id: user.id,
      status: "pending",
    });

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from("notifications").insert([
      {
        recipient_id: user.id,
        recipient_role: "worker",
        message: `You applied for "${job.title}"`,
        type: "application",
        related_job_id: job.id,
      },
      {
        recipient_id: job.org.user_id,
        recipient_role: "organization",
        message: `${user.user_metadata?.full_name || "A worker"
          } applied for "${job.title}"`,
        type: "application",
        related_job_id: job.id,
      },
    ]);

    setHasApplied(true);
  };

  /* ---------- UI ---------- */

  if (!job) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading job details…
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        {job.title}
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <p><strong>Location:</strong> {job.location}</p>
        <p className="mt-2"><strong>Salary:</strong> {job.salary_range}</p>
        <p><strong>Category:</strong> {job.category}</p>

        <h2 className="text-xl font-bold mt-4 mb-2">Description</h2>
        <p>{job.description}</p>

        <div className="mt-6 flex gap-4">
          <a
            href={`tel:${job.org.phone}`}
            className="px-6 py-3 bg-green-600 text-white rounded-lg"
          >
            Call Now
          </a>

          {hasApplied ? (
            <button disabled className="px-6 py-3 bg-gray-400 text-white rounded-lg">
              Applied
            </button>
          ) : (
            <button
              onClick={handleApply}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
