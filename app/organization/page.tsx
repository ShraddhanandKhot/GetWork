"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createClient } from "@/utils/supabase/client";

interface Organization {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  created_at: string;
}

export default function OrganizationPage() {
  const { user, role, isLoading } = useAuth();
  const supabase = createClient();

  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1️⃣ Wait for auth to finish
    if (isLoading) return;

    // 2️⃣ Must be logged in
    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    // 3️⃣ Must be organization
    if (role !== "organization") {
      setError("Access denied (not an organization)");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadOrganization = async () => {
      try {
        // 4️⃣ Fetch organization by user_id (RLS SAFE)
        const { data, error: fetchError } = await supabase
          .from("organizations")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        // 5️⃣ If exists → done
        if (data) {
          if (!cancelled) setOrg(data);
          return;
        }

        // 6️⃣ Create profile on first login (FINAL FIX)

        // MUST verify session (not user)
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          throw new Error("Session not established yet. Refresh and try again.");
        }

        const sessionUser = sessionData.session.user;

        console.log("SESSION UID USED FOR INSERT:", sessionUser.id);

        const { error: insertError } = await supabase
          .from("organizations")
          .insert({
            user_id: sessionUser.id,   // ✅ THIS MATCHES auth.uid()
            name: "My Organization",
            email: sessionUser.email,
            phone: "",
            location: "",
          });

        if (insertError) {
          console.error("INSERT BLOCKED BY RLS:", insertError);
          throw insertError;
        }

        // 7️⃣ Re-fetch after insert
        const { data: retryData, error: retryError } = await supabase
          .from("organizations")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (retryError) {
          throw retryError;
        }

        if (!cancelled) setOrg(retryData);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrganization();

    return () => {
      cancelled = true;
    };
  }, [user, role, isLoading]);

  /* ---------------- UI STATES ---------------- */

  if (isLoading || loading) {
    return <p style={{ padding: 24 }}>Loading organization…</p>;
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!org) {
    return (
      <div style={{ padding: 24 }}>
        <p>Organization profile not found</p>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */

  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome, {org.name}</h1>
      <p><b>Email:</b> {org.email}</p>
      <p><b>Phone:</b> {org.phone}</p>
      <p><b>Location:</b> {org.location}</p>
    </div>
  );
}
