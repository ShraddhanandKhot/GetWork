"use client";
import { useState, useEffect } from "react";

export default function EditWorker() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    skills: "",
    location: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function loadProfile() {
      const res = await fetch("http://localhost:5000/api/worker/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setProfile(data.worker);
        setForm({
          name: data.worker.name,
          age: data.worker.age,
          skills: data.worker.skills.join(", "),
          location: data.worker.location,
        });
      }
    }

    loadProfile();
  }, []);

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/worker/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        skills: form.skills.split(",").map(s => s.trim())
      }),
    });

    const data = await res.json();

    alert(data.message);

    if (data.success) {
      window.location.href = "/worker";
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-green-600">Edit Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto">
        <input
          className="w-full p-3 border rounded-lg mb-4"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="w-full p-3 border rounded-lg mb-4"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />

        <input
          className="w-full p-3 border rounded-lg mb-4"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
        />

        <input
          className="w-full p-3 border rounded-lg mb-4"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <button
          onClick={handleUpdate}
          className="w-full py-3 bg-green-600 text-white rounded-lg"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
