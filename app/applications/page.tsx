"use client";

import { useEffect, useState } from "react";
import { Check, X, Calendar, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@/utils/supabase/client";

/* ---------- TYPES ---------- */

type Status = "pending" | "accepted" | "rejected";

interface Application {
    id: string;
    created_at: string;
    status: Status;
    job: {
        id: string;
        title: string;
        org_name?: string;
    };
    worker?: {
        id: string;
        name: string;
        email: string;
        phone: string;
        skills: string[];
    };
}

/* ---------- PAGE ---------- */

export default function ApplicationsPage() {
    const { user } = useAuth();
    const role = user?.user_metadata?.role;
    const supabase = createClient();

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    /* ---------- FETCH ---------- */

    const fetchApplications = async () => {
        if (!user) return;
        setLoading(true);

        /* ================= ORGANIZATION ================= */
        if (role === "organization") {
            // 1️⃣ Get organization id
            const { data: org } = await supabase
                .from("organizations")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (!org) {
                setApplications([]);
                setLoading(false);
                return;
            }

            // 2️⃣ Get jobs posted by this org
            const { data: jobs } = await supabase
                .from("jobs")
                .select("id")
                .eq("org_id", org.id);

            const jobIds = jobs?.map(j => j.id) || [];
            if (jobIds.length === 0) {
                setApplications([]);
                setLoading(false);
                return;
            }

            // 3️⃣ Get applications for those jobs
            const { data, error } = await supabase
                .from("job_applications")
                .select(`
          id,
          created_at,
          status,
          jobs (
            id,
            title
          ),
          workers (
            id,
            name,
            email,
            phone,
            skills
          )
        `)
                .in("job_id", jobIds)
                .order("created_at", { ascending: false });

            if (!error && data) {
                const normalized: Application[] = data.map(app => ({
                    id: app.id,
                    created_at: app.created_at,
                    status: app.status,
                    job: {
                        id: app.jobs[0].id,
                        title: app.jobs[0].title,
                    },
                    worker: app.workers[0],
                }));

                setApplications(normalized);
            }
        }

        /* ================= WORKER ================= */
        else {
            const { data, error } = await supabase
                .from("job_applications")
                .select(`
          id,
          created_at,
          status,
          jobs (
            id,
            title,
            org_id (
              name
            )
          )
        `)
                .eq("worker_id", user.id)
                .order("created_at", { ascending: false });

            if (!error && data) {
                const normalized: Application[] = data.map((app: any) => {
                    const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
                    const org = Array.isArray(job.org_id) ? job.org_id[0] : job.org_id;

                    return {
                        id: app.id,
                        created_at: app.created_at,
                        status: app.status,
                        job: {
                            id: job.id,
                            title: job.title,
                            org_name: org?.name,
                        },
                    };
                });

                setApplications(normalized);
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        if (user) fetchApplications();
    }, [user, role]);

    /* ---------- ACCEPT / REJECT ---------- */

    const handleAction = async (
        appId: string,
        status: "accepted" | "rejected",
        workerId: string,
        jobTitle: string
    ) => {
        await supabase
            .from("job_applications")
            .update({ status })
            .eq("id", appId);

        await supabase.from("notifications").insert({
            recipient_id: workerId,
            recipient_role: "worker",
            message:
                status === "accepted"
                    ? `Your application for "${jobTitle}" was accepted 🎉`
                    : `Your application for "${jobTitle}" was rejected`,
            type: "application",
            action_status: status,
        });

        setApplications(prev =>
            prev.map(a => (a.id === appId ? { ...a, status } : a))
        );
    };

    /* ---------- UI ---------- */

    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                Loading applications...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">
                    {role === "organization" ? "Job Applicants" : "My Applications"}
                </h1>

                {applications.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
                        <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                        No applications found
                    </div>
                ) : (
                    <div className="space-y-5">
                        {applications.map(app => (
                            <div key={app.id} className="bg-white rounded-xl shadow p-6">
                                <div className="flex justify-between">
                                    <h3 className="font-semibold text-lg">
                                        {role === "organization"
                                            ? `Application for ${app.job.title}`
                                            : `Applied to ${app.job.title} (${app.job.org_name})`}
                                    </h3>

                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar size={12} />
                                        {new Date(app.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {/* ORGANIZATION VIEW */}
                                {role === "organization" && app.worker && (
                                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                                        <p className="font-bold">{app.worker.name}</p>
                                        <p className="text-sm">{app.worker.phone}</p>
                                        <p className="text-sm">{app.worker.email}</p>

                                        <div className="mt-4">
                                            {app.status === "pending" ? (
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() =>
                                                            handleAction(
                                                                app.id,
                                                                "accepted",
                                                                app.worker!.id,
                                                                app.job.title
                                                            )
                                                        }
                                                        className="px-5 py-2 bg-green-600 text-white rounded-lg"
                                                    >
                                                        <Check size={16} /> Accept
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleAction(
                                                                app.id,
                                                                "rejected",
                                                                app.worker!.id,
                                                                app.job.title
                                                            )
                                                        }
                                                        className="px-5 py-2 bg-red-100 text-red-600 rounded-lg"
                                                    >
                                                        <X size={16} /> Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="font-bold">{app.status}</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* WORKER VIEW */}
                                {role !== "organization" && (
                                    <div className="mt-3">
                                        Status: <b>{app.status}</b>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
