"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function EditWorker() {
  const [profile, setProfile] = useState(null);
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    name: "",
    age: "",
    skills: "",
    location: "",
    email: ""
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data as any);
        setForm({
          name: data.name || "",
          age: data.age || "",
          skills: data.skills ? data.skills.join(", ") : "",
          location: data.location || "",
          email: data.email || user.email || "",
        });
      }
    }

    loadProfile();
  }, [supabase, router]);

  const handleUpdate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('workers')
      .update({
        name: form.name,
        age: form.age, // Ensure DB expects string or convert to number
        skills: form.skills.split(",").map(s => s.trim()),
        location: form.location,
        email: form.email
      })
      .eq('id', user.id);

    if (error) {
      alert("Failed to update: " + error.message);
    } else {
      alert("Profile Updated Successfully");
      router.push("/worker");
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Edit Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto">
        <input
          className="w-full p-3 border rounded-lg mb-4 placeholder-text-gray-600 text-gray-600"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="w-full p-3 border rounded-lg mb-4 placeholder-text-gray-600 text-gray-600"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="w-full p-3 border rounded-lg mb-4 placeholder-text-gray-600 text-gray-600"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />

        <input
          className="w-full p-3 border rounded-lg mb-4 placeholder-text-gray-600 text-gray-600"
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
        />

        <input
          className="w-full p-3 border rounded-lg mb-4 placeholder-text-gray-600 text-gray-600"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />

        <button
          onClick={handleUpdate}
          className="w-full py-3 bg-blue-600 text-white rounded-lg"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
