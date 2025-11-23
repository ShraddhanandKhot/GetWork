export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <h1 className="text-3xl font-bold text-green-600 mb-6">
        Admin Dashboard 🛠️
      </h1>

      {/* Overview Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <div className="bg-white p-5 rounded-xl shadow border">
          <h2 className="text-lg font-semibold text-gray-700">Total Workers</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">120</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border">
          <h2 className="text-lg font-semibold text-gray-700">Organizations</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">45</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border">
          <h2 className="text-lg font-semibold text-gray-700">Pending Referrals</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">12</p>
        </div>

      </div>

      {/* Worker Management */}
      <div className="bg-white p-6 rounded-xl shadow border mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Worker Approvals
        </h2>

        {/* Worker Card */}
        <div className="p-4 border rounded-lg mb-3 bg-gray-50">
          <h3 className="text-lg font-bold">Ramesh Kumar</h3>
          <p className="text-gray-600 text-sm">Skills: Cleaning, Sweeping</p>
          <p className="text-gray-600 text-sm">Location: Pune</p>

          <div className="flex gap-3 mt-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
              Approve
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
              Reject
            </button>
          </div>
        </div>

      </div>

      {/* Organization Management */}
      <div className="bg-white p-6 rounded-xl shadow border mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Organization Approvals
        </h2>

        <div className="p-4 border rounded-lg mb-3 bg-gray-50">
          <h3 className="text-lg font-bold">Skyline Restaurant</h3>
          <p className="text-gray-600 text-sm">Location: Pune Camp</p>
          <p className="text-gray-600 text-sm">Phone: 9822334455</p>

          <div className="flex gap-3 mt-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
              Approve
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
              Reject
            </button>
          </div>
        </div>

      </div>

      {/* Referral Management */}
      <div className="bg-white p-6 rounded-xl shadow border mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Pending Referrals
        </h2>

        <div className="p-4 border rounded-lg mb-3 bg-gray-50">
          <h3 className="text-lg font-bold">Worker: Suresh</h3>
          <p className="text-gray-600 text-sm">Referred By: Amit</p>

          <div className="flex gap-3 mt-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
              Approve
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
              Reject
            </button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 mt-4">
        © {new Date().getFullYear()} GetWork — Admin Panel
      </div>
    </div>
  );
}

