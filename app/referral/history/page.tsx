"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReferralHistoryPage() {
    const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/referral");
                    return;
                }

                const res = await fetch("https://getwork-backend.onrender.com/api/referral/stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setReferrals(data.referrals || []);
                }
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Referral History
                    </h2>
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        &larr; Back to Dashboard
                    </button>
                </div>

                {loading ? (
                    <p className="text-center text-gray-500">Loading history...</p>
                ) : referrals.length === 0 ? (
                    <p className="text-center text-gray-500">No referrals found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {referrals.map((ref) => (
                                    <tr key={ref._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ref.workerName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ref.jobId?.title || "Unknown Job"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ref.jobId?.orgId?.name || "N/A"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(ref.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${ref.status === 'hired' ? 'bg-green-100 text-green-800' :
                                                    ref.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
