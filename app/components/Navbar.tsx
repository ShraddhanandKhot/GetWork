"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Home, Briefcase, Users, LayoutDashboard, Building2, LogIn, LogOut, Menu, X } from "lucide-react";
import * as motion from "framer-motion/client";
import { AnimatePresence } from "framer-motion";
import Applications from "./Applications";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, role, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center relative z-50">

      {/* Logo */}
      <Link href="/">
        <h1 className="text-2xl font-bold text-blue-600 cursor-pointer flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg">
          GetWork
        </h1>
      </Link>

      {/* Menu Icon (Mobile) - Hidden as we use BottomNav */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        className="hidden md:hidden text-gray-700"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={28} /> : <Menu size={28} />}
      </motion.button>

      {/* Links */}
      <AnimatePresence>
        {(open || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`${open ? "block" : "hidden"
              } md:flex md:items-center md:gap-6 absolute md:static bg-white left-0 w-full md:w-auto top-16 md:top-auto p-6 md:p-0 shadow-lg md:shadow-none border-t md:border-none border-gray-100 overflow-hidden md:overflow-visible md:h-auto md:opacity-100`}
          >
            <Link href="/" className="flex items-center gap-2 py-3 md:py-0 text-gray-700 hover:text-blue-600 transition-colors">
              <Home size={18} /> Home
            </Link>
            <Link href="/jobs" className="flex items-center gap-2 py-3 md:py-0 text-gray-700 hover:text-blue-600 transition-colors">
              <Briefcase size={18} /> Jobs
            </Link>

            <Link href="/referral" className="flex items-center gap-2 py-3 md:py-0 text-gray-700 hover:text-blue-600 transition-colors">
              <Users size={18} /> Referral
            </Link>

            {isLoggedIn ? (
              <>
                {role === "worker" && (
                  <Link href="/worker" className="flex items-center gap-2 py-3 md:py-0 text-gray-700 hover:text-blue-600 transition-colors">
                    <LayoutDashboard size={18} /> Worker Dashboard
                  </Link>
                )}

                {role === "organization" && (
                  <Link href="/organization" className="flex items-center gap-2 py-3 md:py-0 text-gray-700 hover:text-blue-600 transition-colors">
                    <Building2 size={18} /> Organization Dashboard
                  </Link>
                )}

                <div className="hidden md:block">
                  <Applications />
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 mt-4 md:mt-0 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full md:w-auto justify-center"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <Link href="/login" className="block mt-4 md:mt-0">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto justify-center">
                  <LogIn size={18} /> Login
                </button>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
