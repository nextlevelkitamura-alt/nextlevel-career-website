import { getJob, checkApplicationStatus } from "../actions";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    MapPin, Banknote, Clock, ChevronLeft, Star,
    FileText, Users, Briefcase, CalendarDays, Shield,
    Shirt, Timer, UserCheck, ListChecks, Building2, Globe
} from "lucide-react";
import ApplyButton from "@/components/jobs/ApplyButton";
import { getEmploymentTypeStyle, getJobTagStyle, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
    const job = await getJob(params.id);

    if (!job) {
        notFound();
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isLoggedIn = !!user;
    const hasApplied = isLoggedIn ? await checkApplicationStatus(job.id) : false;

    const isDispatch = job.type?.includes("派遣");
    const isFulltime = job.type?.includes("正社員") || job.type?.includes("正職員");
    const dispatchDetails = job.dispatch_job_details;
    const fulltimeDetails = job.fulltime_job_details;

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

                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 leading-tight">
                                {job.title}
                            </h1>

                            {/* サマリーボックス — iDA風 */}
                            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2 text-sm font-bold">
                                {(job.job_category_detail || job.category) && (
                                    <p className="text-slate-900">{job.job_category_detail || job.category}</p>
                                )}
                                <div className="flex items-center text-slate-800">
                                    <MapPin className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                                    {job.area}
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
                                    {job.salary || (isDispatch && job.hourly_wage ? `時給${job.hourly_wage.toLocaleString()}円` : "")}
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
                                    <div className="bg-primary-500 text-white px-5 py-3 font-bold text-base">
                                        募集要項
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {/* 仕事内容 */}
                                        <div className="px-5 py-5">
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="font-bold text-slate-900">仕事内容</h3>
                                            </div>
                                            <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed ml-[42px]">
                                                {job.description?.replace(/\n{3,}/g, '\n\n') || "詳細情報はありません。"}
                                            </div>
                                        </div>

                                        {/* 募集背景 */}
                                        {fulltimeDetails.recruitment_background && (
                                            <div className="px-5 py-5">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <Users className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="font-bold text-slate-900">募集背景</h3>
                                                </div>
                                                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed ml-[42px]">
                                                    {fulltimeDetails.recruitment_background}
                                                </div>
                                            </div>
                                        )}

                                        {/* 雇用形態 */}
                                        <div className="px-5 py-5">
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <Briefcase className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="font-bold text-slate-900">雇用形態</h3>
                                            </div>
                                            <p className="text-sm text-slate-700 ml-[42px]">{job.type}</p>
                                        </div>

                                        {/* 勤務地・交通 */}
                                        <div className="px-5 py-5">
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="font-bold text-slate-900">勤務地・交通</h3>
                                            </div>
                                            <div className="text-sm text-slate-700 ml-[42px] space-y-1">
                                                <p>{job.area}</p>
                                                {job.workplace_access && <p>{job.workplace_access}</p>}
                                                {job.nearest_station && !job.workplace_access?.includes(job.nearest_station) && (
                                                    <p>{job.nearest_station}</p>
                                                )}
                                                {job.location_notes && <p className="text-slate-500">{job.location_notes}</p>}
                                            </div>
                                        </div>

                                        {/* 勤務時間 */}
                                        {job.working_hours && (
                                            <div className="px-5 py-5">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <Clock className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="font-bold text-slate-900">勤務時間</h3>
                                                </div>
                                                <div className="text-sm text-slate-700 ml-[42px] space-y-1">
                                                    <p className="whitespace-pre-line">{job.working_hours}</p>
                                                    {fulltimeDetails.overtime_hours && (
                                                        <p className="text-slate-500">※残業: {fulltimeDetails.overtime_hours}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* 給与 */}
                                        <div className="px-5 py-5">
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <Banknote className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="font-bold text-slate-900">給与</h3>
                                            </div>
                                            <div className="text-sm text-slate-700 ml-[42px] space-y-1">
                                                {job.salary && <p className="font-bold text-slate-900">{job.salary}</p>}
                                                {fulltimeDetails.annual_salary_min && fulltimeDetails.annual_salary_max && (
                                                    <p className="font-bold text-slate-800">年収 {fulltimeDetails.annual_salary_min}万円〜{fulltimeDetails.annual_salary_max}万円</p>
                                                )}
                                                {job.salary_type && <p className="text-xs text-slate-600">{job.salary_type}{job.salary_description ? `/${job.salary_description}` : ""}</p>}
                                                {!job.salary_type && job.salary_description && <p className="text-xs text-slate-600">{job.salary_description}</p>}
                                                {job.raise_info && <p className="text-xs text-slate-600">{job.raise_info}</p>}
                                                {job.bonus_info && <p className="text-xs text-slate-600">{job.bonus_info}</p>}
                                                {job.commute_allowance && <p className="text-xs text-slate-600">交通費: {job.commute_allowance}</p>}
                                            </div>
                                        </div>

                                        {/* 休日休暇 */}
                                        {job.holidays && (
                                            <div className="px-5 py-5">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <CalendarDays className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="font-bold text-slate-900">休日休暇</h3>
                                                </div>
                                                <div className="text-sm text-slate-700 ml-[42px] space-y-1">
                                                    {fulltimeDetails.annual_holidays && (
                                                        <p className="font-bold text-primary-700">年間休日{fulltimeDetails.annual_holidays}日</p>
                                                    )}
                                                    <div>
                                                        {(() => {
                                                            try {
                                                                const items = JSON.parse(job.holidays);
                                                                if (Array.isArray(items) && items.length > 0) {
                                                                    return (
                                                                        <ul className="space-y-0.5">
                                                                            {items.map((item: string, i: number) => (
                                                                                <li key={i} className="flex items-start">
                                                                                    <span className="text-slate-400 mr-1.5">・</span>
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
                                                <div className="px-5 py-5">
                                                    <div className="flex items-center gap-2.5 mb-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                            <Shield className="w-4 h-4 text-primary-500" />
                                                        </div>
                                                        <h3 className="font-bold text-slate-900">福利厚生・待遇</h3>
                                                    </div>
                                                    <div className="text-sm text-slate-700 ml-[42px]">
                                                        <ul className="space-y-0.5">
                                                            {items.map((item: string, i: number) => (
                                                                <li key={i} className="flex items-start">
                                                                    <span className="text-slate-400 mr-1.5">・</span>
                                                                    <span>{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {fulltimeDetails.smoking_policy && (
                                                            <p className="mt-1 text-slate-500 flex items-start">
                                                                <span className="text-slate-400 mr-1.5">・</span>
                                                                <span>{fulltimeDetails.smoking_policy}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* 服装・身だしなみ */}
                                        {(job.attire_type || job.hair_style || job.attire) && (
                                            <div className="px-5 py-5">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <Shirt className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="font-bold text-slate-900">服装・身だしなみ</h3>
                                                </div>
                                                <div className="text-sm text-slate-700 ml-[42px] space-y-0.5">
                                                    {(job.attire_type || job.attire) && <p>【服装】{job.attire_type || job.attire}</p>}
                                                    {job.hair_style && <p>【髪型・髪色】{job.hair_style}</p>}
                                                </div>
                                            </div>
                                        )}

                                        {/* 試用期間 */}
                                        {fulltimeDetails.probation_period && (
                                            <div className="px-5 py-5">
                                                <div className="flex items-center gap-2.5 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                        <Timer className="w-4 h-4 text-primary-500" />
                                                    </div>
                                                    <h3 className="font-bold text-slate-900">試用期間</h3>
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
                                        <div className="px-5 py-5">
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <UserCheck className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="font-bold text-slate-900">応募資格</h3>
                                            </div>
                                            <div className="text-sm text-slate-700 ml-[42px]">
                                                {(() => {
                                                    try {
                                                        const items = JSON.parse(job.requirements || "[]");
                                                        if (Array.isArray(items) && items.length > 0) {
                                                            return (
                                                                <ul className="space-y-1">
                                                                    {items.map((item: string, i: number) => (
                                                                        <li key={i} className="flex items-start">
                                                                            <span className="text-slate-400 mr-1.5">・</span>
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
                                                {fulltimeDetails.welcome_requirements && (
                                                    <div className="mt-3 bg-green-50 p-3 rounded-lg border border-green-100">
                                                        <p className="text-xs font-bold text-green-700 mb-1.5 flex items-center">
                                                            <Star className="w-4 h-4 mr-1" />
                                                            歓迎要件
                                                        </p>
                                                        <p className="text-xs text-green-800 whitespace-pre-line">{fulltimeDetails.welcome_requirements}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* セクション2: 応募・選考について */}
                                {job.selection_process && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="bg-primary-500 text-white px-5 py-3 font-bold text-base">
                                            応募・選考について
                                        </div>
                                        <div className="px-5 py-5">
                                            <div className="flex items-center gap-2.5 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                                                    <ListChecks className="w-4 h-4 text-primary-500" />
                                                </div>
                                                <h3 className="font-bold text-slate-900">入社までの流れ</h3>
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
                                    </div>
                                )}

                                {/* セクション3: 会社概要 */}
                                {fulltimeDetails && (fulltimeDetails.company_overview || fulltimeDetails.industry || fulltimeDetails.business_overview) && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="bg-primary-500 text-white px-5 py-3 font-bold text-base flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            会社概要{fulltimeDetails.company_name && fulltimeDetails.is_company_name_public ? ` | ${fulltimeDetails.company_name}` : ""}
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {fulltimeDetails.established_date && (
                                                <div className="px-5 py-4 flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-0.5">設立</p>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.established_date}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {fulltimeDetails.company_size && (
                                                <div className="px-5 py-4 flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <Users className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-0.5">従業員数</p>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.company_size}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {fulltimeDetails.industry && (
                                                <div className="px-5 py-4 flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-0.5">業界</p>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.industry}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {fulltimeDetails.business_overview && (
                                                <div className="px-5 py-4 flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-slate-500 mb-0.5">事業内容</p>
                                                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{fulltimeDetails.business_overview}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {fulltimeDetails.company_overview && (
                                                <div className="px-5 py-4 flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-slate-500 mb-0.5">会社概要</p>
                                                        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{fulltimeDetails.company_overview}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {fulltimeDetails.department_details && (
                                                <div className="px-5 py-4 flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <Users className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-slate-500 mb-0.5">配属部署</p>
                                                        <p className="text-sm text-slate-700 whitespace-pre-line">{fulltimeDetails.department_details}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {fulltimeDetails.is_company_name_public && fulltimeDetails.company_address && (
                                                <div className="px-5 py-4 flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-0.5">事業所</p>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.company_address}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {fulltimeDetails.is_company_name_public && fulltimeDetails.company_url && (
                                                <div className="px-5 py-4 flex items-start gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500 mb-0.5">企業ホームページ</p>
                                                        <a href={fulltimeDetails.company_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                                                            {fulltimeDetails.company_url}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* === 派遣: 既存レイアウト維持 === */}
                                {/* 求人情報 — 1項目=1セクション */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="px-5 md:px-8 divide-y divide-slate-200 text-sm">
                                        {/* 雇用形態 */}
                                        <div className="py-4">
                                            <h3 className="text-sm font-bold text-slate-900 mb-1">雇用形態</h3>
                                            <p className="text-slate-700">{job.type}</p>
                                        </div>

                                        {/* 職種 */}
                                        {(job.job_category_detail || job.category) && (
                                            <div className="py-4">
                                                <h3 className="text-sm font-bold text-slate-900 mb-1">職種</h3>
                                                <p className="text-slate-700">{job.job_category_detail || job.category}</p>
                                            </div>
                                        )}

                                        {/* 給与 */}
                                        <div className="py-4">
                                            <h3 className="text-sm font-bold text-slate-900 mb-1">給与</h3>
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

                                        {/* 勤務地 */}
                                        <div className="py-4">
                                            <h3 className="text-sm font-bold text-slate-900 mb-1">勤務地</h3>
                                            <p className="text-slate-700">{job.area}</p>
                                        </div>

                                        {/* 最寄駅 */}
                                        {job.nearest_station && (
                                            <div className="py-4">
                                                <h3 className="text-sm font-bold text-slate-900 mb-1">最寄駅</h3>
                                                <p className="text-slate-700">{job.nearest_station}</p>
                                            </div>
                                        )}

                                        {/* アクセス */}
                                        {job.workplace_access && (
                                            <div className="py-4">
                                                <h3 className="text-sm font-bold text-slate-900 mb-1">アクセス</h3>
                                                <p className="text-slate-700">{job.workplace_access}</p>
                                            </div>
                                        )}

                                        {/* 勤務地備考 */}
                                        {job.location_notes && (
                                            <div className="py-4">
                                                <h3 className="text-sm font-bold text-slate-900 mb-1">勤務地備考</h3>
                                                <p className="text-slate-700">{job.location_notes}</p>
                                            </div>
                                        )}

                                        {/* 勤務時間 */}
                                        {job.working_hours && (
                                            <div className="py-4">
                                                <h3 className="text-sm font-bold text-slate-900 mb-1">勤務時間</h3>
                                                <p className="text-slate-700 whitespace-pre-line">{job.working_hours}</p>
                                                {dispatchDetails?.actual_work_hours && (
                                                    <p className="text-xs text-slate-600 mt-0.5">実働{dispatchDetails.actual_work_hours}時間</p>
                                                )}
                                            </div>
                                        )}

                                        {/* 休日休暇 */}
                                        {job.holidays && (
                                            <div className="py-4">
                                                <h3 className="text-sm font-bold text-slate-900 mb-1">休日休暇</h3>
                                                <div className="text-slate-700">
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
                                        {(job.period || dispatchDetails?.end_date) && (
                                            <div className="py-4">
                                                <h3 className="text-sm font-bold text-slate-900 mb-1">勤務期間</h3>
                                                <div className="text-slate-700 space-y-0.5">
                                                    {job.period && <p className="font-medium">{job.period}</p>}
                                                    {dispatchDetails?.end_date && <p>{dispatchDetails.end_date}</p>}
                                                </div>
                                            </div>
                                        )}

                                        {/* 派遣: 出勤日数 */}
                                        {dispatchDetails?.work_days_per_week && (
                                            <div className="py-4">
                                                <h3 className="text-sm font-bold text-slate-900 mb-1">出勤日数</h3>
                                                <p className="text-slate-700">週{dispatchDetails.work_days_per_week}日</p>
                                            </div>
                                        )}

                                        {/* 派遣: 研修期間 */}
                                        {dispatchDetails?.training_period && (
                                            <div className="py-4">
                                                <h3 className="text-sm font-bold text-slate-900 mb-1">研修期間</h3>
                                                <p className="text-slate-700">{dispatchDetails.training_period}</p>
                                                {dispatchDetails?.training_salary && (
                                                    <p className="text-xs text-orange-600 mt-0.5">研修中給与: {dispatchDetails.training_salary}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 詳細セクション — 派遣 */}
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="px-5 md:px-8 divide-y divide-slate-200 text-sm">

                                        {/* 対象となる方 */}
                                        <div className="py-4">
                                            <h3 className="text-sm font-bold text-slate-900 mb-1">対象となる方</h3>
                                            <div className="text-slate-700 leading-snug">
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
                                            </div>
                                        </div>

                                        {/* 仕事内容 */}
                                        <div className="py-4">
                                            <h3 className="text-sm font-bold text-slate-900 mb-1">仕事内容</h3>
                                            <div className="text-slate-700 whitespace-pre-line leading-snug">
                                                {job.description?.replace(/\n{3,}/g, '\n\n') || "詳細情報はありません。"}
                                            </div>
                                        </div>

                                        {/* 服装・身だしなみ */}
                                        {(job.attire_type || job.hair_style || job.attire || dispatchDetails?.nail_policy) && (
                                            <div className="py-4">
                                                <h3 className="text-sm font-bold text-slate-900 mb-1">服装・身だしなみ</h3>
                                                <div className="space-y-1.5 text-slate-700">
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
                                                <div className="py-4">
                                                    <h3 className="text-sm font-bold text-slate-900 mb-1">福利厚生</h3>
                                                    <ul className="text-slate-700 leading-snug space-y-1">
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
                                            <div className="py-4">
                                                <h3 className="text-sm font-bold text-slate-900 mb-1">備考</h3>
                                                <p className="text-slate-700 whitespace-pre-line">{dispatchDetails.general_notes}</p>
                                            </div>
                                        )}

                                        {/* 選考プロセス */}
                                        {job.selection_process && (
                                            <div className="py-4">
                                                <h3 className="text-sm font-bold text-slate-900 mb-1">応募方法</h3>
                                                <div className="text-slate-700">
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

                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Sidebar (Right Column) */}
                    <div className="lg:col-span-1 hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            {/* Apply Box */}
                            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-900 mb-4">この求人に応募する</h3>

                                <ApplyButton
                                    jobId={job.id}
                                    isLoggedIn={isLoggedIn}
                                    hasApplied={hasApplied}
                                />

                                <p className="text-xs text-center text-slate-500 mt-4">
                                    ✉️ 応募後、2営業日以内にご連絡いたします
                                </p>
                                <p className="text-[10px] text-center text-slate-400 mt-2">
                                    応募することで<Link href="/terms" className="underline hover:text-slate-600">利用規約</Link>に同意したものとみなされます。
                                </p>
                            </div>

                            {/* Need Help? Box */}
                            <div className="bg-slate-100 rounded-xl p-6 text-center">
                                <h3 className="font-bold text-slate-800 text-sm mb-2">ご質問ですか？</h3>
                                <p className="text-xs text-slate-500 mb-4">
                                    お仕事の詳細や条件についてなど、お気軽にお問い合わせください。
                                </p>
                                <Button variant="outline" className="w-full bg-white text-xs h-9">
                                    お問い合わせフォーム
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Mobile Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 lg:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 pb-safe">
                <ApplyButton
                    jobId={job.id}
                    isLoggedIn={isLoggedIn}
                    hasApplied={hasApplied}
                />
            </div>
        </div>
    );
}
