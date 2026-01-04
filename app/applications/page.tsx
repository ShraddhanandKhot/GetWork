"use client";
import { useEffect, useState } from "react";
import { Check, X, Bell, User, Briefcase, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@/utils/supabase/client";

interface Application {
    id: string;
    created_at: string;
    status: "pending" | "accepted" | "rejected";
    job: {
        id: string;
        title: string;
        org_id?: { name: string };
    };
    worker?: {
        id: string;
        name: string;
        email: string;
        phone: string;
        skills: string[];
    };
}

export default function ApplicationsPage() {
    const { user } = useAuth();
    const role = user?.user_metadata?.role;

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchApplications = async () => {
        if (!user) return;
        setLoading(true);

        try {
            if (role === "organization") {
                // Fetch applications for jobs posted by this org
                // We need to join jobs to filter by org_id? 
                // Alternatively, if we know the org_id matches user.id:
                // Supabase: select * from job_applications inner join jobs on job_id where jobs.org_id = user.id

                const { data, error } = await supabase
                    .from('job_applications')
                    .select(`
                        id,
                        created_at,
                        status,
                        job:jobs (
                            id,
                            title,
                            org_id
                        ),
                        worker:workers (
                            id,
                            name,
                            email,
                            phone,
                            skills
                        )
                    `)
                    .order('created_at', { ascending: false });

                // Filter client-side if deeper filtering is tricky, or ensure RLS handles "my jobs only"
                // Assuming efficient enough for now to filter in code if query returns all.
                // Or better: .eq('job.org_id', user.id) -> Note: Supabase nested filtering can be complex.
                // Let's filter in JS for simplicity unless dataset is huge.
                if (data) {
                    const myJobApps = data.filter((app: any) => app.job?.org_id === user.id);
                    setApplications(myJobApps as any);
                }

            } else {
                // Worker: Fetch my applications
                const { data, error } = await supabase
                    .from('job_applications')
                    .select(`
                        id,
                        created_at,
                        status,
                        job:jobs (
                            id,
                            title,
                            org_id (
                                name
                            )
                        )
                    `)
                    .eq('worker_id', user.id)
                    .order('created_at', { ascending: false });

                if (data) setApplications(data as any);
            }
        } catch (err) {
            console.error("Failed to fetch applications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchApplications();
    }, [user, role, supabase]);

    const handleAction = async (appId: string, status: "accepted" | "rejected") => {
        const { error } = await supabase
            .from('job_applications')
            .update({ status })
            .eq('id', appId);

        if (error) {
            alert("Failed to update status");
        } else {
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
            alert(`Application ${status}`);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {role === 'organization' ? 'Job Applicants' : 'My Applications'}
                        </h1>
                        <p className="text-gray-500 mt-1">Manage jobs and status updates</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {applications.length === 0 ? (
                        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
                            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg">No applications found.</p>
                        </div>
                    ) : (
                        applications.map((app) => (
                            <div
                                key={app.id}
                                className={`bg-white rounded-xl shadow border overflow-hidden transition-all border-gray-100`}
                            >
                                <div className="p-6">
                                    <div className="flex gap-4 items-start pr-8">
                                        <div className={`mt-1 p-2 rounded-full flex-shrink-0 bg-blue-100 text-blue-600`}>
                                            {role === 'organization' ? <User size={24} /> : <Briefcase size={24} />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-lg text-gray-900">
                                                    {role === 'organization'
                                                        ? `Application for ${app.job.title}`
                                                        : `Applied to ${app.job.title} at ${app.job.org_id?.name || 'Unknown Org'}`
                                                    }
                                                </h3>
                                                <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Organization View: Show Applicant Details */}
                                            {role === 'organization' && app.worker && (
                                                <div className="mt-4 bg-gray-50 rounded-lg p-5 border border-gray-200">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">Applicant</p>
                                                            <p className="text-gray-900 font-medium text-lg">{app.worker.name}</p>
                                                            <p className="text-gray-600">{app.worker.phone}</p>
                                                            <p className="text-gray-600 text-sm mt-1">{app.worker.email}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">Skills</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {app.worker.skills?.map((skill, i) => (
                                                                    <span key={i} className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border shadow-sm">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Status / Actions */}
                                                    <div className="mt-6 border-t pt-4 border-gray-200">
                                                        {app.status === 'accepted' ? (
                                                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold">
                                                                <Check size={18} /> Accepted
                                                            </span>
                                                        ) : app.status === 'rejected' ? (
                                                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold">
                                                                <X size={18} /> Rejected
                                                            </span>
                                                        ) : (
                                                            <div className="flex gap-4">
                                                                <button
                                                                    onClick={() => handleAction(app.id, "accepted")}
                                                                    className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                                                                >
                                                                    <Check size={18} /> Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction(app.id, "rejected")}
                                                                    className="px-6 py-2 bg-white text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                                >
                                                                    <X size={18} /> Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Worker View: Show Status */}
                                            {role !== 'organization' && (
                                                <div className="mt-2">
                                                    Status:
                                                    <span className={`ml-2 font-bold capitalize ${app.status === 'accepted' ? 'text-green-600' :
                                                        app.status === 'rejected' ? 'text-red-600' :
                                                            'text-yellow-600'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
