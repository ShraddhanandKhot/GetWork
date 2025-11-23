export default function JobDetails({ params }) {
  const jobId = params.id;

  // For now using static job data (later will connect backend)
  const job = {
    title: "Cleaner",
    company: "Hotel Sunrise",
    location: "Pune City",
    salary: "₹12,000 - ₹15,000",
    category: "Housekeeping",
    description:
      "We are hiring a full-time cleaner for our hotel. Responsibilities include room cleaning, dusting, mopping, and maintaining hygiene standards. No experience required.",
    phone: "9876543210",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Heading */}
      <h1 className="text-3xl font-bold text-green-600 mb-6">
        Job Details 📄
      </h1>

      {/* Job Card */}
      <div className="bg-white p-6 rounded-xl shadow border">

        <h2 className="text-2xl font-bold text-gray-800">{job.title}</h2>
        <p className="text-gray-600 text-sm mb-4">{job.company}</p>

        <div className="space-y-2 text-gray-700 text-sm">
          <p><strong>Location:</strong> {job.location}</p>
          <p><strong>Salary:</strong> {job.salary}</p>
          <p><strong>Category:</strong> {job.category}</p>
        </div>

        {/* Description */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Job Description
          </h3>
          <p className="text-gray-600">{job.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">

          <a
            href={`tel:${job.phone}`}
            className="flex-1 text-center py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Call Now
          </a>

          <button className="flex-1 py-3 bg-gray-800 text-white rounded-lg">
            Apply
          </button>

        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 mt-10">
        © {new Date().getFullYear()} GetWork — Job Details
      </div>
    </div>
  );
}
