import JobDetailsClient from "./JobDetailsClient";

export default function Page({ params }: any) {
  const id = params.id as string;
  return <JobDetailsClient jobId={id} />;
}

