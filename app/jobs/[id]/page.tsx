import JobDetailsClient from "./JobDetailsClient";

export default function Page({ params }: any) {
  return <JobDetailsClient jobId={params.id} />;
}
