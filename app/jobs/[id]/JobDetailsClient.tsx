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

/* ---------- COMPONENT ---------- */

export default function JobDetailsClient({ jobId }: { jobId: string }) {
    const [job, setJob] = useState<Job | null>(null);
    const [hasApplied, setHasApplied] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
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
                .eq("id", jobId)
                .single();

            if (error || !data) return;

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
                    .eq("job_id", jobId)
                    .eq("worker_id", user.id)
                    .single();

                if (application) setHasApplied(true);
            }
        };

        fetchData();
    }, [jobId]);

    const handleApply = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push("/login");
        if (!job) return;

        await supabase.from("job_applications").insert({
            job_id: job.id,
            worker_id: user.id,
            status: "pending",
        });

        await supabase.from("notifications").insert([
            {
                recipient_id: user.id,
                recipient_role: "worker",
                message: `You applied for ${job.title}`,
                type: "application",
            },
            {
                recipient_id: job.org.user_id,
                recipient_role: "organization",
                message: `${user.user_metadata?.full_name} applied for ${job.title}`,
                type: "application",
            },
        ]);

        setHasApplied(true);
    };

    if (!job) return <p className="p-10 text-center">Loading job…</p>;

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <h1 className="text-3xl font-bold text-blue-600">{job.title}</h1>

            <div className="bg-white p-6 rounded-xl shadow mt-6">
                <p><b>Location:</b> {job.location}</p>
                <p><b>Salary:</b> {job.salary_range}</p>
                <p><b>Category:</b> {job.category}</p>

                <h3 className="font-bold mt-4">Description</h3>
                <p>{job.description}</p>

                <div className="mt-6 flex gap-4">
                    <a href={`tel:${job.org.phone}`} className="btn btn-success">
                        Call Now
                    </a>

                    {hasApplied ? (
                        <button disabled className="btn btn-disabled">Applied</button>
                    ) : (
                        <button onClick={handleApply} className="btn btn-primary">
                            Apply
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
