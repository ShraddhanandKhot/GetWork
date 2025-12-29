"use client";

interface Job {
    id: string;
    title: string;
    location: string;
    salary_range: string;
    description?: string;
}

interface ReferralJobsProps {
    jobs: Job[];
    onRefer: (jobId: string) => void;
}

export default function ReferralJobs({ jobs, onRefer }: ReferralJobsProps) {
    return (
        <div className="w-full max-w-6xl px-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Available Jobs to Refer
            </h3>
            {jobs.length === 0 ? (
                <p className="text-gray-500 text-center">
                    No jobs available at the moment.
                </p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
                        >
                            <div>
                                <h4 className="text-xl font-bold text-blue-600 mb-2">
                                    {job.title}
                                </h4>
                                <p className="text-gray-600 mb-2 font-medium">{job.location}</p>
                                <p className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full inline-block mb-4">
                                    {job.salary_range}
                                </p>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                                    {job.description}
                                </p>
                            </div>
                            <button
                                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-auto"
                                onClick={() => onRefer(job.id)}
                            >
                                Refer a Worker
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
