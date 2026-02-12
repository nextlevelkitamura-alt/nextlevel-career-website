import { getJob, checkApplicationStatus } from "../actions";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Banknote, Clock, CalendarDays, CheckCircle2, ChevronLeft, Building2, Briefcase, Shirt, Sparkles, Star } from "lucide-react";
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

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                    {/* Main Content (Left Column) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title Card */}
                        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-200">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className={cn("px-3 py-1 rounded text-sm font-bold shadow-sm", getEmploymentTypeStyle(job.type))}>
                                    {job.type}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    {job.category}
                                </span>
                                <span className="text-xs text-slate-400 font-mono ml-auto">ID: {job.job_code}</span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 leading-tight">
                                {job.title}
                            </h1>

                            {/* 給与 - 雇用形態に応じて目立たせる */}
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-sm mb-6 pb-6 border-b border-slate-100">
                                {isDispatch && job.hourly_wage ? (
                                    <div className="flex items-baseline gap-1 bg-pink-50 px-3 py-2 rounded-lg border border-pink-100">
                                        <Banknote className="w-5 h-5 mr-1 text-pink-500 self-center" />
                                        <span className="text-3xl font-extrabold text-pink-600">{job.hourly_wage.toLocaleString()}</span>
                                        <span className="text-sm font-medium text-pink-500">円/時</span>
                                    </div>
                                ) : isFulltime && fulltimeDetails?.annual_salary_min ? (
                                    <div className="flex items-baseline gap-1 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                        <Banknote className="w-5 h-5 mr-1 text-blue-500 self-center" />
                                        <span className="text-3xl font-extrabold text-blue-600">
                                            {fulltimeDetails.annual_salary_min}〜{fulltimeDetails.annual_salary_max || ""}
                                        </span>
                                        <span className="text-sm font-medium text-blue-500">万円</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center font-bold text-lg text-slate-900 bg-yellow-50 px-2 py-1 rounded -ml-2">
                                        <Banknote className="w-5 h-5 mr-2 text-primary-600" />
                                        {job.salary}
                                    </div>
                                )}
                                <div className="flex items-center text-slate-600">
                                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                    {job.area}
                                    {job.nearest_station && <span className="ml-1 text-slate-500">/ {job.nearest_station}</span>}
                                </div>
                            </div>

                        </div>

                        {/* 特徴 (Feature Tags) */}
                        {job.tags && job.tags.length > 0 && (
                            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">特徴</h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.tags.map((tag: string) => (
                                        <span key={tag} className={cn("px-3 py-1.5 rounded-full text-sm font-medium border", getJobTagStyle(job.type))}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 訴求ポイント（正社員） */}
                        {fulltimeDetails?.appeal_points && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 md:p-8 shadow-sm border border-blue-100">
                                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                    <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
                                    仕事の魅力・やりがい
                                </h2>
                                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {fulltimeDetails.appeal_points}
                                </div>
                            </div>
                        )}

                        {/* 求人情報テーブル */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 md:p-8 space-y-0">
                                <h2 className="text-lg font-bold text-slate-900 mb-6">求人情報</h2>
                                <dl className="divide-y divide-slate-100">
                                    <div className="py-4 grid grid-cols-3 gap-4">
                                        <dt className="text-sm font-bold text-slate-500">雇用形態</dt>
                                        <dd className="text-sm text-slate-900 col-span-2">{job.type}</dd>
                                    </div>
                                    {job.job_category_detail && (
                                        <div className="py-4 grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-bold text-slate-500">職種</dt>
                                            <dd className="text-sm text-slate-900 col-span-2">{job.job_category_detail}</dd>
                                        </div>
                                    )}
                                    <div className="py-4 grid grid-cols-3 gap-4">
                                        <dt className="text-sm font-bold text-slate-500">給与</dt>
                                        <dd className="text-sm text-slate-900 col-span-2">
                                            <p className="font-bold text-base">{job.salary}</p>
                                            <div className="mt-2 space-y-1 text-slate-600">
                                                {job.salary_type && <p>{job.salary_type}{job.salary_description ? `/${job.salary_description}` : ""}</p>}
                                                {!job.salary_type && job.salary_description && <p>{job.salary_description}</p>}
                                                {job.raise_info && <p>{job.raise_info}</p>}
                                                {job.bonus_info && <p>{job.bonus_info}</p>}
                                                {job.commute_allowance && <p>交通費 {job.commute_allowance}</p>}
                                                {dispatchDetails?.training_salary && (
                                                    <p className="text-orange-600">研修中: {dispatchDetails.training_salary}</p>
                                                )}
                                            </div>
                                        </dd>
                                    </div>
                                    {/* 派遣: 研修期間 */}
                                    {dispatchDetails?.training_period && (
                                        <div className="py-4 grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-bold text-slate-500">研修期間</dt>
                                            <dd className="text-sm text-slate-900 col-span-2">{dispatchDetails.training_period}</dd>
                                        </div>
                                    )}
                                    {/* 派遣: 勤務条件 */}
                                    {dispatchDetails?.actual_work_hours && (
                                        <div className="py-4 grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-bold text-slate-500">実働時間</dt>
                                            <dd className="text-sm text-slate-900 col-span-2">{dispatchDetails.actual_work_hours}</dd>
                                        </div>
                                    )}
                                    {dispatchDetails?.work_days_per_week && (
                                        <div className="py-4 grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-bold text-slate-500">出勤日数</dt>
                                            <dd className="text-sm text-slate-900 col-span-2">{dispatchDetails.work_days_per_week}</dd>
                                        </div>
                                    )}
                                    {dispatchDetails?.end_date && (
                                        <div className="py-4 grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-bold text-slate-500">契約期間</dt>
                                            <dd className="text-sm text-slate-900 col-span-2">{dispatchDetails.end_date}</dd>
                                        </div>
                                    )}
                                    <div className="py-4 grid grid-cols-3 gap-4">
                                        <dt className="text-sm font-bold text-slate-500">勤務地</dt>
                                        <dd className="text-sm text-slate-900 col-span-2">{job.area}</dd>
                                    </div>
                                    {job.nearest_station && (
                                        <div className="py-4 grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-bold text-slate-500">最寄駅</dt>
                                            <dd className="text-sm text-slate-900 col-span-2">{job.nearest_station}</dd>
                                        </div>
                                    )}
                                    {job.location_notes && (
                                        <div className="py-4 grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-bold text-slate-500">勤務地備考</dt>
                                            <dd className="text-sm text-slate-900 col-span-2">{job.location_notes}</dd>
                                        </div>
                                    )}
                                    {/* 正社員: 残業・年間休日・試用期間 */}
                                    {fulltimeDetails?.overtime_hours && (
                                        <div className="py-4 grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-bold text-slate-500">残業時間</dt>
                                            <dd className="text-sm text-slate-900 col-span-2">{fulltimeDetails.overtime_hours}</dd>
                                        </div>
                                    )}
                                    {fulltimeDetails?.annual_holidays && (
                                        <div className="py-4 grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-bold text-slate-500">年間休日</dt>
                                            <dd className="text-sm text-slate-900 col-span-2">{fulltimeDetails.annual_holidays}日</dd>
                                        </div>
                                    )}
                                    {fulltimeDetails?.probation_period && (
                                        <div className="py-4 grid grid-cols-3 gap-4">
                                            <dt className="text-sm font-bold text-slate-500">試用期間</dt>
                                            <dd className="text-sm text-slate-900 col-span-2">
                                                {fulltimeDetails.probation_period}
                                                {fulltimeDetails.probation_details && (
                                                    <span className="text-slate-500 ml-1">（{fulltimeDetails.probation_details}）</span>
                                                )}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>

                        {/* Details Sections */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 md:p-8 space-y-10">

                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <Briefcase className="w-5 h-5 mr-2 text-primary-500" />
                                        仕事内容
                                    </h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
                                        {job.description || "詳細情報はありません。"}
                                    </div>
                                </section>

                                <div className="h-px bg-slate-100" />

                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <CheckCircle2 className="w-5 h-5 mr-2 text-primary-500" />
                                        応募資格・条件
                                    </h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                        {(() => {
                                            try {
                                                const items = JSON.parse(job.requirements || "[]");
                                                if (Array.isArray(items) && items.length > 0) {
                                                    return (
                                                        <ul className="list-disc pl-5 space-y-1">
                                                            {items.map((item: string, i: number) => (
                                                                <li key={i}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    );
                                                }
                                                return <p className="whitespace-pre-wrap">{job.requirements || "特になし"}</p>;
                                            } catch {
                                                return <p className="whitespace-pre-wrap">{job.requirements || "特になし"}</p>;
                                            }
                                        })()}
                                    </div>
                                    {/* 歓迎要件（正社員） */}
                                    {fulltimeDetails?.welcome_requirements && (
                                        <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100">
                                            <p className="text-sm font-bold text-green-700 mb-2 flex items-center">
                                                <Star className="w-4 h-4 mr-1" />
                                                歓迎要件
                                            </p>
                                            <p className="text-sm text-green-800 whitespace-pre-wrap">{fulltimeDetails.welcome_requirements}</p>
                                        </div>
                                    )}
                                </section>

                                <div className="h-px bg-slate-100" />

                                {/* 服装規定セクション（派遣で特に重要） */}
                                {(job.attire_type || job.hair_style || job.attire || dispatchDetails?.nail_policy) && (
                                    <>
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                <Shirt className="w-5 h-5 mr-2 text-primary-500" />
                                                服装・身だしなみ
                                            </h2>
                                            <div className={cn(
                                                "rounded-lg border p-5",
                                                isDispatch ? "bg-pink-50/50 border-pink-100" : "bg-slate-50 border-slate-100"
                                            )}>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {(job.attire_type || job.attire) && (
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-lg">👔</span>
                                                            <div>
                                                                <span className="text-xs font-bold text-slate-500 block mb-0.5">服装</span>
                                                                <p className="text-sm text-slate-800 font-medium">{job.attire_type || job.attire}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {job.hair_style && (
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-lg">💇</span>
                                                            <div>
                                                                <span className="text-xs font-bold text-slate-500 block mb-0.5">髪型・髪色</span>
                                                                <p className="text-sm text-slate-800 font-medium">{job.hair_style}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {dispatchDetails?.nail_policy && (
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-lg">💅</span>
                                                            <div>
                                                                <span className="text-xs font-bold text-slate-500 block mb-0.5">ネイル</span>
                                                                <p className="text-sm text-slate-800 font-medium">{dispatchDetails.nail_policy}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </section>
                                        <div className="h-px bg-slate-100" />
                                    </>
                                )}

                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <Building2 className="w-5 h-5 mr-2 text-primary-500" />
                                        勤務地情報
                                    </h2>
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 space-y-4">
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-slate-400 block mb-1">勤務先</span>
                                                <p className="font-bold text-slate-900">{job.workplace_name || "未設定"}</p>
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-slate-400 block mb-1">アクセス</span>
                                                <p className="text-slate-700">{job.workplace_access || "未設定"}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 block mb-1">住所</span>
                                            <p className="text-slate-700">{job.workplace_address || "未設定"}</p>
                                        </div>
                                        {(job.nearest_station || job.location_notes) && (
                                            <div className="flex flex-col sm:flex-row gap-6 pt-2 border-t border-slate-200/50">
                                                {job.nearest_station && (
                                                    <div className="flex-1">
                                                        <span className="text-xs font-bold text-slate-400 block mb-1">最寄駅</span>
                                                        <p className="text-slate-700">{job.nearest_station}</p>
                                                    </div>
                                                )}
                                                {job.location_notes && (
                                                    <div className="flex-1">
                                                        <span className="text-xs font-bold text-slate-400 block mb-1">勤務地備考</span>
                                                        <p className="text-slate-700">{job.location_notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <div className="h-px bg-slate-100" />

                                <div className="grid md:grid-cols-2 gap-8">
                                    <section>
                                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                            <Clock className="w-5 h-5 mr-2 text-primary-500" />
                                            勤務時間
                                        </h2>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 whitespace-pre-wrap">
                                            {job.working_hours || "確認中"}
                                        </div>
                                    </section>

                                    <section>
                                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                            <CalendarDays className="w-5 h-5 mr-2 text-primary-500" />
                                            休日・休暇
                                        </h2>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700">
                                            {(() => {
                                                try {
                                                    const items = JSON.parse(job.holidays || "[]");
                                                    if (Array.isArray(items) && items.length > 0) {
                                                        return (
                                                            <ul className="list-disc pl-5 space-y-1">
                                                                {items.map((item: string, i: number) => (
                                                                    <li key={i}>{item}</li>
                                                                ))}
                                                            </ul>
                                                        );
                                                    }
                                                    return <p className="whitespace-pre-wrap">{job.holidays || "確認中"}</p>;
                                                } catch {
                                                    return <p className="whitespace-pre-wrap">{job.holidays || "確認中"}</p>;
                                                }
                                            })()}
                                        </div>
                                    </section>
                                </div>

                                {job.benefits && (() => {
                                    try {
                                        const items = JSON.parse(job.benefits);
                                        if (Array.isArray(items) && items.length === 0) {
                                            return null;
                                        }
                                    } catch {
                                        // Not a valid JSON array, continue to display
                                    }
                                    return (
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                <Building2 className="w-5 h-5 mr-2 text-primary-500" />
                                                福利厚生
                                            </h2>
                                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                                {(() => {
                                                    try {
                                                        const items = JSON.parse(job.benefits);
                                                        if (Array.isArray(items) && items.length > 0) {
                                                            return (
                                                                <ul className="list-disc pl-5 space-y-1">
                                                                    {items.map((item: string, i: number) => (
                                                                        <li key={i}>{item}</li>
                                                                    ))}
                                                                </ul>
                                                            );
                                                        }
                                                        return <p className="whitespace-pre-wrap">{job.benefits}</p>;
                                                    } catch {
                                                        return <p className="whitespace-pre-wrap">{job.benefits}</p>;
                                                    }
                                                })()}
                                            </div>
                                        </section>
                                    );
                                })()}

                                {/* 企業情報（正社員のみ・控えめに表示） */}
                                {isFulltime && fulltimeDetails && (fulltimeDetails.company_overview || fulltimeDetails.industry) && (
                                    <>
                                        <div className="h-px bg-slate-100" />
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                <Building2 className="w-5 h-5 mr-2 text-primary-500" />
                                                企業情報
                                            </h2>
                                            <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 space-y-3">
                                                {fulltimeDetails.company_name && fulltimeDetails.is_company_name_public && (
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 block mb-0.5">会社名</span>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.company_name}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.industry && (
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 block mb-0.5">業界</span>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.industry}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.company_size && (
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 block mb-0.5">従業員数</span>
                                                        <p className="text-sm text-slate-700">{fulltimeDetails.company_size}</p>
                                                    </div>
                                                )}
                                                {fulltimeDetails.company_overview && (
                                                    <div>
                                                        <span className="text-xs font-bold text-slate-400 block mb-0.5">会社概要</span>
                                                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{fulltimeDetails.company_overview}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    </>
                                )}

                                {/* 備考（派遣） */}
                                {dispatchDetails?.general_notes && (
                                    <>
                                        <div className="h-px bg-slate-100" />
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4">備考</h2>
                                            <div className="text-sm text-slate-700 whitespace-pre-wrap">{dispatchDetails.general_notes}</div>
                                        </section>
                                    </>
                                )}

                                {job.selection_process && (
                                    <>
                                        <div className="h-px bg-slate-100" />
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4">選考プロセス</h2>
                                            <div className="bg-primary-50/50 p-5 rounded-lg border border-primary-100 text-slate-700">
                                                {(() => {
                                                    try {
                                                        const items = JSON.parse(job.selection_process || "[]");
                                                        if (Array.isArray(items) && items.length > 0) {
                                                            return (
                                                                <ol className="list-decimal pl-5 space-y-2 font-bold text-primary-800">
                                                                    {items.map((item: string, i: number) => (
                                                                        <li key={i}><span className="font-normal text-slate-700">{item}</span></li>
                                                                    ))}
                                                                </ol>
                                                            );
                                                        }
                                                        return <p className="whitespace-pre-wrap">{job.selection_process}</p>;
                                                    } catch {
                                                        return <p className="whitespace-pre-wrap">{job.selection_process}</p>;
                                                    }
                                                })()}
                                            </div>
                                        </section>
                                    </>
                                )}

                            </div>
                        </div>
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
