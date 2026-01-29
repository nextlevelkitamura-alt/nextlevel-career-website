import { getPublicJobs, getAllUniqueTags } from "./actions";
import JobsClient from "./JobsClient";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
    const jobs = await getPublicJobs();
    const tags = await getAllUniqueTags();
    return <JobsClient initialJobs={jobs || []} availableTags={tags || []} />;
}
