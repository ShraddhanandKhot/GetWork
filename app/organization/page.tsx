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
    if (isLoading) return;

    if (!user) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    // 🚨 Only block if role is known AND wrong
    if (role && role !== "organization") {
      setError("Access denied (not an organization)");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadOrCreateOrganization = async () => {
      try {
        // 1️⃣ Try fetch
        const { data: existing, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        // 2️⃣ Create if missing
        if (!existing) {
          const meta = user.user_metadata || {};

          const { error: insertError } = await supabase
            .from("organizations")
            .insert({
              user_id: user.id,
              name: meta.full_name || "New Organization",
              email: user.email,
              phone: meta.phone || null,
              location: meta.location || null,
            });

          if (insertError) throw insertError;

          // 3️⃣ Fetch newly created row
          const { data: created, error: retryError } = await supabase
            .from("organizations")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (retryError) throw retryError;

          if (!cancelled) setOrg(created);
        } else {
          if (!cancelled) setOrg(existing);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOrCreateOrganization();

    return () => {
      cancelled = true;
    };
  }, [user, role, isLoading]);

  /* ---------- UI STATES ---------- */

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
    return <p style={{ padding: 24 }}>Organization not found</p>;
  }

  /* ---------- DASHBOARD ---------- */

  return (
    <div style={{ padding: 24 }}>
      <h1>Welcome, {org.name}</h1>
      <p><b>Email:</b> {org.email}</p>
      <p><b>Phone:</b> {org.phone}</p>
      <p><b>Location:</b> {org.location}</p>
    </div>
  );
}
