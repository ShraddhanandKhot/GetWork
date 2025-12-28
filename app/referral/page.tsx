"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function ReferralPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginRole, setLoginRole] = useState<"referral" | "worker">("referral");

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const { isLoggedIn, role, logout } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const supabase = createClient();

  // Job State
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total: number; points: number; pending: number; badges: string[] }>({ total: 0, points: 0, pending: 0, badges: [] });

  // Referral Modal State
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

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch user name based on role
      const fetchName = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (role === 'referral') {
            const { data } = await supabase.from('referral_partners').select('name').eq('id', user.id).single();
            if (data) setUserName(data.name);
          } else {
            const { data } = await supabase.from('workers').select('name').eq('id', user.id).single();
            if (data) setUserName(data.name);
          }
        }
      };
      fetchName();

      fetchJobs();
      if (role === 'referral') fetchStats();
    }
  }, [isLoggedIn, role, supabase]);

  const fetchJobs = async () => {
    const { data, error } = await supabase.from('jobs').select('*');
    if (data) setJobs(data);
  };

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: referrals } = await supabase
      .from('referrals')
      .select('status')
      .eq('partner_id', user.id);

    if (referrals) {
      const total = referrals.length;
      const successful = referrals.filter(r => r.status === 'hired' || r.status === 'accepted').length;
      const pending = referrals.filter(r => r.status === 'pending').length;

      // Calculate badges logic here or fetch from backend if complex
      const badges = [];
      if (successful >= 5) badges.push("Top Referrer");
      if (total >= 10) badges.push("Active Scout");

      setStats({ total, points: successful * 10, pending, badges }); // Assuming 10 points per hire
    }
  };

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        alert(error.message);
        return;
      }

      // Lazy Profile Creation
      if (data.user) {
        const user = data.user;
        // Check if profile exists
        const { data: partner } = await supabase.from('referral_partners').select('id').eq('id', user.id).single();

        if (!partner) {
          console.log("Referral Profile missing, creating now...");
          const metadata = user.user_metadata || {};

          const { error: createError } = await supabase.from('referral_partners').insert({
            id: user.id,
            name: metadata.full_name || "",
            email: user.email,
            phone: (metadata.phone || "").replace(/^0+/, "")
          });

          if (createError) {
            console.error("Failed to create referral profile:", createError);
            alert("Login successful but profile setup failed: " + createError.message);
            return;
          }

          // Force reload to update AuthContext with new role
          window.location.reload();
          return;
        }
      }

      alert("Login Successful!");
      // If profile existed, context might naturally update or we might need reload if role was null
      // But typically if they logged in before, they have role.

    } catch (err) {
      console.error(err);
      alert("Error during login");
    }
  };

  const handleRegister = async () => {
    try {
      // 1. Sign Up - Store metadata for lazy profile creation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regName,
            phone: regPhone,
            role: 'referral'
          }
        }
      });

      if (authError) {
        alert(authError.message);
        return;
      }

      if (authData.user) {
        // 2. Success - Switch to Login
        alert("Registration Successful! Please Login to complete setup.");
        setActiveTab("login");
      }
    } catch (err) {
      console.error(err);
      alert("Error during registration");
    }
  };

  const openReferralModal = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowModal(true);
  };

  const closeReferralModal = () => {
    setShowModal(false);
    setSelectedJobId(null);
    setWorkerForm({
      name: "",
      phone: "",
      age: "",
      skills: "",
      location: "",
      experience: "",
    });
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('referrals').insert({
        partner_id: user.id,
        job_id: selectedJobId,
        candidate_name: workerForm.name,
        candidate_phone: workerForm.phone,
        candidate_details: {
          age: workerForm.age,
          skills: workerForm.skills,
          location: workerForm.location,
          experience: workerForm.experience
        },
        status: 'pending'
      });

      if (error) {
        alert("Failed to submit: " + error.message);
      } else {
        alert("Referral Submitted Successfully!");
        closeReferralModal();
        fetchStats();
      }
    } catch (err) {
      console.error(err);
      alert("Error during submission");
    }
  };

  // If logged in as referral (or worker acting as referral), show profile
  if (isLoggedIn && (role === "referral" || role === "worker")) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Welcome, {userName || "Referral Partner"}!
          </h2>
          <p className="text-gray-600 mb-8">
            You are now logged in. Start referring workers to earn rewards.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg mb-8">
            <h3 className="font-semibold text-blue-800 mb-2">Your Stats</h3>
            <div className="flex justify-between text-sm text-blue-700">
              <span className="font-bold cursor-pointer hover:underline" onClick={() => router.push('/referral/history')}>
                Referral Points:
              </span>
              <span className="font-bold cursor-pointer hover:underline" onClick={() => router.push('/referral/history')}>
                {stats.points}
              </span>
            </div>
            <div className="flex justify-between text-sm text-blue-700 mt-1">
              <span>Pending:</span>
              <span className="font-bold">{stats.pending}</span>
            </div>
            {stats.badges && stats.badges.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2 text-sm">Badges</h4>
                <div className="flex flex-wrap gap-2">
                  {stats.badges.map((badge, idx) => (
                    <span key={idx} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded border border-yellow-300">
                      🏆 {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              logout();
              router.refresh();
            }}
            className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>

        {/* Jobs Grid */}
        <div className="w-full max-w-6xl px-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Jobs to Refer</h3>
          {jobs.length === 0 ? (
            <p className="text-gray-500 text-center">No jobs available at the moment.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-blue-600 mb-2">{job.title}</h4>
                    <p className="text-gray-600 mb-2 font-medium">{job.location}</p>
                    <p className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full inline-block mb-4">{job.salary_range}</p>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">{job.description}</p>
                  </div>
                  <button
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-auto"
                    onClick={() => openReferralModal(job.id)}
                  >
                    Refer a Worker
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Referral Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Refer a Worker</h3>
                <button onClick={closeReferralModal} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleReferralSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Worker Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={workerForm.name}
                    onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={workerForm.phone}
                    onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      value={workerForm.age}
                      onChange={(e) => setWorkerForm({ ...workerForm, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                      value={workerForm.experience}
                      onChange={(e) => setWorkerForm({ ...workerForm, experience: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={workerForm.location}
                    onChange={(e) => setWorkerForm({ ...workerForm, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={workerForm.skills}
                    onChange={(e) => setWorkerForm({ ...workerForm, skills: e.target.value })}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Submit Referral
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ... (keeping previous code for render) ... */
  /* Wait, I cannot use comments to skip code in replace_file_content. I must provide the exact replacement for the chunk. */
  /* Since the duplication is large, I will target the end of the file. */
  /* Actually, I will just rewrite the `return` block and the end of the component to be clean. */

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">

        {/* Header */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Referral Program
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join us and earn rewards by referring workers.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 text-center font-medium text-sm focus:outline-none ${activeTab === "login"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 text-center font-medium text-sm focus:outline-none ${activeTab === "register"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <div className="space-y-6">
            <div>
              <label htmlFor="login-email" className="sr-only">
                Email
              </label>
              <input
                id="login-email"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email Address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="login-password" className="sr-only">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>

            <button
              onClick={handleLogin}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          </div>
        )}

        {/* Register Form */}
        {activeTab === "register" && (
          <div className="space-y-6">
            <div>
              <label htmlFor="reg-name" className="sr-only">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-3"
                placeholder="Full Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="sr-only">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-3"
                placeholder="Email address"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reg-phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="reg-phone"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-3"
                placeholder="Phone Number"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="sr-only">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>

            <button
              onClick={handleRegister}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Register as Referral
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
