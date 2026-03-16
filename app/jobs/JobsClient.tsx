"use client";

import JobCard from "@/components/JobCard";
import SearchForm from "@/components/SearchForm";
import Image from "next/image";
import Link from "next/link";

import { Job } from "@/app/jobs/jobsData";

const SORT_OPTIONS = [
    { value: "newest", label: "新着順" },
    { value: "popular", label: "おすすめ順" },
    { value: "salary", label: "給与が高い順" },
] as const;

type JobsClientProps = {
    jobs: Job[];
    initialArea?: string;
    initialType?: string;
    initialCategory?: string;
    initialSort?: string;
    categories?: string[];
    currentPage: number;
    totalPages: number;
};

export default function JobsClient({
    jobs,
    initialArea = "",
    initialType = "",
    initialCategory = "",
    initialSort = "newest",
    categories = [],
    currentPage,
    totalPages,
}: JobsClientProps) {
    const buildLink = (overrides: { page?: number; sort?: string }) => {
        const params = new URLSearchParams();
        if (initialArea) params.set("area", initialArea);
        if (initialType) params.set("type", initialType);
        if (initialCategory) params.set("category", initialCategory);
        const sort = overrides.sort ?? initialSort;
        if (sort && sort !== "newest") params.set("sort", sort);
        const page = overrides.page ?? 1;
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
                        <SearchForm initialArea={initialArea} initialType={initialType} initialCategory={initialCategory} categories={categories} />
                    </div>
                </div>
            </div>

            {/* Job List Section */}
            <div className="container mx-auto px-4 py-12">
                {/* ソート切り替え */}
                <div className="flex items-center justify-end mb-6 gap-1">
                    {SORT_OPTIONS.map((opt) => (
                        <Link
                            key={opt.value}
                            href={buildLink({ sort: opt.value })}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                initialSort === opt.value
                                    ? "bg-primary-600 text-white border-primary-600"
                                    : "bg-white text-slate-600 border-slate-300 hover:border-primary-400 hover:text-primary-700"
                            }`}
                        >
                            {opt.label}
                        </Link>
                    ))}
                </div>

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
                            href={buildLink({ page: Math.max(1, currentPage - 1) })}
                            aria-disabled={currentPage <= 1}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium ${currentPage <= 1 ? "pointer-events-none bg-slate-100 text-slate-400 border-slate-200" : "bg-white text-slate-700 border-slate-300 hover:border-primary-400 hover:text-primary-700"}`}
                        >
                            前へ
                        </Link>
                        <span className="text-sm text-slate-600">{currentPage} / {totalPages}</span>
                        <Link
                            href={buildLink({ page: Math.min(totalPages, currentPage + 1) })}
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
