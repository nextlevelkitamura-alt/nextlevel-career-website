import { getEmploymentTypeStyle, getJobTagStyle, cn } from "@/lib/utils";
import { Job } from "@/app/jobs/jobsData";
import { MapPin, Banknote, CalendarDays } from "lucide-react";
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
            className="block h-full group"
        >
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200 flex flex-col h-full relative overflow-hidden">
                {/* Top Badge Row */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-2">
                        <span className={cn("px-3 py-1 rounded text-xs font-bold leading-none flex items-center", getEmploymentTypeStyle(job.type))}>
                            {job.type}
                        </span>
                        <span className="px-2 py-1 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {job.category}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
                    {job.title}
                </h3>

                {/* Essential Info Grid */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-start">
                        <Banknote className="w-4 h-4 mr-1.5 text-primary-600 mt-0.5 flex-shrink-0" />
                        <span className="text-base font-bold text-slate-900 bg-yellow-50 px-1 -ml-1 rounded">
                            {job.salary}
                        </span>
                    </div>

                    <div className="flex items-start text-sm text-slate-600">
                        <MapPin className="w-4 h-4 mr-1.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{job.area}</span>
                    </div>

                    {job.holidays && (
                        <div className="flex items-start text-xs text-slate-500">
                            <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{formatDisplayValue(job.holidays)}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {(job.tags || []).slice(0, 4).map((tag) => (
                            <span key={tag} className={cn("inline-flex items-center text-[10px] px-2 py-1 rounded border", getJobTagStyle(job.type))}>
                                {tag}
                            </span>
                        ))}
                        {(job.tags || []).length > 4 && (
                            <span className="text-[10px] text-slate-400 px-1 py-1">+{(job.tags?.length || 0) - 4}</span>
                        )}
                    </div>

                    <p className="text-xs text-slate-400 text-right font-mono">ID: {job.job_code || "-"}</p>
                </div>
            </div>
        </Link>
    );
}
