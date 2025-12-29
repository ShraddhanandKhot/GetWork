"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { hardLogout } from "@/utils/auth-helpers";
import ReferralStats from "./ReferralStats";
import ReferralJobs from "./ReferralJobs";
import ReferralModal from "./ReferralModal";

export default function ReferralDashboard({ userId, userName }: { userId: string, userName: string }) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [stats, setStats] = useState<{ total: number; points: number; pending: number; badges: string[] }>({ total: 0, points: 0, pending: 0, badges: [] });
    const [showModal, setShowModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchJobs();
        fetchStats();
    }, [userId]);

    const fetchJobs = async () => {
        const { data, error } = await supabase.from('jobs').select('*');
        if (data) setJobs(data);
    };

    const fetchStats = async () => {
        const { data: referrals } = await supabase
            .from('referrals')
            .select('status')
            .eq('partner_id', userId);

        if (referrals) {
            const total = referrals.length;
            const successful = referrals.filter(r => r.status === 'hired' || r.status === 'accepted').length;
            const pending = referrals.filter(r => r.status === 'pending').length;

            const badges = [];
            if (successful >= 5) badges.push("Top Referrer");
            if (total >= 10) badges.push("Active Scout");

            setStats({ total, points: successful * 10, pending, badges });
        }
    };

    const onRefer = (jobId: string) => {
        setSelectedJobId(jobId);
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                    Welcome, {userName || "Referral Partner"}!
                </h2>
                <p className="text-gray-600 mb-8">
                    You are now logged in. Start referring workers to earn rewards.
                </p>

                <ReferralStats stats={stats} />

                <button
                    onClick={hardLogout}
                    className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Logout
                </button>
            </div>

            <ReferralJobs jobs={jobs} onRefer={onRefer} />

            {showModal && (
                <ReferralModal
                    jobId={selectedJobId}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        fetchStats();
                    }}
                />
            )}
        </div>
    );
}
