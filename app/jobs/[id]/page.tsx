import JobDetailsClient from "./JobDetailsClient";

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  return <JobDetailsClient jobId={params.id} />;
}
