"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@/utils/supabase/client";

interface Organization {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
}

export default function OrganizationPage() {
  const { user, isLoading } = useAuth();
  const supabase = createClient();

  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!user) return;

    const load = async () => {
      // 1️⃣ Fetch org by user_id
      const { data } = await supabase
        .from("organizations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setOrg(data);
        setLoading(false);
        return;
      }

      // 2️⃣ Create org profile (FIRST LOGIN)
      const { error } = await supabase.from("organizations").insert({
        user_id: user.id,           // 🔑 REQUIRED
        name: "My Organization",
        email: user.email,
        phone: "",
        location: "",
      });

      if (error) {
        console.error("Profile creation failed:", error.message);
        setLoading(false);
        return;
      }

      // 3️⃣ Re-fetch
      const retry = await supabase
        .from("organizations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setOrg(retry.data ?? null);
      setLoading(false);
    };

    load();
  }, [user, isLoading]);

  if (isLoading || loading) {
    return <p>Loading organization…</p>;
  }

  if (!org) {
    return <p>Organization profile could not be loaded</p>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome, {org.name}</h1>
      <p>Email: {org.email}</p>
      <p>Location: {org.location}</p>
    </div>
  );
}
