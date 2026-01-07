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
                        job_title: a.jobs?.title || "Unknown Job",
                        org_name: a.jobs?.org_id?.name || "Unknown Company",
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

            if (!org) {
                setLoading(false);
                return;
            };

            // Improved query: Select worker_id explicitly
            const { data, error } = await supabase
                .from("job_applications")
                .select(`
          id,
          status,
          created_at,
          worker_id,
          jobs ( title, org_id ),
          workers ( id, name, phone, email )
        `)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching applications:", error);
            }

            if (!error && data) {
                const orgApps = data
                    .filter((a: any) => a.jobs?.org_id === org.id) // Filter by org mainly if RLS doesn't handle it
                    .map((a: any) => ({
                        id: a.id,
                        created_at: a.created_at,
                        status: a.status,
                        job_title: a.jobs?.title || "Unknown Job",
                        worker: a.workers || { id: a.worker_id, name: "Unknown User", phone: "N/A", email: "N/A" },
                    }));
                setApps(orgApps);
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [user, role]);

    const updateStatus = async (id: string, status: Status, workerId: string, title: string) => {
        const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);

        if (error) {
            alert("Failed to update status");
            return;
        }

        // Send notification
        await supabase.from("notifications").insert({
            recipient_id: workerId,
            recipient_role: "worker",
            message:
                status === "accepted"
                    ? `Your application for ${title} was accepted!`
                    : `Your application for ${title} was rejected.`,
            type: "application",
        });

        load(); // Refresh the list
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading applications...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                {role === "organization" ? "Job Applicants" : "My Applications"}
            </h1>

            {apps.length === 0 ? (
                <div className="bg-white p-10 rounded-xl text-center text-gray-500 shadow-sm">
                    <Bell size={40} className="mx-auto mb-4 text-gray-400" />
                    <p>No applications found yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {apps.map(app => (
                        <div key={app.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-shadow hover:shadow-md">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">{app.job_title}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <Calendar size={14} />
                                        Applied on {new Date(app.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize 
                                    ${app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'}`}>
                                    {app.status}
                                </span>
                            </div>

                            {/* ORGANIZATION VIEW */}
                            {role === "organization" && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-gray-700 mb-2">
                                        <span className="font-medium">{app.worker?.name || "User"}</span> has applied for this job.
                                    </p>
                                    {app.worker?.phone !== "N/A" && (
                                        <p className="text-sm text-gray-500 mb-4">Contact: {app.worker?.phone}</p>
                                    )}

                                    {app.status === "pending" ? (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => updateStatus(app.id, "accepted", app.worker!.id, app.job_title)}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <Check size={16} /> Accept
                                            </button>
                                            <button
                                                onClick={() => updateStatus(app.id, "rejected", app.worker!.id, app.job_title)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <X size={16} /> Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">
                                            Action taken: <strong>{app.status}</strong>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* WORKER VIEW */}
                            {role === "worker" && app.org_name && (
                                <div className="mt-2 text-sm text-gray-600">
                                    <p>Company: <span className="font-medium">{app.org_name}</span></p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
