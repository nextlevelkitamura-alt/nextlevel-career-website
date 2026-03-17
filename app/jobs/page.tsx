import { getPublicJobsList, getDistinctCategories } from "./actions";
import JobsClient from "./JobsClient";
import { recordPageView } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function JobsPage({ searchParams }: {
    searchParams: { area?: string; type?: string; category?: string; page?: string; sort?: string };
}) {
    void recordPageView("/jobs");
    const currentPage = Math.max(1, Number(searchParams.page) || 1);
    const categories = await getDistinctCategories();
    const result = await getPublicJobsList({
        area: searchParams.area || "",
        type: searchParams.type || "",
        category: searchParams.category || "",
        page: currentPage,
        sort: searchParams.sort || "newest",
    });

    return (
        <JobsClient
            jobs={result.jobs || []}
            initialArea={searchParams.area || ""}
            initialType={searchParams.type || ""}
            initialCategory={searchParams.category || ""}
            initialSort={searchParams.sort || "newest"}
            categories={categories}
            currentPage={result.page}
            totalPages={result.totalPages}
        />
    );
}
