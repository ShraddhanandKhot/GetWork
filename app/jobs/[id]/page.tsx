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
    phone: string;
    name: string;
  };
}

export default function JobDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const supabase = createClient();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH JOB + APPLY STATUS ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1️⃣ Fetch job
      const { data: jobData, error } = await supabase
        .from("jobs")
        .select(
          `
          id,
          title,
          description,
          salary_range,
          location,
          category,
          org_id (
            id,
            phone,
            name
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Job fetch error:", error);
        setLoading(false);
        return;
      }

      setJob(jobData as unknown as Job);

      // 2️⃣ Check application status
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: application } = await supabase
          .from("job_applications")
          .select("id")
          .eq("job_id", id)
          .eq("worker_id", user.id)
          .maybeSingle();

        if (application) setHasApplied(true);
      }

      setLoading(false);
    };

    fetchData();
  }, [id, supabase]);

  /* ---------------- APPLY HANDLER ---------------- */
  const handleApply = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!job) return;

    // 1️⃣ Get worker name
    const { data: worker } = await supabase
      .from("workers")
      .select("name")
      .eq("user_id", user.id)
      .single();

    const workerName = worker?.name || "A worker";

    // 2️⃣ Insert application
    const { error: applyError } = await supabase
      .from("job_applications")
      .insert({
        job_id: job.id,
        worker_id: user.id,
        status: "pending",
      });

    if (applyError) {
      if (applyError.code === "23505") {
        alert("You have already applied to this job.");
      } else {
        alert(applyError.message);
      }
      return;
    }

    // 3️⃣ Worker notification
    await supabase.from("notifications").insert({
      recipient_id: user.id,
      recipient_role: "worker",
      message: `You successfully applied for ${job.title} at ${job.org_id.name}`,
      related_job_id: job.id,
      type: "info",
    });

    // 4️⃣ Organization notification
    await supabase.from("notifications").insert({
      recipient_id: job.org_id.id,
      recipient_role: "organization",
      message: `${workerName} has applied for ${job.title}`,
      related_job_id: job.id,
      related_user_id: user.id,
      action_status: "pending",
      type: "application",
    });

    alert("Applied successfully!");
    setHasApplied(true);
  };

  /* ---------------- UI ---------------- */
  if (loading || !job) {
    return <p className="p-6">Loading job details…</p>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">{job.title}</h1>

      <div className="bg-white p-6 rounded-xl shadow text-gray-900">
        <p>
          <strong>Organization:</strong> {job.org_id.name}
        </p>
        <p>
          <strong>Location:</strong> {job.location}
        </p>
        <p className="mt-2">
          <strong className="mr-2">Salary:</strong>
          <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full inline-block">
            ₹{job.salary_range}
          </span>
        </p>
        <p>
          <strong>Category:</strong> {job.category}
        </p>

        <h2 className="text-xl font-bold mt-4 mb-2">Description</h2>
        <p>{job.description}</p>

        <div className="mt-6 flex gap-4">
          <a
            href={`tel:${job.org_id.phone}`}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Call Now
          </a>

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
