"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Job {
    id: string;
    title: string;
    description: string;
    salary_range: string;
    location: string;
    category: string;
    phone?: string;
    org_user_id?: string;
}

export default function JobDetailsClient({ jobId }: { jobId: string }) {
    const [job, setJob] = useState<Job | null>(null);
    const [hasApplied, setHasApplied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (!jobId) {
            setError("Invalid job id");
            return;
        }

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
            user_id,
            phone
          )
        `)
                .eq("id", jobId)
                .maybeSingle();

            if (error || !data) {
                console.error("Job fetch failed:", error);
                setError("Job not found");
                return;
            }

            const org = data.org_id?.[0];

            setJob({
                id: data.id,
                title: data.title,
                description: data.description,
                salary_range: data.salary_range,
                location: data.location,
                category: data.category,
                phone: org?.phone,
                org_user_id: org?.user_id,
            });

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: applied } = await supabase
                    .from("job_applications")
                    .select("id")
                    .eq("job_id", jobId)
                    .eq("worker_id", user.id)
                    .maybeSingle();

                if (applied) setHasApplied(true);
            }
        };

        fetchData();
    }, [jobId]);

    const handleApply = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

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

        // Notifications
        await supabase.from("notifications").insert([
            {
                recipient_id: user.id,
                recipient_role: "worker",
                message: `You applied for ${job.title}`,
                type: "application",
            },
            {
                recipient_id: job.org_user_id,
                recipient_role: "organization",
                message: `${user.user_metadata?.full_name || "A worker"} applied for ${job.title}`,
                type: "application",
            },
        ]);

        setHasApplied(true);
    };

    /* ---------- UI STATES ---------- */

    if (error) {
        return (
            <div className="p-10 text-center text-red-600">
                {error}
            </div>
        );
    }

    if (!job) {
        return (
            <div className="p-10 text-center text-gray-500">
                Loading job…
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">
                {job.title}
            </h1>

            <div className="bg-white p-6 rounded-xl shadow">
                <p><b>Location:</b> {job.location}</p>
                <p className="mt-2"><b>Salary:</b> {job.salary_range}</p>
                <p><b>Category:</b> {job.category}</p>

                <h3 className="font-bold mt-4">Description</h3>
                <p>{job.description}</p>

                <div className="mt-6 flex gap-4">
                    {job.phone && (
                        <a
                            href={`tel:${job.phone}`}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg"
                        >
                            Call Now
                        </a>
                    )}

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
