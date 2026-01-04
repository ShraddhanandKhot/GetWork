"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Home, Briefcase, Users, User, LogIn } from "lucide-react";

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();
    const role = user?.user_metadata?.role;

    const isLoggedIn = !!user;
    const isActive = (path: string) => pathname === path;

    // Decide dashboard path safelyyy
    const dashboardPath =
        role === "organization"
            ? "/organization"
            : role === "worker"
                ? "/worker"
                : "/";     // fallback when role is null,<---

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-3 pb-5 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
            {/* Home */}
            <Link
                href="/"
                className={`flex flex-col items-center gap-1 ${isActive("/") ? "text-blue-600" : "text-gray-500"
                    }`}
            >
                <Home size={24} />
                <span className="text-[10px] font-medium">Home</span>
            </Link>

            {/* Jobs */}
            <Link
                href="/jobs"
                className={`flex flex-col items-center gap-1 ${isActive("/jobs") ? "text-blue-600" : "text-gray-500"
                    }`}
            >
                <Briefcase size={24} />
                <span className="text-[10px] font-medium">Jobs</span>
            </Link>

            {/* Referral */}
            <Link
                href="/referral"
                className={`flex flex-col items-center gap-1 ${isActive("/referral") ? "text-blue-600" : "text-gray-500"
                    }`}
            >
                <Users size={24} />
                <span className="text-[10px] font-medium">Referral</span>
            </Link>

            {/* Dashboard / You */}
            {isLoggedIn && (
                <Link
                    href={dashboardPath}
                    className={`flex flex-col items-center gap-1 ${isActive("/organization") ||
                        isActive("/worker") ||
                        isActive("/")
                        ? "text-blue-600"
                        : "text-gray-500"
                        }`}
                >
                    <User size={24} />
                    <span className="text-[10px] font-medium">You</span>
                </Link>
            )}

            {/* Login */}
            {!isLoggedIn && (
                <Link
                    href="/login"
                    className={`flex flex-col items-center gap-1 ${isActive("/login") ? "text-blue-600" : "text-gray-500"
                        }`}
                >
                    <LogIn size={24} />
                    <span className="text-[10px] font-medium">Login</span>
                </Link>
            )}
        </div>
    );
}
