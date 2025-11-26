"use client";
import { useEffect, useState } from "react";

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

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        async function fetchNotifications() {
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
        }

        fetchNotifications();
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

    if (notifications.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow mb-6">
            <h2 className="text-xl font-semibold text-black mb-4">Notifications</h2>
            <div className="space-y-3">
                {notifications.map((notif) => (
                    <div
                        key={notif._id}
                        className={`p-3 border rounded-lg flex justify-between items-start ${notif.read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                            }`}
                    >
                        <div className="flex-1">
                            <p className={`text-sm ${notif.read ? "text-gray-500" : "text-gray-800 font-medium"}`}>
                                {notif.message}
                            </p>

                            {/* Show Applicant Details if it's an application notification */}
                            {notif.type === "application" && notif.relatedUser && (
                                <div className="mt-2 p-3 bg-white border rounded text-sm text-gray-700">
                                    <p><strong>Applicant:</strong> {notif.relatedUser.name}</p>
                                    {notif.relatedUser.skills && (
                                        <p><strong>Skills:</strong> {notif.relatedUser.skills.join(", ")}</p>
                                    )}
                                    <p><strong>Phone:</strong> {notif.relatedUser.phone}</p>

                                    {!notif.read && (
                                        <div className="mt-3 flex gap-2">
                                            <button
                                                onClick={() => handleAction(notif, "accepted")}
                                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleAction(notif, "rejected")}
                                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {!notif.read && notif.type !== "application" && (
                            <button
                                onClick={() => markAsRead(notif._id)}
                                className="text-xs text-blue-600 hover:underline ml-4"
                            >
                                Mark as Read
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
