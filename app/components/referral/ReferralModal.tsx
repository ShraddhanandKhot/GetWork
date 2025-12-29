"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface ReferralModalProps {
    jobId: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReferralModal({ jobId, onClose, onSuccess }: ReferralModalProps) {
    const [form, setForm] = useState({
        name: "",
        phone: "",
        age: "",
        skills: "",
        location: "",
        experience: "",
    });
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!jobId) return;

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Session expired. Please login again.");
                return;
            }

            const { error } = await supabase.from('referrals').insert({
                partner_id: user.id,
                job_id: jobId,
                candidate_name: form.name,
                // 🧠 NORMALIZATION
                candidate_phone: form.phone.replace(/^0+/, ""),
                candidate_details: {
                    age: form.age ? Number(form.age) : null,
                    skills: form.skills ? form.skills.split(",").map(s => s.trim()) : [],
                    location: form.location,
                    experience: form.experience
                },
                status: 'pending'
            });

            if (error) {
                alert("Failed to submit: " + error.message);
            } else {
                alert("Referral Submitted Successfully!");
                onSuccess();
            }
        } catch (err) {
            console.error(err);
            alert("Error during submission");
        } finally {
            setLoading(false);
        }
    };

    if (!jobId) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Refer a Worker</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Worker Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Age</label>
                            <input
                                type="number"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                value={form.age}
                                onChange={(e) => setForm({ ...form, age: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Experience</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                                value={form.experience}
                                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={form.skills}
                            onChange={(e) => setForm({ ...form, skills: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Submitting..." : "Submit Referral"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
