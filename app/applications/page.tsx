"use client";

import { useEffect, useState } from "react";
import { Calendar, Bell, Check, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@/utils/supabase/client";

type Status = "pending" | "accepted" | "rejected";

interface Application {
    id: string;
    created_at: string;
    status: Status;
    job_title: string;
    org_name?: string;
    worker?: {
        id: string;
        name: string;
        phone: string;
        email: string;
    };
}

export default function ApplicationsPage() {
    const { user } = useAuth();
    const role = user?.user_metadata?.role;
    const supabase = createClient();

    const [apps, setApps] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        if (!user) return;
        setLoading(true);

        /* ---------- WORKER ---------- */

        if (role === "worker") {
            const { data: worker, error: workerError } = await supabase
                .from("workers")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (workerError || !worker) {
                console.error("Worker not found", workerError);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("job_applications")
                .select(`
      id,
      status,
      created_at,
      jobs (
        title,
        org_id ( name )
      )
    `)
                .eq("worker_id", worker.id)
                .order("created_at", { ascending: false });

            if (!error && data) {
                setApps(
                    data.map((a: any) => ({
                        id: a.id,
                        created_at: a.created_at,
                        status: a.status,
                        job_title: a.jobs.title,
                        org_name: a.jobs.org_id.name,
                    }))
                );
            }
        }


        /* ---------- ORGANIZATION ---------- */
        if (role === "organization") {
            const { data: org } = await supabase
                .from("organizations")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (!org) return;

            const { data, error } = await supabase
                .from("job_applications")
                .select(`
          id,
          status,
          created_at,
          jobs ( title, org_id ),
          workers ( id, name, phone, email )
        `)
                .order("created_at", { ascending: false });

            if (!error && data) {
                setApps(
                    data
                        .filter((a: any) => a.jobs.org_id === org.id)
                        .map((a: any) => ({
                            id: a.id,
                            created_at: a.created_at,
                            status: a.status,
                            job_title: a.jobs.title,
                            worker: a.workers,
                        }))
                );
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [user, role]);

    const updateStatus = async (id: string, status: Status, workerId: string, title: string) => {
        await supabase.from("job_applications").update({ status }).eq("id", id);

        await supabase.from("notifications").insert({
            recipient_id: workerId,
            recipient_role: "worker",
            message:
                status === "accepted"
                    ? `Your application for ${title} was accepted`
                    : `Your application for ${title} was rejected`,
            type: "application",
        });

        load();
    };

    if (loading) return <div className="p-10 text-gray-500">Loading…</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">
                {role === "organization" ? "Applicants" : "My Applications"}
            </h1>

            {apps.length === 0 ? (
                <div className="bg-white p-10 rounded-xl text-center text-gray-500">
                    <Bell size={40} className="mx-auto mb-4" />
                    No applications found
                </div>
            ) : (
                apps.map(app => (
                    <div key={app.id} className="bg-white p-6 rounded-xl shadow mb-4">
                        <div className="flex justify-between">
                            <b>{app.job_title}</b>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(app.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        {role === "worker" && <p>Status: <b>{app.status}</b></p>}

                        {role === "organization" && app.worker && (
                            <div className="mt-4">
                                <p><b>{app.worker.name}</b></p>
                                <p>{app.worker.phone}</p>

                                {app.status === "pending" ? (
                                    <div className="flex gap-4 mt-3">
                                        <button
                                            onClick={() => updateStatus(app.id, "accepted", app.worker!.id, app.job_title)}
                                            className="px-4 py-2 bg-green-600 text-white rounded"
                                        >
                                            <Check size={14} /> Accept
                                        </button>
                                        <button
                                            onClick={() => updateStatus(app.id, "rejected", app.worker!.id, app.job_title)}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded"
                                        >
                                            <X size={14} /> Reject
                                        </button>
                                    </div>
                                ) : (
                                    <p className="mt-3 font-bold">{app.status}</p>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
