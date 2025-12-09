import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import * as motion from "framer-motion/client";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      <section className="text-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-gray-800 leading-tight">
            Your Bridge to <span className="text-blue-600">Local Work</span>
          </h2>

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
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/30 transition-shadow flex items-center gap-3"
              >
                <Search size={24} />
                <div className="text-left">
                  <div className="font-bold text-lg leading-none">Find Jobs</div>
                  <div className="text-sm font-normal opacity-90">Browse Opportunities</div>
                </div>
              </motion.button>
            </Link>

            <Link href="/referral">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#eff6ff" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl shadow-lg hover:shadow-blue-200 transition-shadow flex items-center gap-3"
              >
                <UserPlus size={24} />
                <div className="text-left">
                  <div className="font-bold text-lg leading-none">Refer a Worker</div>
                  <div className="text-sm font-normal opacity-90">Help & Earn</div>
                </div>
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-14 bg-white">
        <h3 className="text-3xl font-bold text-center mb-10 text-black">Why <span className="text-blue-600">GetWork</span>?</h3>

        <div className="grid md:grid-cols-3 gap-6">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-gray-50 rounded-xl shadow"
          >
            <h4 className="text-xl font-semibold text-blue-600 mb-2">For Workers</h4>
            <p className="text-gray-600">
              Simple job discovery, fair wages, direct contact with employers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-gray-50 rounded-xl shadow"
          >
            <h4 className="text-xl font-semibold text-blue-600 mb-2">For Businesses</h4>
            <p className="text-gray-600">
              Hire verified workers nearby — fast, reliable and affordable.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="p-6 bg-gray-50 rounded-xl shadow"
          >
            <h4 className="text-xl font-semibold text-blue-600 mb-2">For Community</h4>
            <p className="text-gray-600">
              Help local workers get jobs and earn badges for referrals.
            </p>
          </motion.div>

        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 bg-gray-100">
        <h3 className="text-3xl font-bold text-center mb-12 text-black">How It Works</h3>

        <div className="space-y-8">

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-start gap-4"
          >
            <span className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full text-xl font-bold">
              1
            </span>
            <p className="text-gray-700 text-lg">
              Workers or helpers create a simple profile.
            </p>
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-4"
          >
            <span className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full text-xl font-bold">
              2
            </span>
            <p className="text-gray-700 text-lg">
              Businesses post local job openings.
            </p>
          </motion.div>

          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-4"
          >
            <span className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full text-xl font-bold">
              3
            </span>
            <p className="text-gray-700 text-lg">
              Workers apply or get contacted directly.
            </p>
          </motion.div>

        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-white border-t mt-10 text-gray-600">
        © {new Date().getFullYear()} GetWork — All Rights Reserved. Developed By - Shraddhanand K Khot
      </footer>
    </div>
  );




}
export default Home;