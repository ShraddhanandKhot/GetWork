"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { hardLogout } from "@/utils/auth-helpers";

type Stats = {
  total: number;
  points: number;
  pending: number;
  badges: string[];
};

export default function ReferralPage() {
  const { user, role, isLoading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  // UI state
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    points: 0,
    pending: 0,
    badges: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [workerForm, setWorkerForm] = useState({
    name: "",
    phone: "",
    age: "",
    skills: "",
    location: "",
    experience: "",
  });

  /* -------------------- AUTH + INITIAL LOAD -------------------- */
  useEffect(() => {
    if (authLoading) return;

    // Not logged in → show login/register UI
    if (!user) {
      setLoading(false);
      return;
    }

    // Logged in but wrong role → redirect
    if (role && role !== "referral" && role !== "worker") {
      setLoading(false);
      router.push("/");
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        // Fetch user name
        if (role === "referral") {
          const { data } = await supabase
            .from("referral_partners")
            .select("name")
            .eq("user_id", user.id)
            .limit(1);

          if (!cancelled && data?.[0]) setUserName(data[0].name);
        } else {
          const { data } = await supabase
            .from("workers")
            .select("name")
            .eq("user_id", user.id)
            .limit(1);

          if (!cancelled && data?.[0]) setUserName(data[0].name);
        }

        // Fetch jobs
        const { data: jobsData } = await supabase.from("jobs").select("*");
        if (!cancelled) setJobs(jobsData || []);

        // Fetch stats (only for referral role)
        if (role === "referral") {
          const { data: referrals } = await supabase
            .from("referrals")
            .select("status")
            .eq("partner_id", user.id);

          if (referrals && !cancelled) {
            const total = referrals.length;
            const success = referrals.filter(
              r => r.status === "hired" || r.status === "accepted"
            ).length;
            const pending = referrals.filter(r => r.status === "pending").length;

            const badges: string[] = [];
            if (success >= 5) badges.push("Top Referrer");
            if (total >= 10) badges.push("Active Scout");

            setStats({
              total,
              pending,
              points: success * 10,
              badges,
            });
          }
        }
      } catch (err) {
        console.error("Referral page error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, role, supabase, router]);

  /* -------------------- AUTH ACTIONS -------------------- */
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      alert(error.message);
      return;
    }
  };

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: {
          full_name: regName,
          phone: regPhone,
          role: "referral",
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Registration successful. Please login.");
    setActiveTab("login");
  };

  /* -------------------- REFERRAL SUBMIT -------------------- */
  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedJobId) return;

    const { error } = await supabase.from("referrals").insert({
      partner_id: user.id,
      job_id: selectedJobId,
      candidate_name: workerForm.name,
      candidate_phone: workerForm.phone,
      candidate_details: workerForm,
      status: "pending",
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Referral submitted");
    setShowModal(false);
  };

  /* -------------------- LOADING -------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-blue-600 font-medium">Loading session…</p>
      </div>
    );
  }

  /* -------------------- LOGGED IN VIEW -------------------- */
  if (user && (role === "referral" || role === "worker")) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-white p-6 rounded shadow mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2">
            Welcome, {userName || "Referral Partner"}
          </h1>

          <button
            onClick={hardLogout}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">Available Jobs</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">{job.title}</h3>
              <p className="text-sm text-gray-600">{job.location}</p>
              <p className="text-green-700 font-semibold">{job.salary_range}</p>
              <button
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded"
                onClick={() => {
                  setSelectedJobId(job.id);
                  setShowModal(true);
                }}
              >
                Refer Worker
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* -------------------- LOGIN / REGISTER -------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <div className="flex mb-4">
          <button
            className={`flex-1 ${activeTab === "login" ? "font-bold" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 ${activeTab === "register" ? "font-bold" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        {activeTab === "login" ? (
          <>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Email"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
            />
            <input
              className="border p-2 w-full mb-4"
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              Login
            </button>
          </>
        ) : (
          <>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Name"
              value={regName}
              onChange={e => setRegName(e.target.value)}
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Email"
              value={regEmail}
              onChange={e => setRegEmail(e.target.value)}
            />
            <input
              className="border p-2 w-full mb-2"
              placeholder="Phone"
              value={regPhone}
              onChange={e => setRegPhone(e.target.value)}
            />
            <input
              className="border p-2 w-full mb-4"
              type="password"
              placeholder="Password"
              value={regPassword}
              onChange={e => setRegPassword(e.target.value)}
            />
            <button
              onClick={handleRegister}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}
