
"use client";
import { useEffect, useState } from "react";

export default function WorkerDashboard() {
 
   const [name, setName] = useState("");

  useEffect(() => {
    // Get name from localStorage after login
    const storedName = localStorage.getItem("name");
    if (storedName) {
      setName(storedName);
    }
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Welcome <span className="text-red-600">{name ? name : "User"}</span>
      </h1>

      {/* Profile Section */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Your Profile
        </h2>
        
        <div className="space-y-2 text-gray-600">
          <p><strong>Name:</strong> {name ? name : "User"}</p>
          <p><strong>Skills:</strong> Cleaning, Cooking</p>
          <p><strong>Location:</strong> Pune</p>
          <p><strong>Phone:</strong> 9876543210</p>
        </div>

        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
          Edit Profile
        </button>
      </div>

      {/* Job Recommendations */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Jobs Near You
        </h2>

        {/* Job Card */}
        <div className="p-4 border rounded-lg mb-3 bg-gray-50">
          <h3 className="text-lg font-bold">Cleaner - Hotel Sunrise</h3>
          <p className="text-gray-600 text-sm">Location: Pune City</p>
          <p className="text-gray-600 text-sm">Salary: ₹12,000 - ₹15,000</p>

          <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            View Job
          </button>
        </div>

        {/* More jobs */}
        <a
          href="/jobs"
          className="block mt-4 text-blue-600 font-semibold text-center"
        >
          View All Jobs →
        </a>
      </div>

      {/* Referral */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Help a Worker
        </h2>
        <p className="text-gray-600 mb-3">
          Upload a worker profile and earn badges when they get hired.
        </p>

        <a
          href="/referral"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-block"
        >
          Upload Worker
        </a>
      </div>
    </div>
  );
}
