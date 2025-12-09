"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

interface WorkerProfile {
  name: string;
  age: number;
  skills: string[];
  location: string;
  phone: string;
}

export default function WorkerDashboard() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch("https://getwork-backend.onrender.com/api/worker/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setProfile(data.worker);
        }
      } catch (err) {
        console.log("Error fetching profile:", err);
      }
    }

    fetchProfile();
  }, []);

  if (!profile) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          Welcome, {profile.name}
        </h1>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </div>


      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Your Profile
        </h2>

        <div className="space-y-2 text-gray-600">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Age:</strong> {profile.age}</p>
          <p><strong>Skills:</strong> {profile.skills?.join(", ")}</p>
          <p><strong>Location:</strong> {profile.location}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
        </div>

        <button
          onClick={() => window.location.href = "/worker/edit"}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
