"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
// import { useAuth } from "@/app/context/AuthContext"; // Optional if you need user verification

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const supabase = createClient();
    const { id } = use(params);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [job, setJob] = useState({
        title: "",
        description: "",
        salary_range: "",
        location: "",
        category: "",
    });

    useEffect(() => {
        const fetchJob = async () => {
            const { data, error } = await supabase
                .from("jobs")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                alert("Error fetching job");
                router.push("/organization");
                return;
            }

            setJob({
                title: data.title,
                description: data.description || "",
                salary_range: data.salary_range || "",
                location: data.location || "",
                category: data.category || "",
            });
            setLoading(false);
        };

        fetchJob();
    }, [id, router]);

    const handleUpdate = async () => {
        setSaving(true);
        const { error } = await supabase
            .from("jobs")
            .update(job)
            .eq("id", id);

        setSaving(false);

        if (error) {
            alert("Failed to update job");
            return;
        }

        alert("Job updated!");
        router.push("/organization");
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this job?")) return;

        setSaving(true);
        const { error } = await supabase.from("jobs").delete().eq("id", id);
        setSaving(false);

        if (error) {
            alert("Failed to delete job. You may have existing applications linked to it.");
            return;
        }

        router.push("/organization");
    }

    if (loading) return <div className="p-10 text-center">Loading job...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-800"
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Edit Job</h1>
                    <button
                        onClick={handleDelete}
                        className="text-red-500 hover:bg-red-50 p-2 rounded"
                        title="Delete Job"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title
                        </label>
                        <input
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={job.title}
                            onChange={(e) => setJob({ ...job, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
                            value={job.description}
                            onChange={(e) => setJob({ ...job, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Salary Range
                            </label>
                            <input
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={job.salary_range}
                                onChange={(e) => setJob({ ...job, salary_range: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={job.location}
                                onChange={(e) => setJob({ ...job, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <input
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={job.category}
                            onChange={(e) => setJob({ ...job, category: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 transition disabled:bg-blue-300"
                    >
                        <Save size={18} />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
