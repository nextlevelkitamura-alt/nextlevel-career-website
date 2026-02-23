import { getJob, getRecommendedJobs } from "../actions";

import { recordJobView } from "@/lib/analytics";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    MapPin, Banknote, Clock, ChevronLeft, Star,
    FileText, Users, Briefcase, CalendarDays, Shield,
    Shirt, Timer, UserCheck, ListChecks,
    GraduationCap, Train, MessageCircle
} from "lucide-react";
import BookingButton from "@/components/jobs/BookingButton";
import AreaJobSearch from "@/components/jobs/AreaJobSearch";
import { getEmploymentTypeStyle, getJobTagStyle, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
    const job = await getJob(params.id);

    if (!job) {
        notFound();
    }

    // 閲覧数トラッキング（非ブロッキング）
    void recordJobView(job.id);

    const isDispatch = job.type?.includes("派遣");
    const isFulltime = job.type?.includes("正社員") || job.type?.includes("正職員");
    const dispatchDetails = Array.isArray(job.dispatch_job_details) ? job.dispatch_job_details[0] : job.dispatch_job_details;
    const fulltimeDetails = Array.isArray(job.fulltime_job_details) ? job.fulltime_job_details[0] : job.fulltime_job_details;

    // おすすめ求人を取得
    const recommendedJobs = await getRecommendedJobs(job.id, job.area || "", job.category || "", job.type || "");

    // エリアの都道府県を抽出
    const currentPrefecture = (job.area || "").split(" ")[0] || "";

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Header / Breadcrumb */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center">
                    <Link href="/jobs" className="text-slate-500 hover:text-primary-600 flex items-center text-sm font-medium transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        求人一覧に戻る
                    </Link>
                </div>
            </div>

            <main className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Title Card */}
                        <div className="bg-white rounded-xl p-5 md:p-8 shadow-sm border border-slate-200">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={cn("px-3 py-1 rounded text-sm font-bold shadow-sm", getEmploymentTypeStyle(job.type))}>
                                    {job.type}
                                </span>
                                <span className="px-2.5 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                    {job.category}
                                </span>
                                <span className="text-xs text-slate-400 font-mono ml-auto">ID: {job.job_code}</span>
                            </div>

                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 leading-tight">
                                {job.title}
                            </h1>

                            {isFulltime && fulltimeDetails?.company_name && (
                                <p className="text-base text-slate-600 mb-4 font-medium">
                                    {fulltimeDetails.company_name}
                                </p>
                            )}

                            {/* サマリーボックス — iDA風 */}
                            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2 text-sm font-bold">
                                {(job.job_category_detail || job.category) && (
                                    <p className="text-slate-900">{job.job_category_detail || job.category}</p>
                                )}
                                <div className="flex items-start text-slate-800">
                                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-slate-400 flex-shrink-0" />
                                    <div>
                                        <span>{job.area}</span>
                                        {job.search_areas && job.search_areas.length > 1 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {job.search_areas.filter((a: string) => a !== job.area).map((a: string, i: number) => (
                                                    <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {job.nearest_station && (
                                    <div className="flex items-center text-slate-800">
                                        <span className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0 text-center text-xs">🚃</span>
                                        {job.nearest_station}
                                    </div>
                                )}
                                {job.workplace_access && (
                                    <div className="flex items-center text-slate-800">
                                        <MapPin className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                                        {job.workplace_access}
                                    </div>
                                )}
                                <div className="flex items-center text-slate-900">
                                    <Banknote className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                                    {isFulltime && fulltimeDetails?.annual_salary_min && fulltimeDetails?.annual_salary_max
                                        ? `年収${fulltimeDetails.annual_salary_min}万〜${fulltimeDetails.annual_salary_max}万円`
                                        : isFulltime && fulltimeDetails?.annual_salary_min
                                            ? `年収${fulltimeDetails.annual_salary_min}万円〜`
                                            : isFulltime && fulltimeDetails?.annual_salary_max
                                                ? `〜年収${fulltimeDetails.annual_salary_max}万円`
                                                : job.salary || (isDispatch && job.hourly_wage ? `時給${job.hourly_wage.toLocaleString()}円` : "")}
                                </div>
                                {job.working_hours && (
                                    <div className="flex items-center text-slate-800">
                                        <Clock className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                                        {job.working_hours}
                                    </div>
                                )}
                            </div>

                            {/* 特徴 (Feature Tags) */}
                            {job.tags && job.tags.length > 0 && (
                                <div className="mt-4">
                                    <h2 className="text-sm font-bold text-slate-900 mb-2">特徴</h2>
                                    <div className="flex flex-wrap gap-1.5">
                                        {job.tags.map((tag: string) => (
                                            <span key={tag} className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getJobTagStyle(job.type))}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* === 正社員: エン転職風モバイルファーストレイアウト === */}
                        {isFulltime && fulltimeDetails ? (
                            <>
                                {/* 訴求ポイント */}
                                {fulltimeDetails.appeal_points && (
                                    <div className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl p-5 md:p-6 shadow-sm border border-primary-100">
                                        <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center">
                                            <Star className="w-4 h-4 mr-1.5 text-primary-500" />
                                            仕事の魅力・やりがい
                                        </h2>
                                        <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                                            {fulltimeDetails.appeal_points}
                                        </div>
                                    </div>
                                )}

                                {/* セクション1: 募集要項 */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-primary-500 text-white px-5 py-3 font-bold text-base tracking-widest text-center">
                                        募集要項
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {/* 仕事内容 */}
                                        <div className="px-5 py-8">
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">仕事内容</h3>
                                            </div>
                                            <div className="text-sm text-slate-700 leading-loose ml-[42px] space-y-2">
                                                {(job.description?.replace(/\n{3,}/g, '\n\n') || "詳細情報はありません。").split('\n').map((line: string, i: number) => {
                                                    const trimmed = line.trim();
                                                    if (!trimmed) return <br key={i} />;
                                                    if (trimmed.startsWith('◆')) {
                                                        return <p key={i} className="font-bold text-slate-900 mt-3 first:mt-0">{trimmed}</p>;
                                                    }
                                                    if (trimmed.startsWith('・')) {
                                                        return (
                                                            <p key={i} className="flex items-start">
                                                                <span className="text-primary-400 mr-1.5 flex-shrink-0">・</span>
                                                                <span>{trimmed.slice(1).trim()}</span>
                                                            </p>
                                                        );
                                                    }
                                                    if (trimmed.startsWith('【') || trimmed.startsWith('＼')) {
                                                        return <p key={i} className="font-bold text-slate-800 mt-2">{trimmed}</p>;
                                                    }
                                                    return <p key={i}>{trimmed}</p>;
                                                })}
                                            </div>
                                        </div>

                                        {/* 募集背景 */}
                                        {fulltimeDetails.recruitment_background && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <Users className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">募集背景</h3>
                                                </div>
                                                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed ml-[42px]">
                                                    {fulltimeDetails.recruitment_background}
                                                </div>
                                            </div>
                                        )}

                                        {/* 雇用形態 */}
                                        <div className="px-5 py-8">
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <Briefcase className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">雇用形態</h3>
                                            </div>
                                            <p className="text-sm text-slate-700 ml-[42px]">{job.type}</p>
                                        </div>

                                        {/* 勤務地・交通 */}
                                        <div className="px-5 py-8">
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">勤務地・交通</h3>
                                            </div>
                                            <div className="text-sm text-slate-700 ml-[42px] space-y-2">
                                                <p className="font-bold text-slate-800">{job.area}</p>

                                                {/* 勤務先名・住所 */}
                                                {job.workplace_name && (
                                                    <p className="text-slate-700">{job.workplace_name}</p>
                                                )}
                                                {job.workplace_address && (
                                                    <p className="text-slate-600">{job.workplace_address}</p>
                                                )}

                                                {/* 転勤方針 */}
                                                {fulltimeDetails.transfer_policy && (
                                                    <p className="text-slate-700">◎{fulltimeDetails.transfer_policy}</p>
                                                )}

                                                {/* エリア別勤務地詳細 */}
                                                {fulltimeDetails.work_location_detail && (
                                                    <div className="mt-2 space-y-2">
                                                        {fulltimeDetails.work_location_detail.split('\n').map((line: string, i: number) => {
                                                            const trimmed = line.trim();
                                                            if (!trimmed) return null;
                                                            if (trimmed.startsWith('◆')) {
                                                                return <p key={i} className="font-bold text-slate-900 mt-3 first:mt-0">{trimmed}</p>;
                                                            }
                                                            return <p key={i} className="text-slate-600">{trimmed}</p>;
                                                        })}
                                                    </div>
                                                )}

                                                {/* 交通 */}
                                                {(job.workplace_access || job.nearest_station) && (
                                                    <div className="mt-3 pt-2 border-t border-slate-100">
                                                        <p className="flex items-center gap-1.5 text-slate-500 mb-1">
                                                            <Train className="w-3.5 h-3.5" />
                                                            <span className="text-xs font-bold">交通</span>
                                                        </p>
                                                        {job.workplace_access && <p>{job.workplace_access}</p>}
                                                        {job.nearest_station && !job.workplace_access?.includes(job.nearest_station) && (
                                                            <p>{job.nearest_station}</p>
                                                        )}
                                                    </div>
                                                )}

                                                {job.location_notes && <p className="text-slate-500 mt-1">{job.location_notes}</p>}
                                            </div>
                                        </div>

                                        {/* 勤務時間 */}
                                        {job.working_hours && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <Clock className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">勤務時間</h3>
                                                </div>
                                                <div className="text-sm text-slate-700 ml-[42px] space-y-1.5">
                                                    <p className="whitespace-pre-line">{job.working_hours}</p>
                                                    {fulltimeDetails.overtime_hours && (
                                                        <p className="text-slate-500">※月平均残業時間: {fulltimeDetails.overtime_hours}</p>
                                                    )}
                                                    {fulltimeDetails.part_time_available && (
                                                        <p className="text-primary-600 font-medium">★時短勤務も相談可能です！</p>
                                                    )}
                                                    {job.start_date && (
                                                        <p className="text-slate-500">勤務開始日: {job.start_date}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* 給与 */}
                                        <div className="px-5 py-8">
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <Banknote className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">給与</h3>
                                            </div>
                                            <div className="text-sm text-slate-700 ml-[42px] space-y-1.5">
                                                {isFulltime && (fulltimeDetails.annual_salary_min || fulltimeDetails.annual_salary_max) ? (
                                                    <p className="font-bold text-slate-900 text-base">
                                                        年収 {fulltimeDetails.annual_salary_min && fulltimeDetails.annual_salary_max
                                                            ? `${fulltimeDetails.annual_salary_min}万円〜${fulltimeDetails.annual_salary_max}万円`
                                                            : fulltimeDetails.annual_salary_min
                                                                ? `${fulltimeDetails.annual_salary_min}万円〜`
                                                                : `〜${fulltimeDetails.annual_salary_max}万円`}
                                                    </p>
                                                ) : (
                                                    job.salary && <p className="font-bold text-slate-900 text-base">{job.salary}</p>
                                                )}

                                                {/* エリア別給与詳細 */}
                                                {fulltimeDetails.salary_detail && (
                                                    <div className="mt-3 space-y-2">
                                                        {fulltimeDetails.salary_detail.split('\n').map((line: string, i: number) => {
                                                            const trimmed = line.trim();
                                                            if (!trimmed) return null;
                                                            if (trimmed.startsWith('■')) {
                                                                return <p key={i} className="font-bold text-slate-900 mt-2 first:mt-0">{trimmed}</p>;
                                                            }
                                                            return <p key={i} className="text-slate-600 ml-1">{trimmed}</p>;
                                                        })}
                                                    </div>
                                                )}

                                                {fulltimeDetails.salary_breakdown && (
                                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                                        <p className="text-xs font-bold text-slate-500 mb-1.5">給与内訳</p>
                                                        <div className="text-sm text-slate-700 whitespace-pre-line">
                                                            {fulltimeDetails.salary_breakdown}
                                                        </div>
                                                    </div>
                                                )}
                                                {job.salary_type && <p className="text-xs text-slate-600 mt-2">{job.salary_type}{job.salary_description ? `／${job.salary_description}` : ""}</p>}
                                                {!job.salary_type && job.salary_description && <p className="text-xs text-slate-600">{job.salary_description}</p>}
                                                {(fulltimeDetails.bonus || job.bonus_info) && <p className="text-xs text-slate-600">賞与: {fulltimeDetails.bonus || job.bonus_info}</p>}
                                                {(fulltimeDetails.raise || job.raise_info) && <p className="text-xs text-slate-600">昇給: {fulltimeDetails.raise || job.raise_info}</p>}
                                                {!fulltimeDetails.bonus && !job.bonus_info && job.bonus_info && <p className="text-xs text-slate-600">{job.bonus_info}</p>}
                                                {job.commute_allowance && <p className="text-xs text-slate-600">交通費: {job.commute_allowance}</p>}

                                                {fulltimeDetails.salary_example && (
                                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                                        <p className="text-xs font-bold text-slate-500 mb-1.5">年収例</p>
                                                        <div className="text-sm text-slate-700 whitespace-pre-line">
                                                            {fulltimeDetails.salary_example}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 休日休暇 */}
                                        {job.holidays && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <CalendarDays className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">休日休暇</h3>
                                                </div>
                                                <div className="text-sm text-slate-700 ml-[42px] space-y-1.5">
                                                    {fulltimeDetails.annual_holidays && (
                                                        <p className="font-bold text-slate-900 text-base">年間休日{fulltimeDetails.annual_holidays}{String(fulltimeDetails.annual_holidays).includes('日') ? '' : '日'}</p>
                                                    )}
                                                    <div>
                                                        {(() => {
                                                            try {
                                                                const items = JSON.parse(job.holidays);
                                                                if (Array.isArray(items) && items.length > 0) {
                                                                    return (
                                                                        <ul className="space-y-1.5 mt-2">
                                                                            {items.map((item: string, i: number) => (
                                                                                <li key={i} className="flex items-start">
                                                                                    <span className="text-slate-500 mr-1.5 font-bold">■</span>
                                                                                    <span>{item}</span>
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    );
                                                                }
                                                                return <p className="whitespace-pre-line">{job.holidays}</p>;
                                                            } catch {
                                                                return <p className="whitespace-pre-line">{job.holidays}</p>;
                                                            }
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* 福利厚生・待遇 */}
                                        {job.benefits && (() => {
                                            let items: string[] = [];
                                            try {
                                                const parsed = JSON.parse(job.benefits);
                                                if (Array.isArray(parsed)) {
                                                    items = parsed.flatMap((s: string) =>
                                                        s.includes("　") || (s.split(/\s+/).length > 2)
                                                            ? s.split(/\s+/).filter(Boolean)
                                                            : [s]
                                                    ).filter(Boolean);
                                                }
                                            } catch {
                                                items = job.benefits
                                                    .split(/\n|、|　/)
                                                    .map((s: string) => s.replace(/^[・•\-]\s*/, "").trim())
                                                    .filter(Boolean);
                                            }
                                            if (items.length === 0) return null;
                                            return (
                                                <div className="px-5 py-8">
                                                    <div className="flex items-center gap-2.5 mb-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                            <Shield className="w-4 h-4 text-primary-500" />
                                                        </div>
                                                        <h3 className="text-base font-bold text-slate-900">福利厚生・待遇</h3>
                                                    </div>
                                                    <div className="text-sm text-slate-700 ml-[42px]">
                                                        <ul className="space-y-1.5">
                                                            {items.map((item: string, i: number) => (
                                                                <li key={i} className="flex items-start">
                                                                    <span className="text-slate-500 mr-1.5 font-bold">■</span>
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {fulltimeDetails.smoking_policy && (
                                                            <p className="mt-1.5 text-slate-500 flex items-start">
                                                                <span className="text-slate-500 mr-1.5 font-bold">■</span>
                                                                <span>{fulltimeDetails.smoking_policy}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* 教育制度 */}
                                        {fulltimeDetails.education_training && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <GraduationCap className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">教育制度</h3>
                                                </div>
                                                <div className="text-sm text-slate-700 ml-[42px] space-y-1.5">
                                                    {fulltimeDetails.education_training.split('\n').map((line: string, i: number) => {
                                                        const trimmed = line.trim();
                                                        if (!trimmed) return null;
                                                        if (trimmed.startsWith('【')) {
                                                            return <p key={i} className="font-bold text-slate-800 mt-2 first:mt-0">{trimmed}</p>;
                                                        }
                                                        if (trimmed.startsWith('・')) {
                                                            return (
                                                                <p key={i} className="flex items-start">
                                                                    <span className="text-slate-400 mr-1.5">・</span>
                                                                    <span>{trimmed.slice(1).trim()}</span>
                                                                </p>
                                                            );
                                                        }
                                                        return <p key={i}>{trimmed}</p>;
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* 入社後の流れ */}
                                        {fulltimeDetails.onboarding_process && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <ListChecks className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">入社後の流れ</h3>
                                                </div>
                                                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed ml-[42px]">
                                                    {fulltimeDetails.onboarding_process}
                                                </div>
                                            </div>
                                        )}

                                        {/* 服装・身だしなみ */}
                                        {(job.attire_type || job.hair_style || job.attire) && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <Shirt className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">服装・身だしなみ</h3>
                                                </div>
                                                <div className="text-sm text-slate-700 ml-[42px] space-y-1">
                                                    {(job.attire_type || job.attire) && <p>【服装】{job.attire_type || job.attire}</p>}
                                                    {job.hair_style && <p>【髪型・髪色】{job.hair_style}</p>}
                                                </div>
                                            </div>
                                        )}

                                        {/* 試用期間 */}
                                        {fulltimeDetails.probation_period && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <Timer className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">試用期間</h3>
                                                </div>
                                                <p className="text-sm text-slate-700 ml-[42px]">
                                                    {fulltimeDetails.probation_period}
                                                    {fulltimeDetails.probation_details && (
                                                        <span className="text-slate-500 ml-1">（{fulltimeDetails.probation_details}）</span>
                                                    )}
                                                </p>
                                            </div>
                                        )}

                                        {/* 応募資格 */}
                                        <div className="px-5 py-8">
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <UserCheck className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">応募資格</h3>
                                            </div>
                                            <div className="text-sm text-slate-700 ml-[42px]">
                                                {(() => {
                                                    try {
                                                        const items = JSON.parse(job.requirements || "[]");
                                                        if (Array.isArray(items) && items.length > 0) {
                                                            return (
                                                                <ul className="space-y-1.5">
                                                                    {items.map((item: string, i: number) => {
                                                                        const isHighlight = item.includes("不問") || item.includes("未経験") || item.includes("OK") || item.includes("歓迎");
                                                                        return (
                                                                            <li key={i} className={cn("flex items-start", isHighlight && "font-medium text-slate-900")}>
                                                                                <span className="text-slate-500 mr-1.5">■</span>
                                                                                <span>{item}</span>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            );
                                                        }
                                                        return <p className="whitespace-pre-line">{job.requirements || "特になし"}</p>;
                                                    } catch {
                                                        return <p className="whitespace-pre-line">{job.requirements || "特になし"}</p>;
                                                    }
                                                })()}
                                                {fulltimeDetails.welcome_requirements && (() => {
                                                    try {
                                                        const wItems = JSON.parse(fulltimeDetails.welcome_requirements);
                                                        if (Array.isArray(wItems) && wItems.length > 0) {
                                                            return (
                                                                <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100">
                                                                    <p className="text-sm font-bold text-green-700 mb-2 flex items-center">
                                                                        <Star className="w-4 h-4 mr-1" />
                                                                        歓迎要件
                                                                    </p>
                                                                    <ul className="space-y-1.5">
                                                                        {wItems.map((item: string, i: number) => (
                                                                            <li key={i} className="flex items-start text-sm text-green-800">
                                                                                <span className="mr-1.5">・</span>
                                                                                <span>{item}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            );
                                                        }
                                                    } catch { /* fall through */ }
                                                    return (
                                                        <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100">
                                                            <p className="text-sm font-bold text-green-700 mb-2 flex items-center">
                                                                <Star className="w-4 h-4 mr-1" />
                                                                歓迎要件
                                                            </p>
                                                            <p className="text-sm text-green-800 whitespace-pre-line leading-relaxed">{fulltimeDetails.welcome_requirements}</p>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* セクション2: 応募・選考について */}
                                {job.selection_process && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="bg-primary-500 text-white px-5 py-3 font-bold text-base tracking-widest text-center">
                                            応募・選考について
                                        </div>
                                        <div className="px-5 py-8">
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <ListChecks className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">入社までの流れ</h3>
                                            </div>
                                            <div className="text-sm text-slate-700 ml-[42px]">
                                                {(() => {
                                                    try {
                                                        const items = JSON.parse(job.selection_process || "[]");
                                                        if (Array.isArray(items) && items.length > 0) {
                                                            return (
                                                                <div className="space-y-2">
                                                                    {items.map((item: string, i: number) => (
                                                                        <p key={i} className="flex items-start">
                                                                            <span className="font-bold text-primary-600 mr-2 flex-shrink-0">STEP{i + 1}:</span>
                                                                            <span>{item}</span>
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            );
                                                        }
                                                        return <p className="whitespace-pre-line">{job.selection_process}</p>;
                                                    } catch {
                                                        return <p className="whitespace-pre-line">{job.selection_process}</p>;
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                        {fulltimeDetails.interview_location && (
                                            <div className="px-5 py-4 border-t border-slate-100">
                                                <p className="text-sm font-bold text-slate-900 mb-1">面接地</p>
                                                <p className="text-sm text-slate-700">{fulltimeDetails.interview_location}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* セクション3: 会社概要 */}
                                {fulltimeDetails && (
                                    fulltimeDetails.company_name || fulltimeDetails.company_overview || fulltimeDetails.industry ||
                                    fulltimeDetails.business_overview || fulltimeDetails.established_date || fulltimeDetails.representative ||
                                    fulltimeDetails.capital || fulltimeDetails.company_size || fulltimeDetails.department_details ||
                                    fulltimeDetails.company_url || fulltimeDetails.company_address
                                ) && (
                                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                            <div className="bg-primary-500 text-white px-5 py-3 font-bold text-base tracking-widest text-center">
                                                会社概要
                                            </div>
                                            {/* 企業名（大きく表示） */}
                                            {fulltimeDetails.company_name && fulltimeDetails.is_company_name_public !== false && (
                                                <div className="px-5 pt-5 pb-2">
                                                    <p className="text-lg font-bold text-slate-900">{fulltimeDetails.company_name}</p>
                                                </div>
                                            )}
                                            {fulltimeDetails.is_company_name_public === false && (
                                                <div className="px-5 pt-5 pb-2">
                                                    <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded">企業名非公開</span>
                                                </div>
                                            )}
                                            <div className="divide-y divide-slate-100">
                                                {fulltimeDetails.established_date && (
                                                    <div className="px-5 py-4">
                                                        <p className="text-sm font-bold text-slate-900 mb-1">設立</p>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.established_date}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.representative && (
                                                    <div className="px-5 py-4">
                                                        <p className="text-sm font-bold text-slate-900 mb-1">代表者</p>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.representative}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.capital && (
                                                    <div className="px-5 py-4">
                                                        <p className="text-sm font-bold text-slate-900 mb-1">資本金</p>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.capital}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.annual_revenue && (
                                                    <div className="px-5 py-4">
                                                        <p className="text-sm font-bold text-slate-900 mb-1">売上高</p>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.annual_revenue}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.company_size && (
                                                    <div className="px-5 py-4">
                                                        <p className="text-sm font-bold text-slate-900 mb-1">従業員数</p>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.company_size}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.industry && (
                                                    <div className="px-5 py-4">
                                                        <p className="text-sm font-bold text-slate-900 mb-1">業界</p>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.industry}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.department_details && (
                                                    <div className="px-5 py-4">
                                                        <p className="text-sm font-bold text-slate-900 mb-1">配属部署</p>
                                                        <p className="text-sm text-slate-700 whitespace-pre-line">{fulltimeDetails.department_details}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.business_overview && (
                                                    <div className="px-5 py-4">
                                                        <p className="text-sm font-bold text-slate-900 mb-1">事業内容</p>
                                                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{fulltimeDetails.business_overview}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.company_overview && (
                                                    <div className="px-5 py-4">
                                                        <p className="text-sm font-bold text-slate-900 mb-1">会社概要</p>
                                                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{fulltimeDetails.company_overview}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.is_company_name_public !== false && fulltimeDetails.company_address && (
                                                    <div className="px-5 py-4">
                                                        <p className="text-sm font-bold text-slate-900 mb-1">事業所</p>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.company_address}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.is_company_name_public !== false && fulltimeDetails.company_url && (
                                                    <div className="px-5 py-4">
                                                        <p className="text-sm font-bold text-slate-900 mb-1">企業ホームページ</p>
                                                        <a href={fulltimeDetails.company_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                                                            {fulltimeDetails.company_url}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                {/* 応募方法（正社員固定表示） */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-primary-500 text-white px-5 py-3 font-bold text-base tracking-widest text-center">
                                        応募方法
                                    </div>
                                    <div className="px-5 py-8">
                                        <p className="text-sm text-slate-600 mb-6">
                                            まずは<span className="font-bold text-slate-800">「面談」</span>からスタートします。<br />
                                            面接ではありませんので、お気軽にどうぞ！
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* 応募するフロー */}
                                            <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <CalendarDays className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                                    <p className="text-sm font-bold text-primary-700">応募する場合</p>
                                                </div>
                                                <ol className="space-y-2 text-xs text-slate-700">
                                                    <li className="flex items-start gap-2">
                                                        <span className="font-bold text-primary-600 flex-shrink-0">STEP1</span>
                                                        <span>「応募する」ボタンから日時を選択</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="font-bold text-primary-600 flex-shrink-0">STEP2</span>
                                                        <span>面談実施（電話 or オンライン）<br /><span className="text-slate-500">ご希望条件をヒアリング・書類作成をサポートします</span></span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="font-bold text-primary-600 flex-shrink-0">STEP3</span>
                                                        <span>企業への応募・選考へ</span>
                                                    </li>
                                                </ol>
                                            </div>
                                            {/* 相談するフロー */}
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <MessageCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                                    <p className="text-sm font-bold text-slate-700">まず相談する場合</p>
                                                </div>
                                                <ol className="space-y-2 text-xs text-slate-700">
                                                    <li className="flex items-start gap-2">
                                                        <span className="font-bold text-slate-500 flex-shrink-0">STEP1</span>
                                                        <span>「相談する」ボタンから日時を選択</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="font-bold text-slate-500 flex-shrink-0">STEP2</span>
                                                        <span>担当スタッフと相談（電話 or オンライン）<br /><span className="text-slate-500">不安なこと・疑問を何でもご相談ください</span></span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="font-bold text-slate-500 flex-shrink-0">STEP3</span>
                                                        <span>ご希望に合ったお仕事をご提案</span>
                                                    </li>
                                                </ol>
                                                <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-200">
                                                    💬 まだ迷っている方も大歓迎！
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* === 派遣: アイコン付きレイアウト === */}

                                {/* Section 1: 求人情報 */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-primary-500 text-white px-5 py-3 font-bold text-base tracking-widest text-center">
                                        求人情報
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {/* 雇用形態 */}
                                        <div className="px-5 py-8">
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <Briefcase className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">雇用形態</h3>
                                            </div>
                                            <p className="text-sm text-slate-700 ml-[42px]">{job.type}</p>
                                        </div>

                                        {/* 職種 */}
                                        {(job.job_category_detail || job.category) && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">職種</h3>
                                                </div>
                                                <p className="text-sm text-slate-700 ml-[42px]">{job.job_category_detail || job.category}</p>
                                            </div>
                                        )}

                                        {/* 給与 */}
                                        <div className="px-5 py-8">
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <Banknote className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">給与</h3>
                                            </div>
                                            <div className="ml-[42px]">
                                                <p className="text-sm font-bold text-slate-900">{job.salary}</p>
                                                <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                                                    {job.salary_type && <p>{job.salary_type}{job.salary_description ? `/${job.salary_description}` : ""}</p>}
                                                    {!job.salary_type && job.salary_description && <p>{job.salary_description}</p>}
                                                    {job.raise_info && <p>{job.raise_info}</p>}
                                                    {job.bonus_info && <p>{job.bonus_info}</p>}
                                                    {job.commute_allowance && <p>交通費: {job.commute_allowance}</p>}
                                                    {dispatchDetails?.training_salary && (
                                                        <p className="text-orange-600">研修中: {dispatchDetails.training_salary}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 勤務地・交通 */}
                                        <div className="px-5 py-8">
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">勤務地・交通</h3>
                                            </div>
                                            <div className="ml-[42px] space-y-1">
                                                <p className="text-sm text-slate-700">{job.area}</p>
                                                {job.workplace_name && (
                                                    <p className="text-sm text-slate-700">{job.workplace_name}</p>
                                                )}
                                                {job.workplace_address && (
                                                    <p className="text-sm text-slate-600">{job.workplace_address}</p>
                                                )}
                                                {job.nearest_station && (
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Train className="w-3 h-3 flex-shrink-0" />
                                                        <span>{job.nearest_station}{job.workplace_access && `　${job.workplace_access}`}</span>
                                                    </p>
                                                )}
                                                {!job.nearest_station && job.workplace_access && (
                                                    <p className="text-xs text-slate-500">{job.workplace_access}</p>
                                                )}
                                                {job.location_notes && (
                                                    <p className="text-xs text-slate-500">{job.location_notes}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* 勤務時間 */}
                                        {job.working_hours && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <Clock className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">勤務時間</h3>
                                                </div>
                                                <div className="ml-[42px]">
                                                    <p className="text-sm text-slate-700 whitespace-pre-line">{job.working_hours}</p>
                                                    <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                                                        {dispatchDetails?.actual_work_hours && <p>実働{dispatchDetails.actual_work_hours}時間</p>}
                                                        {dispatchDetails?.work_days_per_week && <p>週{dispatchDetails.work_days_per_week}日</p>}
                                                        {dispatchDetails?.shift_notes && <p className="text-slate-500 mt-1">{dispatchDetails.shift_notes}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* 休日休暇 */}
                                        {job.holidays && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <CalendarDays className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">休日休暇</h3>
                                                </div>
                                                <div className="ml-[42px] text-sm text-slate-700">
                                                    {(() => {
                                                        try {
                                                            const items = JSON.parse(job.holidays);
                                                            if (Array.isArray(items) && items.length > 0) {
                                                                return items.join("　");
                                                            }
                                                            return <p className="whitespace-pre-line">{job.holidays}</p>;
                                                        } catch {
                                                            return <p className="whitespace-pre-line">{job.holidays}</p>;
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {/* 勤務期間 */}
                                        {(job.period || job.start_date || dispatchDetails?.end_date) && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <Timer className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">勤務期間</h3>
                                                </div>
                                                <div className="ml-[42px] text-sm text-slate-700 space-y-0.5">
                                                    {job.start_date && <p>勤務開始日: {job.start_date}</p>}
                                                    {job.period && <p className="font-medium">{job.period}</p>}
                                                    {dispatchDetails?.end_date && <p>{dispatchDetails.end_date}</p>}
                                                </div>
                                            </div>
                                        )}

                                        {/* 研修期間 */}
                                        {dispatchDetails?.training_period && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <GraduationCap className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">研修期間</h3>
                                                </div>
                                                <div className="ml-[42px]">
                                                    <p className="text-sm text-slate-700">{dispatchDetails.training_period}</p>
                                                    {dispatchDetails?.training_salary && (
                                                        <p className="text-xs text-orange-600 mt-0.5">研修中給与: {dispatchDetails.training_salary}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Section 2: 仕事内容・応募条件 */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-primary-500 text-white px-5 py-3 font-bold text-base tracking-widest text-center">
                                        仕事内容・応募条件
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {/* 仕事内容 */}
                                        <div className="px-5 py-8">
                                            <div className="flex items-center gap-2.5 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">仕事内容</h3>
                                            </div>
                                            <div className="text-sm text-slate-700 leading-loose ml-[42px] space-y-2">
                                                {(job.description?.replace(/\n{3,}/g, '\n\n') || "詳細情報はありません。").split('\n').map((line: string, i: number) => {
                                                    const trimmed = line.trim();
                                                    if (!trimmed) return <br key={i} />;
                                                    if (trimmed.startsWith('■') || trimmed.startsWith('▼') || trimmed.startsWith('◆')) {
                                                        return <p key={i} className="font-bold text-slate-900 mt-3 first:mt-0">{trimmed}</p>;
                                                    }
                                                    if (trimmed.startsWith('・')) {
                                                        return (
                                                            <p key={i} className="flex items-start">
                                                                <span className="text-primary-400 mr-1.5 flex-shrink-0">・</span>
                                                                <span>{trimmed.slice(1).trim()}</span>
                                                            </p>
                                                        );
                                                    }
                                                    if (trimmed.startsWith('【') || trimmed.startsWith('＼')) {
                                                        return <p key={i} className="font-bold text-slate-800 mt-2">{trimmed}</p>;
                                                    }
                                                    return <p key={i}>{trimmed}</p>;
                                                })}
                                            </div>
                                        </div>

                                        {/* 対象となる方 */}
                                        <div className="px-5 py-8">
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <UserCheck className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">対象となる方</h3>
                                            </div>
                                            <div className="text-sm text-slate-700 leading-relaxed ml-[42px]">
                                                {(() => {
                                                    try {
                                                        const items = JSON.parse(job.requirements || "[]");
                                                        if (Array.isArray(items) && items.length > 0) {
                                                            return (
                                                                <ul className="space-y-1.5">
                                                                    {items.map((item: string, i: number) => (
                                                                        <li key={i} className="flex items-start">
                                                                            <span className="text-slate-400 mr-2">・</span>
                                                                            <span>{item}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            );
                                                        }
                                                        return <p className="whitespace-pre-line">{job.requirements || "特になし"}</p>;
                                                    } catch {
                                                        return <p className="whitespace-pre-line">{job.requirements || "特になし"}</p>;
                                                    }
                                                })()}
                                                {dispatchDetails?.welcome_requirements && (() => {
                                                    try {
                                                        const wItems = JSON.parse(dispatchDetails.welcome_requirements);
                                                        if (Array.isArray(wItems) && wItems.length > 0) {
                                                            return (
                                                                <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100">
                                                                    <p className="text-sm font-bold text-green-700 mb-2 flex items-center">
                                                                        <Star className="w-4 h-4 mr-1" />
                                                                        歓迎要件
                                                                    </p>
                                                                    <ul className="space-y-1.5">
                                                                        {wItems.map((item: string, i: number) => (
                                                                            <li key={i} className="flex items-start text-sm text-green-800">
                                                                                <span className="mr-1.5">・</span>
                                                                                <span>{item}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            );
                                                        }
                                                    } catch { /* fall through */ }
                                                    return null;
                                                })()}
                                            </div>
                                        </div>

                                        {/* 服装・身だしなみ */}
                                        {(job.attire_type || job.hair_style || job.attire || dispatchDetails?.nail_policy) && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <Shirt className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">服装・身だしなみ</h3>
                                                </div>
                                                <div className="ml-[42px] space-y-1 text-sm text-slate-700">
                                                    {(job.attire_type || job.attire) && <p>【服装】{job.attire_type || job.attire}</p>}
                                                    {job.hair_style && <p>【髪型・髪色】{job.hair_style}</p>}
                                                    {dispatchDetails?.nail_policy && <p>【ネイル】{dispatchDetails.nail_policy}</p>}
                                                </div>
                                            </div>
                                        )}

                                        {/* 福利厚生 */}
                                        {job.benefits && (() => {
                                            let items: string[] = [];
                                            try {
                                                const parsed = JSON.parse(job.benefits);
                                                if (Array.isArray(parsed)) {
                                                    items = parsed.flatMap((s: string) =>
                                                        s.includes("　") || (s.split(/\s+/).length > 2)
                                                            ? s.split(/\s+/).filter(Boolean)
                                                            : [s]
                                                    ).filter(Boolean);
                                                }
                                            } catch {
                                                items = job.benefits
                                                    .split(/\n|、|　/)
                                                    .map((s: string) => s.replace(/^[・•\-]\s*/, "").trim())
                                                    .filter(Boolean);
                                            }
                                            if (items.length === 0) return null;
                                            return (
                                                <div className="px-5 py-8">
                                                    <div className="flex items-center gap-2.5 mb-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                            <Shield className="w-4 h-4 text-primary-500" />
                                                        </div>
                                                        <h3 className="text-base font-bold text-slate-900">福利厚生</h3>
                                                    </div>
                                                    <ul className="text-sm text-slate-700 leading-relaxed space-y-1.5 ml-[42px]">
                                                        {items.map((item: string, i: number) => (
                                                            <li key={i} className="flex items-start">
                                                                <span className="text-slate-400 mr-1.5 shrink-0">●</span>
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })()}

                                        {/* 備考（派遣） */}
                                        {dispatchDetails?.general_notes && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">備考</h3>
                                                </div>
                                                <p className="text-sm text-slate-700 whitespace-pre-line ml-[42px]">{dispatchDetails.general_notes}</p>
                                            </div>
                                        )}

                                        {/* 選考プロセス（派遣） */}
                                        {job.selection_process && (
                                            <div className="px-5 py-8">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <ListChecks className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="text-base font-bold text-slate-900">選考プロセス</h3>
                                                </div>
                                                <div className="text-sm text-slate-700 ml-[42px]">
                                                    {(() => {
                                                        try {
                                                            const items = JSON.parse(job.selection_process || "[]");
                                                            if (Array.isArray(items) && items.length > 0) {
                                                                return (
                                                                    <div className="space-y-2">
                                                                        {items.map((item: string, i: number) => (
                                                                            <p key={i} className="flex items-start">
                                                                                <span className="font-bold text-primary-600 mr-2 flex-shrink-0">STEP{i + 1}:</span>
                                                                                <span>{item}</span>
                                                                            </p>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            }
                                                            return <p className="whitespace-pre-line">{job.selection_process}</p>;
                                                        } catch {
                                                            return <p className="whitespace-pre-line">{job.selection_process}</p>;
                                                        }
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {/* 応募方法（派遣固定表示） */}
                                        <div className="px-5 py-8 border-t border-slate-100">
                                            <div className="flex items-center gap-2.5 mb-6">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <ListChecks className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="text-base font-bold text-slate-900">応募方法</h3>
                                            </div>

                                            <p className="text-sm text-slate-600 mb-6 ml-[42px]">
                                                お仕事探しのはじめの一歩は<span className="font-bold text-slate-800">「面談」</span>からスタートします。<br />
                                                面接ではありませんので、お気軽にどうぞ！
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-[42px]">
                                                {/* 応募するフロー */}
                                                <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <CalendarDays className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                                        <p className="text-sm font-bold text-primary-700">応募する場合</p>
                                                    </div>
                                                    <ol className="space-y-2 text-xs text-slate-700">
                                                        <li className="flex items-start gap-2">
                                                            <span className="font-bold text-primary-600 flex-shrink-0">STEP1</span>
                                                            <span>「面談を予約する」ボタンから日時を選択</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="font-bold text-primary-600 flex-shrink-0">STEP2</span>
                                                            <span>面談実施（電話 or オンライン）<br /><span className="text-slate-500">ご希望条件をヒアリング・エントリーシートを一緒に作成します</span></span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="font-bold text-primary-600 flex-shrink-0">STEP3</span>
                                                            <span>お仕事のご紹介・内定へ</span>
                                                        </li>
                                                    </ol>
                                                    <p className="text-[11px] text-primary-600 font-bold mt-3 pt-3 border-t border-primary-200">
                                                        ✅ 履歴書の準備は不要！<br />
                                                        面談時にスタッフがエントリーシート作成をサポートします。
                                                    </p>
                                                </div>

                                                {/* 相談するフロー */}
                                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <MessageCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                                        <p className="text-sm font-bold text-slate-700">まず相談する場合</p>
                                                    </div>
                                                    <ol className="space-y-2 text-xs text-slate-700">
                                                        <li className="flex items-start gap-2">
                                                            <span className="font-bold text-slate-500 flex-shrink-0">STEP1</span>
                                                            <span>「相談を予約する」ボタンから日時を選択</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="font-bold text-slate-500 flex-shrink-0">STEP2</span>
                                                            <span>担当スタッフと相談（電話 or オンライン）<br /><span className="text-slate-500">不安なこと・わからないことを何でもご相談ください</span></span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="font-bold text-slate-500 flex-shrink-0">STEP3</span>
                                                            <span>ご希望に合ったお仕事をご提案</span>
                                                        </li>
                                                    </ol>
                                                    <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-200">
                                                        💬 まだ迷っている方も大歓迎！<br />
                                                        「どんな仕事が向いてるかわからない」そんなご相談もOKです。
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 派遣先企業情報 */}
                                {dispatchDetails?.client_company_name && dispatchDetails?.is_client_company_public !== false && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="bg-primary-500 text-white px-5 py-3 font-bold text-base tracking-widest text-center">
                                            派遣先企業
                                        </div>
                                        <div className="px-5 py-5">
                                            <p className="text-lg font-bold text-slate-900">{dispatchDetails.client_company_name}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="lg:col-span-1 hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            {isDispatch ? (
                                /* 派遣求人：応募する・相談する の2ボタン */
                                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                                    <p className="text-xs text-center text-slate-500 mb-4">
                                        📅 ご予約後、担当スタッフより確認のご連絡をします
                                    </p>
                                    <div className="space-y-3">
                                        <BookingButton jobId={job.id} type="apply" />
                                        <BookingButton jobId={job.id} type="consult" variant="outline" />
                                    </div>
                                    <p className="text-[10px] text-center text-slate-400 mt-3">
                                        履歴書不要・面談でエントリーシートを作成します
                                    </p>
                                </div>
                            ) : (
                                /* 正社員求人：応募する・相談する の2ボタン */
                                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                                    <p className="text-xs text-center text-slate-500 mb-4">
                                        📅 ご予約後、担当スタッフより確認のご連絡をします
                                    </p>
                                    <div className="space-y-3">
                                        <BookingButton jobId={job.id} type="apply" />
                                        <BookingButton jobId={job.id} type="consult" variant="outline" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            {/* おすすめ求人 */}
            {recommendedJobs.length > 0 && (
                <section className="bg-white border-t border-slate-200 py-10">
                    <div className="container mx-auto px-4">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">あなたにおすすめの求人</h2>
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                            {recommendedJobs.map((rJob) => {
                                const rIsDispatch = rJob.type?.includes("派遣");
                                const rFt = rJob.fulltime_job_details?.[0];
                                return (
                                    <Link
                                        key={rJob.id}
                                        href={`/jobs/${rJob.id}`}
                                        className="flex-shrink-0 w-[280px] snap-start bg-white rounded-xl border border-slate-200 hover:border-primary-300 hover:shadow-md transition-all p-4 space-y-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-full text-white",
                                                rIsDispatch ? "bg-pink-600" : "bg-blue-600"
                                            )}>
                                                {rJob.type}
                                            </span>
                                            {rJob.category && (
                                                <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{rJob.category}</span>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{rJob.title}</h3>
                                        <div className="space-y-1 text-xs text-slate-600">
                                            {rJob.area && (
                                                <p className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-slate-400" />
                                                    {rJob.area}
                                                </p>
                                            )}
                                            {rJob.salary && (
                                                <p className="flex items-center gap-1">
                                                    <Banknote className="w-3 h-3 text-slate-400" />
                                                    <span className="font-bold text-slate-800">{rJob.salary}</span>
                                                </p>
                                            )}
                                            {!rIsDispatch && rFt?.annual_salary_min && rFt?.annual_salary_max && (
                                                <p className="text-primary-600 font-bold">年収 {rFt.annual_salary_min}万〜{rFt.annual_salary_max}万</p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* エリアで求人を探す */}
            <AreaJobSearch currentJobId={job.id} currentPrefecture={currentPrefecture} />

            {/* Mobile Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 pb-safe">
                {isDispatch ? (
                    <div className="flex gap-3">
                        <BookingButton jobId={job.id} type="consult" variant="outline" size="default" className="flex-1 text-sm" />
                        <BookingButton jobId={job.id} type="apply" size="default" className="flex-1 text-sm" />
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <BookingButton jobId={job.id} type="consult" variant="outline" size="default" className="flex-1 text-sm" />
                        <BookingButton jobId={job.id} type="apply" size="default" className="flex-1 text-sm" />
                    </div>
                )}
            </div>
        </div>
    );
}
