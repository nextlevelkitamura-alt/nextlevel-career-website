"use client";

import { useState } from "react";
import JobCard from "@/components/JobCard";
import SearchForm from "@/components/SearchForm";
import Image from "next/image";

export type Job = {
    id: string;
    title: string;
    area: string;
    type: string;
    salary: string;
    category: string;
    tags: string[];
    job_code?: string;
    job_attachments?: {
        id: string;
        file_name: string;
        file_url: string;
        file_size: number;
    }[];
};

export default function JobsClient({ initialJobs }: { initialJobs: Job[] }) {
    const [filteredJobs, setFilteredJobs] = useState<Job[]>(initialJobs);

    const handleSearch = (filters: {
        area: string;
        type: string;
        category: string;
        keyword: string;
    }) => {
        const results = initialJobs.filter((job) => {
            const matchArea = filters.area ? job.area === filters.area : true;
            const matchType = filters.type ? job.type === filters.type : true;
            const matchCategory = filters.category ? job.category === filters.category : true;

            const keyword = filters.keyword.toLowerCase();
            const matchKeyword = keyword
                ? job.title.toLowerCase().includes(keyword) ||
                (job.tags && job.tags.some((tag) => tag.toLowerCase().includes(keyword)))
                : true;

            return matchArea && matchType && matchCategory && matchKeyword;
        });
        setFilteredJobs(results);
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
                        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                            求人を探す
                        </h1>
                        <SearchForm onSearch={handleSearch} />
                    </div>
                </div>
            </div>

            {/* Job List Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <JobCard key={job.id} job={job} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-slate-500">
                            条件に一致する求人は見つかりませんでした。
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
