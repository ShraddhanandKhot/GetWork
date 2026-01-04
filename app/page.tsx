"use client";

import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import * as motion from "framer-motion/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

const Home = () => {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  // 🔁 POST-LOGIN / POST-EMAIL-CONFIRMATION ROUTER
  useEffect(() => {
    if (isLoading) return;

    // Logged in → send to dashboard
    if (user) {
      // wait until role is resolved
      if (role === undefined) return;

      if (role === "worker") {
        router.replace("/worker");
        return;
      }

      if (role === "organization") {
        router.replace("/organization");
        return;
      }

      // role === null (profile not created yet)
      router.replace("/worker");
    }

  }, [user, role, isLoading, router]);

  // ⏳ While auth is resolving, avoid flicker
  if (isLoading) {
    return null;
  }

  // 🔓 NOT LOGGED IN → SHOW LANDING PAGE
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="text-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-4xl font-bold text-gray-800 leading-tight">
              Your Bridge to <span className="text-blue-600">Local Work</span>
            </h3>

            <p className="text-gray-600 max-w-xl mx-auto mt-4">
              Connecting local workers with nearby businesses quickly, easily and transparently.
            </p>
          </motion.div>

          <div className="flex justify-center mt-10">
            <div className="p-8 border-2 border-blue-600 rounded-3xl bg-blue-50 shadow-[0_0_25px_rgba(37,99,235,0.15)] flex flex-wrap gap-6 justify-center items-center max-w-2xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>

              <Link href="/jobs">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0px 0px 0px rgba(37, 99, 235, 0)",
                      "0px 0px 20px rgba(37, 99, 235, 0.5)",
                      "0px 0px 0px rgba(37, 99, 235, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl shadow-lg flex items-center gap-3"
                >
                  <Search size={24} />
                  <div className="text-left">
                    <div className="font-bold text-lg">Find Jobs</div>
                    <div className="text-sm opacity-90">Browse Opportunities</div>
                  </div>
                </motion.button>
              </Link>

              <Link href="/referral">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl shadow-lg flex items-center gap-3"
                >
                  <UserPlus size={24} />
                  <div className="text-left">
                    <div className="font-bold text-lg">Refer a Worker</div>
                    <div className="text-sm opacity-90">Help & Earn</div>
                  </div>
                </motion.button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 bg-white border-t mt-10 text-gray-600">
          © {new Date().getFullYear()} GetWork — All Rights Reserved. Developed By - Shraddhanand K Khot
        </footer>
      </div>
    );
  }

  // Logged in → redirecting
  return null;
};

export default Home;
