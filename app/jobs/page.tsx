import { getPublicJobs } from "./actions";
import JobsClient from "./JobsClient";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
    const jobs = await getPublicJobs();
    return <JobsClient initialJobs={jobs || []} />;
}
