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
    const [isOrg, setIsOrg] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    /* ---------- FETCH JOB ---------- */
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
                .single();

            if (error || !data) {
                console.error(error);
                setError("Job not found");
                return;
            }

            const org = Array.isArray(data.org_id) ? data.org_id[0] : data.org_id;

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

            // check if already applied
            const { data: auth } = await supabase.auth.getUser();
            if (!auth.user) return;

            const { data: worker } = await supabase
                .from("workers")
                .select("id")
                .eq("user_id", auth.user.id)
                .single();

            if (!worker) return;

            const { data: applied } = await supabase
                .from("job_applications")
                .select("id")
                .eq("job_id", jobId)
                .eq("worker_id", worker.id)
                .maybeSingle();

            if (applied) setHasApplied(true);
        };

        const checkUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user?.user_metadata?.role === 'organization') {
                setIsOrg(true);
            }
        }

        fetchData();
        checkUserRole();
    }, [jobId]);

    /* ---------- APPLY ---------- */
    const handleApply = async () => {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) {
            router.push("/login");
            return;
        }

        if (!job) return;

        // 🔑 FIX: map auth user → workers.id
        const { data: worker } = await supabase
            .from("workers")
            .select("id")
            .eq("user_id", auth.user.id)
            .single();

        if (!worker) {
            alert("Worker profile not found");
            return;
        }

        const { error } = await supabase.from("job_applications").insert({
            job_id: job.id,
            worker_id: worker.id, // ✅ CORRECT
            status: "pending",
        });

        if (error) {
            alert(error.message);
            return;
        }

        // Worker notification
        await supabase.from("notifications").insert({
            recipient_id: auth.user.id,
            recipient_role: "worker",
            message: `You applied for ${job.title}`,
            type: "application",
        });

        // Org notification
        if (job.org_user_id) {
            await supabase.from("notifications").insert({
                recipient_id: job.org_user_id,
                recipient_role: "organization",
                message: `${auth.user.user_metadata?.full_name || "A worker"} applied for ${job.title}`,
                type: "application",
            });
        }

        setHasApplied(true);
        alert("Applied successfully!");
    };

    /* ---------- UI ---------- */
    if (error) return <div className="p-10 text-red-600">{error}</div>;
    if (!job) return <div className="p-10 text-gray-500">Loading job…</div>;

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">{job.title}</h1>

            <div className="bg-white p-6 rounded-xl shadow">
                <p><b>Location:</b> {job.location}</p>
                <p className="mt-2"><b>Salary:</b> {job.salary_range}</p>
                <p><b>Category:</b> {job.category}</p>

                <h3 className="font-bold mt-4">Description</h3>
                <p>{job.description}</p>

                <div className="mt-6 flex gap-4">
                    {job.phone && (
                        <a href={`tel:${job.phone}`} className="px-6 py-3 bg-green-600 text-white rounded-lg">
                            Call Now
                        </a>
                    )}

                    {hasApplied ? (
                        <button disabled className="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                            Applied
                        </button>
                    ) : isOrg ? (
                        <div className="group relative">
                            <button disabled className="px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
                                Apply Now
                            </button>
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                Organizations cannot apply
                            </span>
                        </div>
                    ) : (
                        <button onClick={handleApply} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            Apply Now
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
