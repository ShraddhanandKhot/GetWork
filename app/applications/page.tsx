"use client";
import { useEffect, useState } from "react";
import { Check, X, Bell, User, Briefcase, Calendar, Trash2 } from "lucide-react";

interface Notification {
    _id: string;
    message: string;
    read: boolean;
    createdAt: string;
    type: string;
    actionStatus?: "accepted" | "rejected" | "pending"; // Added Action Status
    relatedUser?: {
        _id: string;
        name: string;
        skills?: string[];
        email?: string;
        phone?: string;
    };
    relatedId?: string; // Job ID
    relatedUserModel?: string;
}

export default function ApplicationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string, updateState = true) => {
        try {
            await fetch(`https://getwork-backend.onrender.com/api/notifications/${id}/read`, { method: "PUT" });
            if (updateState) {
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteNotification = async (id: string) => {
        if (!confirm("Are you sure you want to delete this notification?")) return;
        try {
            const res = await fetch(`https://getwork-backend.onrender.com/api/notifications/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                setNotifications(prev => prev.filter(n => n._id !== id));
            } else {
                alert("Failed to delete");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (notif: Notification, status: "accepted" | "rejected") => {
        if (!notif.relatedId || !notif.relatedUser?._id) return;

        try {
            const token = localStorage.getItem("token");

            // 1. Update Job Application Status
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

                // 2. Update Notification Status
                await fetch(`https://getwork-backend.onrender.com/api/notifications/${notif._id}/status`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status })
                });

                // 3. Update Local State
                setNotifications(prev => prev.map(n =>
                    n._id === notif._id
                        ? { ...n, read: true, actionStatus: status }
                        : n
                ));
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Action failed");
        }
    };

    const markAllRead = async () => {
        const unreadParams = notifications.filter(n => !n.read);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        for (const notif of unreadParams) {
            await markAsRead(notif._id, false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading applications...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Applications</h1>
                        <p className="text-gray-500 mt-1">Manage jobs and status updates</p>
                    </div>
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={markAllRead}
                            className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {notifications.length === 0 ? (
                        <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
                            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg">No applications or notifications yet.</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className={`bg-white rounded-xl shadow border overflow-hidden transition-all ${!notif.read ? 'border-blue-300 ring-2 ring-blue-50' : 'border-gray-100'
                                    }`}
                                onClick={() => !notif.read && notif.type !== 'application' && markAsRead(notif._id)}
                            >
                                <div className="p-6 relative">
                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif._id); }}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete Notification"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="flex gap-4 items-start pr-8">
                                        <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${notif.type === 'application' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {notif.type === 'application' ? <User size={24} /> : <Briefcase size={24} />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-lg text-gray-900">{notif.message}</h3>
                                                <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Application Card Details */}
                                            {notif.type === "application" && notif.relatedUser && (
                                                <div className="mt-4 bg-gray-50 rounded-lg p-5 border border-gray-200">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">Applicant</p>
                                                            <p className="text-gray-900 font-medium text-lg">{notif.relatedUser.name}</p>
                                                            <p className="text-gray-600">{notif.relatedUser.phone}</p>
                                                            <p className="text-gray-600 text-sm mt-1">{notif.relatedUser.email}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500 uppercase tracking-wide font-bold mb-1">Skills</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {notif.relatedUser.skills?.map((skill, i) => (
                                                                    <span key={i} className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border shadow-sm">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Status / Actions */}
                                                    <div className="mt-6 border-t pt-4 border-gray-200">
                                                        {notif.actionStatus === 'accepted' ? (
                                                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold">
                                                                <Check size={18} /> Application Accepted
                                                            </span>
                                                        ) : notif.actionStatus === 'rejected' ? (
                                                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold">
                                                                <X size={18} /> Application Rejected
                                                            </span>
                                                        ) : (
                                                            <div className="flex gap-4">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleAction(notif, "accepted"); }}
                                                                    className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                                                                >
                                                                    <Check size={18} /> Accept Application
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); handleAction(notif, "rejected"); }}
                                                                    className="px-6 py-2 bg-white text-red-600 font-medium rounded-lg border border-red-200 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                                >
                                                                    <X size={18} /> Reject
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
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
