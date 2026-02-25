"use client";

import JobCard from "@/components/JobCard";
import SearchForm from "@/components/SearchForm";
import Image from "next/image";
import Link from "next/link";

import { Job } from "@/app/jobs/jobsData";

type JobsClientProps = {
    jobs: Job[];
    initialArea?: string;
    initialType?: string;
    initialCategory?: string;
    currentPage: number;
    totalPages: number;
};

export default function JobsClient({
    jobs,
    initialArea = "",
    initialType = "",
    initialCategory = "",
    currentPage,
    totalPages,
}: JobsClientProps) {
    const buildPageLink = (page: number) => {
        const params = new URLSearchParams();
        if (initialArea) params.set("area", initialArea);
        if (initialType) params.set("type", initialType);
        if (initialCategory) params.set("category", initialCategory);
        if (page > 1) params.set("page", String(page));
        const query = params.toString();
        return query ? `/jobs?${query}` : "/jobs";
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Section with Background Image */}
            <div className="relative py-16 lg:py-24">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/jobs-bg.jpg"
                        alt="Job Search Background"
                        fill
                        className="object-cover opacity-50"
                        priority
                    />
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
                </div>

                <div className="container relative z-10 mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <SearchForm initialArea={initialArea} initialType={initialType} initialCategory={initialCategory} />
                    </div>
                </div>
            </div>

            {/* Job List Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.length > 0 ? (
                        jobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            条件に一致する求人は見つかりませんでした。
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-3">
                        <Link
                            href={buildPageLink(Math.max(1, currentPage - 1))}
                            aria-disabled={currentPage <= 1}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium ${currentPage <= 1 ? "pointer-events-none bg-slate-100 text-slate-400 border-slate-200" : "bg-white text-slate-700 border-slate-300 hover:border-primary-400 hover:text-primary-700"}`}
                        >
                            前へ
                        </Link>
                        <span className="text-sm text-slate-600">{currentPage} / {totalPages}</span>
                        <Link
                            href={buildPageLink(Math.min(totalPages, currentPage + 1))}
                            aria-disabled={currentPage >= totalPages}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium ${currentPage >= totalPages ? "pointer-events-none bg-slate-100 text-slate-400 border-slate-200" : "bg-white text-slate-700 border-slate-300 hover:border-primary-400 hover:text-primary-700"}`}
                        >
                            次へ
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
