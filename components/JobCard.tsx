import { Job } from "@/app/jobs/jobsData";
import { Button } from "@/components/ui/button";
import { MapPin, Banknote, Tag, CalendarDays } from "lucide-react";
import Link from "next/link";

interface JobCardProps {
    job: Job;
}

export default function JobCard({ job }: JobCardProps) {
    const formatDisplayValue = (value: string | undefined) => {
        if (!value) return null;
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.join(" / ");
            }
        } catch {
            // Not a JSON string, return as is
        }
        return value;
    };

    return (
        <Link
            href={`/jobs/${job.id}`}
            className="block h-full"
        >
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow flex flex-col h-full group">
                <div className="flex items-start justify-between mb-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                        {job.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: {job.job_code || "-"}</span>
                </div>

                <div className="mb-4">
                    <span className="text-sm text-slate-500">{job.type}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-4 line-clamp-2 flex-grow group-hover:text-primary-600 transition-colors">
                    {job.title}
                </h3>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{job.area}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                        <Banknote className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{job.salary}</span>
                    </div>
                    {job.holidays && (
                        <div className="flex items-center text-sm text-slate-600">
                            <CalendarDays className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{formatDisplayValue(job.holidays)}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {job.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-auto">
                    <Button asChild className="w-full bg-primary-600 hover:bg-primary-700 border-0 pointer-events-none">
                        <span className="flex items-center justify-center">詳細を見る</span>
                    </Button>
                </div>
            </div>
        </Link>
    );
}
