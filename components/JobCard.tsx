import { getEmploymentTypeStyle, getJobTagStyle, cn } from "@/lib/utils";
import { Job } from "@/app/jobs/jobsData";
import { MapPin, Banknote, CalendarDays, Clock, Train } from "lucide-react";
import Link from "next/link";
import { mergeJobTags } from "@/utils/jobTagGenerator";

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

    const isDispatch = job.type?.includes("派遣");
    const isFulltime = job.type?.includes("正社員") || job.type?.includes("正職員");
    const allTags = mergeJobTags(job);

    // 派遣: 時給を大きく表示
    const renderSalary = () => {
        if (isDispatch && job.hourly_wage) {
            return (
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-pink-600">
                        {job.hourly_wage.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-pink-500">円/時</span>
                </div>
            );
        }
        // 正社員: 年収範囲を表示
        if (isFulltime && job.fulltime_job_details) {
            const { annual_salary_min, annual_salary_max } = job.fulltime_job_details;
            if (annual_salary_min || annual_salary_max) {
                return (
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-blue-600">
                            {annual_salary_min && annual_salary_max
                                ? `${annual_salary_min}〜${annual_salary_max}`
                                : annual_salary_max || annual_salary_min}
                        </span>
                        <span className="text-sm font-medium text-blue-500">万円</span>
                    </div>
                );
            }
        }
        // フォールバック: 既存のsalary表示
        return (
            <span className="text-base font-bold text-slate-900 bg-yellow-50 px-1 rounded">
                {job.salary}
            </span>
        );
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
                <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
                    {job.title}
                </h3>

                {/* Salary - 目立たせる */}
                <div className="mb-3">
                    <div className="flex items-start">
                        <Banknote className="w-4 h-4 mr-1.5 text-primary-600 mt-1 flex-shrink-0" />
                        {renderSalary()}
                    </div>
                </div>

                {/* Essential Info */}
                <div className="space-y-1.5 mb-4 text-sm text-slate-600">
                    {/* エリア + 最寄駅 */}
                    <div className="flex items-start">
                        <MapPin className="w-4 h-4 mr-1.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                            {job.area}
                            {job.nearest_station && (
                                <span className="text-slate-500"> / {job.nearest_station}</span>
                            )}
                        </span>
                    </div>

                    {/* 最寄駅アクセス（駅からの距離がある場合） */}
                    {job.nearest_station && !job.area?.includes(job.nearest_station) && (
                        <div className="flex items-start text-xs text-slate-500">
                            <Train className="w-3.5 h-3.5 mr-1.5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{job.nearest_station}</span>
                        </div>
                    )}

                    {/* 勤務時間 */}
                    {job.working_hours && (
                        <div className="flex items-start text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{job.working_hours}</span>
                        </div>
                    )}

                    {/* 休日 */}
                    {job.holidays && (
                        <div className="flex items-start text-xs text-slate-500">
                            <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{formatDisplayValue(job.holidays)}</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-3 border-t border-slate-100">
                    {/* Tags（自動生成タグ含む） */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {allTags.slice(0, 5).map((tag) => (
                            <span key={tag} className={cn("inline-flex items-center text-[10px] px-2 py-1 rounded border", getJobTagStyle(job.type))}>
                                {tag}
                            </span>
                        ))}
                        {allTags.length > 5 && (
                            <span className="text-[10px] text-slate-400 px-1 py-1">+{allTags.length - 5}</span>
                        )}
                    </div>

                    <p className="text-xs text-slate-400 text-right font-mono">ID: {job.job_code || "-"}</p>
                </div>
            </div>
        </Link>
    );
}
