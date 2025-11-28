"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, role, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">

      {/* Logo */}
      <Link href="/">
        <h1 className="text-2xl font-bold text-blue-600 cursor-pointer">
          GetWork
        </h1>
      </Link>

      {/* Menu Icon (Mobile) */}
      <button
        className="md:hidden text-2xl"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      {/* Links */}
      <div
        className={`${open ? "block" : "hidden"
          } md:flex md:items-center md:gap-6 absolute md:static bg-white left-0 w-full md:w-auto top-16 md:top-auto p-6 md:p-0 shadow md:shadow-none`}
      >
        <Link href="/" className="block py-2 md:py-0 text-gray-700">Home</Link>
        <Link href="/jobs" className="block py-2 md:py-0 text-gray-700">
          Jobs
        </Link>

        <Link href="/referral" className="block py-2 md:py-0 text-gray-700">
          Referral
        </Link>

        {isLoggedIn ? (
          <>
            {role === "worker" && (
              <Link href="/worker" className="block py-2 md:py-0 text-gray-700">
                Worker Dashboard
              </Link>
            )}

            {role === "organization" && (
              <Link href="/organization" className="block py-2 md:py-0 text-gray-700">
                Organization Dashboard
              </Link>
            )}

            <button
              onClick={logout}
              className="mt-2 md:mt-0 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login">
            <button className="mt-2 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg">
              Login
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
