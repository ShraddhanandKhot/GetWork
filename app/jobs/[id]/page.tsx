import JobDetailsClient from "./JobDetailsClient";

export default function Page({ params }: any) {
  console.log("ROUTE PARAMS:", params);
  return <JobDetailsClient jobId={params.id} />;
}

