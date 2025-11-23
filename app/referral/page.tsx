"use client";
import { useState } from "react";

export default function ReferralPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");

  const handleSubmit = () => {
    alert("Worker referred successfully! (Backend coming soon)");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Heading */}
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Refer a Worker 
      </h1>

      <p className="text-gray-600 mb-6">
        Help someone get a job by uploading their profile.  
        If they get hired, you will earn a badge!
      </p>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto">

        <input
          type="text"
          placeholder="Worker Name"
          className="w-full p-3 border rounded-lg mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Age"
          className="w-full p-3 border rounded-lg mb-3"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <input
          type="text"
          placeholder="Skills (Cleaning, Cooking...)"
          className="w-full p-3 border rounded-lg mb-3"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          className="w-full p-3 border rounded-lg mb-3"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          type="text"
          placeholder="Phone Number"
          className="w-full p-3 border rounded-lg mb-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="text"
          placeholder="Experience (Optional)"
          className="w-full p-3 border rounded-lg mb-5"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-green-700"
        >
          Submit Referral
        </button>

      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 mt-10">
        © {new Date().getFullYear()} GetWork — Referrals
      </div>
    </div>
  );
}
