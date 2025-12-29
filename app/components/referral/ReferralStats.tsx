"use client";
import { useRouter } from "next/navigation";

interface ReferralStatsProps {
    stats: {
        total: number;
        points: number;
        pending: number;
        badges: string[];
    };
}

export default function ReferralStats({ stats }: ReferralStatsProps) {
    const router = useRouter();

    return (
        <div className="bg-blue-50 p-4 rounded-lg mb-8 w-full max-w-md">
            <h3 className="font-semibold text-blue-800 mb-2">Your Stats</h3>
            <div className="flex justify-between text-sm text-blue-700">
                <span
                    className="font-bold cursor-pointer hover:underline"
                    onClick={() => router.push("/referral/history")}
                >
                    Referral Points:
                </span>
                <span
                    className="font-bold cursor-pointer hover:underline"
                    onClick={() => router.push("/referral/history")}
                >
                    {stats.points}
                </span>
            </div>
            <div className="flex justify-between text-sm text-blue-700 mt-1">
                <span>Pending:</span>
                <span className="font-bold">{stats.pending}</span>
            </div>
            {stats.badges && stats.badges.length > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm">Badges</h4>
                    <div className="flex flex-wrap gap-2">
                        {stats.badges.map((badge, idx) => (
                            <span
                                key={idx}
                                className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-300"
                            >
                                🏆 {badge}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
