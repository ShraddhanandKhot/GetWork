import Link from "next/link";
const Home = () =>{
  return(
    <div className = "min-h-screen bg-gray-50">
     
      <section className="text-center px-6 py-16">
        <h2 className="text-4xl font-bold text-gray-800 leading-tight">
          Your Bridge to <span className="text-blue-600">Local Work</span>
        </h2>

        <p className="text-gray-600 max-w-xl mx-auto mt-4">
          Connecting local workers with nearby businesses quickly, easily and transparently.
        </p>

        <div className="flex justify-center mt-8 gap-4 flex-wrap">
          <Link href="/jobs">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow">
              Find Jobs
            </button>
          </Link>

          <Link href="/referral">
            <button className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl shadow">
              Upload a Worker
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-14 bg-white">
        <h3 className="text-3xl font-bold text-center mb-10 text-black">Why <span className= "text-blue-600">GetWork</span>?</h3>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="p-6 bg-gray-50 rounded-xl shadow">
            <h4 className="text-xl font-semibold text-blue-600 mb-2">For Workers</h4>
            <p className="text-gray-600">
              Simple job discovery, fair wages, direct contact with employers.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl shadow">
            <h4 className="text-xl font-semibold text-blue-600 mb-2">For Businesses</h4>
            <p className="text-gray-600">
              Hire verified workers nearby — fast, reliable and affordable.
            </p>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl shadow">
            <h4 className="text-xl font-semibold text-blue-600 mb-2">For Community</h4>
            <p className="text-gray-600">
              Help local workers get jobs and earn badges for referrals.
            </p>
          </div>

        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 bg-gray-100">
        <h3 className="text-3xl font-bold text-center mb-12 text-black">How It Works</h3>

        <div className="space-y-8">

          <div className="flex items-start gap-4">
            <span className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full text-xl font-bold">
              1
            </span>
            <p className="text-gray-700 text-lg">
              Workers or helpers create a simple profile.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <span className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full text-xl font-bold">
              2
            </span>
            <p className="text-gray-700 text-lg">
              Businesses post local job openings.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <span className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full text-xl font-bold">
              3
            </span>
            <p className="text-gray-700 text-lg">
              Workers apply or get contacted directly.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-white border-t mt-10 text-gray-600">
        © {new Date().getFullYear()} GetWork — All Rights Reserved.
      </footer>
    </div>
  );
   
  


}
export default Home;