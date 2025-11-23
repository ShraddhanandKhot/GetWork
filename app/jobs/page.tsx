export default function JobListingPage() {
  const jobs = [
    {
      id: 1,
      title: "Cleaner",
      company: "Hotel Sunrise",
      location: "Pune City",
      salary: "₹12,000 - ₹15,000",
      category: "Housekeeping",
    },
    {
      id: 2,
      title: "Kitchen Helper",
      company: "Food Plaza Restaurant",
      location: "Pune Camp",
      salary: "₹10,000 - ₹12,500",
      category: "Restaurant Staff",
    },
    {
      id: 3,
      title: "Security Guard",
      company: "Galaxy Mall",
      location: "Pune Hadapsar",
      salary: "₹14,000 - ₹18,000",
      category: "Security",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Page Heading */}
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        Available Jobs 🔍
      </h1>

      {/* Job Cards */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-5 bg-white rounded-xl shadow border"
          >
            <h2 className="text-xl font-bold">{job.title}</h2>
            <p className="text-gray-600 text-sm">
              {job.company}
            </p>

            <div className="mt-2 text-gray-700 text-sm">
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Salary:</strong> {job.salary}</p>
              <p><strong>Category:</strong> {job.category}</p>
            </div>

            <a
              href={`/jobs/${job.id}`}
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              View Job
            </a>
          </div>
        ))}
      </div>

      {/* End */}
      <div className="text-center text-gray-600 mt-10">
        © {new Date().getFullYear()} GetWork — Job Listings
      </div>
    </div>
  );
}
