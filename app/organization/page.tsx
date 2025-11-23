export default function OrganizationDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Organization Dashboard 
      </h1>

      {/* Organization Profile */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Your Company Profile
        </h2>

        <div className="space-y-2 text-gray-600">
          <p><strong>Name:</strong> Hotel Sunshine Pvt Ltd</p>
          <p><strong>Location:</strong> Pune City</p>
          <p><strong>Phone:</strong> 9876543210</p>
        </div>

        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
          Edit Profile
        </button>
      </div>

      {/* Create Job Button */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Manage Jobs
        </h2>

        <a
          href="/organization/create-job"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg inline-block mb-4"
        >
          + Post New Job
        </a>

        {/* Example Posted Job */}
        <div className="p-4 border rounded-lg mb-3 bg-gray-50">
          <h3 className="text-lg font-bold">Cleaner Required</h3>
          <p className="text-gray-600 text-sm">Salary: ₹12,000 - ₹15,000</p>
          <p className="text-gray-600 text-sm">Applicants: 5</p>

          <div className="flex gap-3 mt-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
              View Details
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
              Delete
            </button>
          </div>
        </div>

        <div className="p-4 border rounded-lg mb-3 bg-gray-50">
          <h3 className="text-lg font-bold">Kitchen Helper</h3>
          <p className="text-gray-600 text-sm">Salary: ₹10,000 - ₹12,500</p>
          <p className="text-gray-600 text-sm">Applicants: 2</p>

          <div className="flex gap-3 mt-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
              View Details
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
              Delete
            </button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center mt-10 text-gray-600">
        © {new Date().getFullYear()} GetWork — Organization Panel.
      </div>
    </div>
  );
}
