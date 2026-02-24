import { getEmploymentTypeStyle, getJobTagStyle, cn } from "@/lib/utils";
import { Job } from "@/app/jobs/jobsData";
import { MapPin, Banknote, CalendarDays, Clock, Train } from "lucide-react";
import Link from "next/link";
import { mergeJobTags } from "@/utils/jobTagGenerator";
import { buildDisplayAreaText, getDisplayAreaPrefectures } from "@/utils/workAreaDisplay";

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

    const workAreas: string[] = (
        job.search_areas && job.search_areas.length > 0
            ? job.search_areas
            : job.area ? [job.area] : []
    ).filter(Boolean);
    const displayAreaText = buildDisplayAreaText(workAreas);
    const displayPrefectures = getDisplayAreaPrefectures(workAreas);
    const prefectureCount = displayPrefectures.length;
    const shouldHideStationRow = prefectureCount >= 2;

    const formatNearestStation = (value: string) => {
        const stations = Array.from(
            new Set(
                value
                    .split(/[\n/／|｜,，、]+/)
                    .map((station) => station.trim())
                    .filter(Boolean)
            )
        );

        if (stations.length <= 1) return value;

        const visible = stations.slice(0, 3);
        const hiddenCount = stations.length - visible.length;
        return hiddenCount > 0 ? `${visible.join(" / ")} 他${hiddenCount}駅` : visible.join(" / ");
    };

    // 給与表示（統一スタイル）
    const renderSalary = () => {
        // 正社員: 年収を優先表示（月給テキストではなく年収min/maxから）
        if (isFulltime && job.fulltime_job_details) {
            const { annual_salary_min, annual_salary_max } = job.fulltime_job_details;
            if (annual_salary_min || annual_salary_max) {
                return (
                    <span className="text-base font-bold text-slate-900">
                        年収{annual_salary_min && annual_salary_max
                            ? `${annual_salary_min}〜${annual_salary_max}`
                            : annual_salary_max || annual_salary_min}万円
                    </span>
                );
            }
        }
        // salaryテキストがある場合はそのまま表示
        if (job.salary) {
            return (
                <span className="text-base font-bold text-slate-900">
                    {job.salary}
                </span>
            );
        }
        // 派遣: 時給表示
        if (isDispatch && job.hourly_wage) {
            return (
                <span className="text-base font-bold text-slate-900">
                    時給{job.hourly_wage.toLocaleString()}円
                </span>
            );
        }
        return null;
    };

    return (
        <Link
            href={`/jobs/${job.id}`}
            className="block h-full group"
        >
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200 flex flex-col h-full relative overflow-hidden">
                {/* Top Badge Row */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className={cn("px-3 py-1 rounded text-xs font-bold leading-none flex items-center", getEmploymentTypeStyle(job.type))}>
                            {job.type}
                        </span>
                        {job.category && (
                            <span className="px-2 py-1 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                {job.category}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {job.job_code || "-"}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-1.5 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
                    {job.title}
                </h3>

                {/* Company Name (Full-time only) */}
                {isFulltime && job.fulltime_job_details?.company_name && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-1">
                        {job.fulltime_job_details.company_name}
                    </p>
                )}

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
                        <span className="line-clamp-2 leading-relaxed font-medium text-slate-800">{displayAreaText || "エリア未設定"}</span>
                    </div>

                    {/* 最寄駅アクセス（駅からの距離がある場合） */}
                    {job.nearest_station && !shouldHideStationRow && !job.area?.includes(job.nearest_station) && (
                        <div className="flex items-start text-xs text-slate-500">
                            <Train className="w-3.5 h-3.5 mr-1.5 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{formatNearestStation(job.nearest_station)}</span>
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

                    {/* 正社員: 年間休日 */}
                    {isFulltime && job.fulltime_job_details && (
                        <>
                            {job.fulltime_job_details.annual_holidays && (
                                <div className="flex items-start text-xs text-slate-500">
                                    <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-primary-500 mt-0.5 flex-shrink-0" />
                                    <span className="font-medium text-slate-700">年間休日 {job.fulltime_job_details.annual_holidays}日</span>
                                </div>
                            )}
                        </>
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

                </div>
            </div>
        </Link>
    );
}
