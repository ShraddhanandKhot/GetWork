"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function ReferralPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginRole, setLoginRole] = useState<"referral" | "worker">("referral");

  // Login State
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const { login, isLoggedIn, role, logout } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (isLoggedIn) {
      const storedName = localStorage.getItem("name");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    const endpoint =
      loginRole === "worker"
        ? "https://getwork-backend.onrender.com/api/worker/login"
        : "https://getwork-backend.onrender.com/api/referral/login";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Login failed");
        return;
      }

      // Use the actual role so workers can see their dashboard
      const sessionRole = loginRole;

      // Save token and forced role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", sessionRole);

      // Save name if available
      if (data.user?.name) localStorage.setItem("name", data.user.name);
      if (data.referral?.name) localStorage.setItem("name", data.referral.name);

      // Update context
      login(data.token, sessionRole);

      alert("Login Successful as Referral!");
      router.refresh();

    } catch (err) {
      console.error(err);
      alert("Server error during login");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch("https://getwork-backend.onrender.com/api/referral/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Registration Successful! Please login.");
        setActiveTab("login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error during registration");
    }
  };

  // Job State
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total: number; points: number; pending: number; badges: string[] }>({ total: 0, points: 0, pending: 0, badges: [] });

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://getwork-backend.onrender.com/api/referral/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Calculate pending from referrals list if not provided directly
        const pendingCount = data.referrals ? data.referrals.filter((r: any) => r.status === 'pending').length : 0;
        setStats({
          total: data.stats.total || 0,
          points: data.stats.successful || 0,
          pending: pendingCount,
          badges: data.stats.badges || []
        });
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn && (role === "referral" || role === "worker")) {
      fetch("https://getwork-backend.onrender.com/api/referral/jobs")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setJobs(data.jobs);
        })
        .catch((err) => console.error(err));

      fetchStats();
    }
  }, [isLoggedIn, role]);

  // Referral Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [workerForm, setWorkerForm] = useState({
    name: "",
    phone: "",
    password: "",
    age: "",
    skills: "",
    location: "",
    experience: "",
  });

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
      password: "",
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
      const token = localStorage.getItem("token");
      const res = await fetch("https://getwork-backend.onrender.com/api/referral/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobId: selectedJobId,
          workerName: workerForm.name,
          workerPhone: workerForm.phone,
          workerPassword: workerForm.password,
          workerDetails: {
            age: workerForm.age,
            skills: workerForm.skills, // Backend handles string splitting if needed, or we can split here
            location: workerForm.location,
            experience: workerForm.experience,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Referral Submitted Successfully!");
        closeReferralModal();
        fetchStats();
      } else {
        alert(data.message || "Failed to submit referral");
      }
    } catch (err) {
      console.error(err);
      alert("Server error during referral submission");
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
                <div key={job._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-blue-600 mb-2">{job.title}</h4>
                    <p className="text-gray-600 mb-2 font-medium">{job.location}</p>
                    <p className="text-green-600 font-semibold mb-4">{job.salaryRange}</p>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">{job.description}</p>
                  </div>
                  <button
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-auto"
                    onClick={() => openReferralModal(job._id)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">Set Password (for Worker)</label>
                  <input
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={workerForm.password}
                    onChange={(e) => setWorkerForm({ ...workerForm, password: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a:
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="loginRole"
                    value="referral"
                    checked={loginRole === "referral"}
                    onChange={() => setLoginRole("referral")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">Referral Partner</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="loginRole"
                    value="worker"
                    checked={loginRole === "worker"}
                    onChange={() => setLoginRole("worker")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">Worker</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="login-phone" className="sr-only">
                Phone Number
              </label>
              <input
                id="login-phone"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Phone Number"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
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
