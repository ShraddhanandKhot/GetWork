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
    id: string;
    user_id: string;
    phone: string;
  }[];
}

export default function JobDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  /* ---------------- FETCH JOB + CHECK APPLY ---------------- */
  useEffect(() => {
    async function fetchData() {
      // 1️⃣ Fetch Job
      const { data: jobData, error } = await supabase
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

      if (error) {
        console.error("Error fetching job:", error);
        return;
      }

      setJob(jobData as Job);

      // 2️⃣ Check if already applied
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: application } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", id)
        .eq("worker_id", user.id)
        .maybeSingle();

      if (application) setHasApplied(true);
    }

    fetchData();
  }, [id, supabase]);

  /* ---------------- APPLY ---------------- */
  const handleApply = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!job || !job.org_id?.[0]) {
      alert("Invalid job data");
      return;
    }

    const org = job.org_id[0];

    // 1️⃣ Insert application
    const { error } = await supabase.from("job_applications").insert({
      job_id: id,
      worker_id: user.id,
      status: "pending",
    });

    if (error) {
      if (error.code === "23505") {
        alert("You have already applied for this job.");
      } else {
        alert("Failed to apply: " + error.message);
      }
      return;
    }

    // 2️⃣ Notify WORKER
    await supabase.from("notifications").insert({
      recipient_id: user.id,
      recipient_role: "worker",
      message: `You successfully applied for "${job.title}"`,
      type: "application",
      related_job_id: id,
      related_user_id: user.id,
    });

    // 3️⃣ Notify ORGANIZATION
    await supabase.from("notifications").insert({
      recipient_id: org.user_id,
      recipient_role: "organization",
      message: `${user.user_metadata?.full_name || "A worker"
        } applied for "${job.title}"`,
      type: "application",
      related_job_id: id,
      related_user_id: user.id,
    });

    setHasApplied(true);
    alert("Applied successfully!");
  };

  /* ---------------- UI ---------------- */
  if (!job) return <p className="p-6">Loading...</p>;

  const org = job.org_id[0];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        {job.title}
      </h1>

      <div className="bg-white p-6 rounded-xl shadow text-gray-900">
        <p><strong>Location:</strong> {job.location}</p>

        <p className="mt-2">
          <strong>Salary:</strong>{" "}
          <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full">
            {job.salary_range}
          </span>
        </p>

        <p><strong>Category:</strong> {job.category}</p>

        <h2 className="text-xl font-bold mt-4 mb-2">Description</h2>
        <p>{job.description}</p>

        <div className="mt-6 flex gap-4">
          {org?.phone && (
            <a
              href={`tel:${org.phone}`}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              Call Now
            </a>
          )}

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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
