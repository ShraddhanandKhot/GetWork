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
  const { user, isLoading, logout } = useAuth();
  const supabase = createClient();

  const role = user?.user_metadata?.role;

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

    if (role && role !== "organization") {
      setError("Access denied (not an organization)");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadOrCreateOrganization = async () => {
      try {
        const { data: existing, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

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
  }, [user, role, isLoading, supabase]);

  /* ---------- UI STATES ---------- */

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading organization…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Organization not found</p>
      </div>
    );
  }

  /* ---------- DASHBOARD ---------- */

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-6 relative">
        {/* Logout Button */}
        <button
          onClick={logout}
          className="absolute top-4 right-4 text-sm text-red-600 hover:underline"
        >
          Logout
        </button>

        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome, {org.name}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Organization Dashboard
        </p>

        {/* Info Container */}
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="font-medium text-gray-700">Email</span>
            <span className="text-gray-600">{org.email || "-"}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-medium text-gray-700">Phone</span>
            <span className="text-gray-600">{org.phone || "-"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-gray-700">Location</span>
            <span className="text-gray-600">{org.location || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
