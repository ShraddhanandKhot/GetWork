"use client";
import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import Link from "next/link";

interface Notification {
    _id: string;
    read: boolean;
}

export default function Applications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const role = localStorage.getItem("role");
            let userId = "";

            if (role === "organization") {
                const res = await fetch("https://getwork-backend.onrender.com/api/org/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) userId = data.org._id;
            } else {
                const res = await fetch("https://getwork-backend.onrender.com/api/worker/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) userId = data.worker._id;
            }

            if (userId) {
                const res = await fetch(`https://getwork-backend.onrender.com/api/notifications/${userId}`);
                const data = await res.json();
                if (data.success) setNotifications(data.notifications);
            }

        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Link href="/applications" className="relative group">
            <div className="relative p-2 text-gray-600 group-hover:text-blue-600 transition-colors rounded-full group-hover:bg-gray-100">
                <FileText size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex justify-center items-center shadow-sm border border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </div>
        </Link>
    );
}
