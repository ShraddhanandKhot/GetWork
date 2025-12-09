"use client";
import { useEffect, useState, useRef } from "react";
import { Bell, FileText, Check, X } from "lucide-react";
import * as motion from "framer-motion/client";
import { AnimatePresence } from "framer-motion";

interface Notification {
    _id: string;
    message: string;
    read: boolean;
    createdAt: string;
    type: string;
    relatedUser?: {
        _id: string;
        name: string;
        skills?: string[];
        email?: string;
        phone?: string;
    };
    relatedId?: string; // Job ID
}

export default function Applications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            // Determine role to fetch profile and get ID
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
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`https://getwork-backend.onrender.com/api/notifications/${id}/read`, { method: "PUT" });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (notif: Notification, status: "accepted" | "rejected") => {
        if (!notif.relatedId || !notif.relatedUser?._id) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `https://getwork-backend.onrender.com/api/jobs/${notif.relatedId}/application/${notif.relatedUser._id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
                }
            );
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                // Mark notification as read to indicate action taken
                markAsRead(notif._id);
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Action failed");
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
            >
                <FileText size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex justify-center items-center shadow-sm border border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Applications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => notifications.forEach(n => !n.read && markAsRead(n._id))}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                    <FileText size={32} className="text-gray-300 mb-2" />
                                    <p>No new applications</p>
                                </div>
                            ) : (
                                <div>
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif._id}
                                            className={`p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                                            onClick={() => !notif.read && notif.type !== 'application' && markAsRead(notif._id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-blue-600' : 'bg-transparent'}`} />
                                                <div className="flex-1">
                                                    <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                        {notif.message}
                                                    </p>

                                                    {/* Application Details */}
                                                    {notif.type === "application" && notif.relatedUser && (
                                                        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-sm">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                                    {notif.relatedUser.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{notif.relatedUser.name}</p>
                                                                    <p className="text-xs text-gray-500">{notif.relatedUser.phone}</p>
                                                                </div>
                                                            </div>

                                                            {notif.relatedUser.skills && (
                                                                <div className="flex flex-wrap gap-1 mb-3">
                                                                    {notif.relatedUser.skills.map((skill, i) => (
                                                                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {!notif.read && (
                                                                <div className="flex gap-2 mt-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleAction(notif, "accepted"); }}
                                                                        className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                                                    >
                                                                        <Check size={14} /> Accept
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleAction(notif, "rejected"); }}
                                                                        className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                                                                    >
                                                                        <X size={14} /> Reject
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <p className="text-[10px] text-gray-400 mt-2 text-right">
                                                        {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
