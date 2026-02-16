import { getJob, checkApplicationStatus } from "../actions";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Banknote, Clock, ChevronLeft, Star } from "lucide-react";
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

                            {/* サマリーボックス — iDA風 */}
                            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2.5 text-sm">
                                {(job.job_category_detail || job.category) && (
                                    <p className="font-bold text-slate-900">{job.job_category_detail || job.category}</p>
                                )}
                                <div className="flex items-center text-slate-700">
                                    <MapPin className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                                    {job.area}
                                </div>
                                {job.nearest_station && (
                                    <div className="flex items-center text-slate-700">
                                        <span className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0 text-center text-xs">🚃</span>
                                        {job.nearest_station}
                                    </div>
                                )}
                                <div className="flex items-center text-slate-900 font-bold">
                                    <Banknote className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                                    {job.salary || (isDispatch && job.hourly_wage ? `時給${job.hourly_wage.toLocaleString()}円` : "")}
                                </div>
                                {job.working_hours && (
                                    <div className="flex items-center text-slate-700">
                                        <Clock className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
                                        {job.working_hours}
                                    </div>
                                )}
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
                                    <Star className="w-5 h-5 mr-2 text-blue-500" />
                                    仕事の魅力・やりがい
                                </h2>
                                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {fulltimeDetails.appeal_points}
                                </div>
                            </div>
                        )}

                        {/* 求人情報 — 1項目=1セクション */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 md:px-8 divide-y divide-slate-200">
                                {/* 雇用形態 */}
                                <div className="py-6">
                                    <h3 className="text-base font-bold text-slate-900 mb-2">雇用形態</h3>
                                    <p className="text-slate-700">{job.type}</p>
                                </div>

                                {/* 職種 */}
                                {(job.job_category_detail || job.category) && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-2">職種</h3>
                                        <p className="text-slate-700">{job.job_category_detail || job.category}</p>
                                    </div>
                                )}

                                {/* 給与 */}
                                <div className="py-6">
                                    <h3 className="text-base font-bold text-slate-900 mb-2">給与</h3>
                                    <p className="text-lg font-bold text-slate-900">{job.salary}</p>
                                    <div className="mt-2 space-y-1 text-sm text-slate-600">
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
                                <div className="py-6">
                                    <h3 className="text-base font-bold text-slate-900 mb-2">勤務地</h3>
                                    <p className="text-slate-700">{job.area}</p>
                                </div>

                                {/* 最寄駅 */}
                                {job.nearest_station && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-2">最寄駅</h3>
                                        <p className="text-slate-700">{job.nearest_station}</p>
                                    </div>
                                )}

                                {/* 勤務地備考 */}
                                {job.location_notes && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-2">勤務地備考</h3>
                                        <p className="text-slate-700">{job.location_notes}</p>
                                    </div>
                                )}

                                {/* 勤務時間 */}
                                {job.working_hours && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-2">勤務時間</h3>
                                        <p className="text-slate-700 whitespace-pre-wrap">{job.working_hours}</p>
                                        {dispatchDetails?.actual_work_hours && (
                                            <p className="text-sm text-slate-600 mt-1">実働{dispatchDetails.actual_work_hours}時間</p>
                                        )}
                                    </div>
                                )}

                                {/* 休日休暇 */}
                                {job.holidays && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-2">休日休暇</h3>
                                        <div className="text-slate-700">
                                            {(() => {
                                                try {
                                                    const items = JSON.parse(job.holidays);
                                                    if (Array.isArray(items) && items.length > 0) {
                                                        return items.join("　");
                                                    }
                                                    return <p className="whitespace-pre-wrap">{job.holidays}</p>;
                                                } catch {
                                                    return <p className="whitespace-pre-wrap">{job.holidays}</p>;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* 派遣: 勤務期間 */}
                                {dispatchDetails?.end_date && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-2">勤務期間</h3>
                                        <p className="text-slate-700">{dispatchDetails.end_date}</p>
                                    </div>
                                )}

                                {/* 派遣: 出勤日数 */}
                                {dispatchDetails?.work_days_per_week && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-2">出勤日数</h3>
                                        <p className="text-slate-700">週{dispatchDetails.work_days_per_week}日</p>
                                    </div>
                                )}

                                {/* 派遣: 研修期間 */}
                                {dispatchDetails?.training_period && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-2">研修期間</h3>
                                        <p className="text-slate-700">{dispatchDetails.training_period}</p>
                                        {dispatchDetails?.training_salary && (
                                            <p className="text-sm text-orange-600 mt-1">研修中給与: {dispatchDetails.training_salary}</p>
                                        )}
                                    </div>
                                )}

                                {/* 正社員: 残業時間 */}
                                {fulltimeDetails?.overtime_hours && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-2">残業時間</h3>
                                        <p className="text-slate-700">{fulltimeDetails.overtime_hours}</p>
                                    </div>
                                )}

                                {/* 正社員: 年間休日 */}
                                {fulltimeDetails?.annual_holidays && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-2">年間休日</h3>
                                        <p className="text-slate-700">{fulltimeDetails.annual_holidays}日</p>
                                    </div>
                                )}

                                {/* 正社員: 試用期間 */}
                                {fulltimeDetails?.probation_period && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-2">試用期間</h3>
                                        <p className="text-slate-700">
                                            {fulltimeDetails.probation_period}
                                            {fulltimeDetails.probation_details && (
                                                <span className="text-slate-500 ml-1">（{fulltimeDetails.probation_details}）</span>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 詳細セクション — 1項目=1セクション統一 */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="px-6 md:px-8 divide-y divide-slate-200">

                                {/* 対象となる方（応募資格） */}
                                <div className="py-6">
                                    <h3 className="text-base font-bold text-slate-900 mb-3">対象となる方</h3>
                                    <div className="text-slate-700 leading-relaxed">
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
                                                return <p className="whitespace-pre-wrap">{job.requirements || "特になし"}</p>;
                                            } catch {
                                                return <p className="whitespace-pre-wrap">{job.requirements || "特になし"}</p>;
                                            }
                                        })()}
                                    </div>
                                    {fulltimeDetails?.welcome_requirements && (
                                        <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100">
                                            <p className="text-sm font-bold text-green-700 mb-2 flex items-center">
                                                <Star className="w-4 h-4 mr-1" />
                                                歓迎要件
                                            </p>
                                            <p className="text-sm text-green-800 whitespace-pre-wrap">{fulltimeDetails.welcome_requirements}</p>
                                        </div>
                                    )}
                                </div>

                                {/* 仕事内容 */}
                                <div className="py-6">
                                    <h3 className="text-base font-bold text-slate-900 mb-3">仕事内容</h3>
                                    <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {job.description || "詳細情報はありません。"}
                                    </div>
                                </div>

                                {/* 服装・身だしなみ */}
                                {(job.attire_type || job.hair_style || job.attire || dispatchDetails?.nail_policy) && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-3">服装・身だしなみ</h3>
                                        <div className="space-y-2 text-slate-700">
                                            {(job.attire_type || job.attire) && (
                                                <p>【服装】{job.attire_type || job.attire}</p>
                                            )}
                                            {job.hair_style && (
                                                <p>【髪型・髪色】{job.hair_style}</p>
                                            )}
                                            {dispatchDetails?.nail_policy && (
                                                <p>【ネイル】{dispatchDetails.nail_policy}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 福利厚生 */}
                                {job.benefits && (() => {
                                    try {
                                        const items = JSON.parse(job.benefits);
                                        if (Array.isArray(items) && items.length === 0) {
                                            return null;
                                        }
                                    } catch {
                                        // continue
                                    }
                                    return (
                                        <div className="py-6">
                                            <h3 className="text-base font-bold text-slate-900 mb-3">福利厚生</h3>
                                            <div className="text-slate-700 leading-relaxed">
                                                {(() => {
                                                    try {
                                                        const items = JSON.parse(job.benefits);
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
                                                        return <p className="whitespace-pre-wrap">{job.benefits}</p>;
                                                    } catch {
                                                        return <p className="whitespace-pre-wrap">{job.benefits}</p>;
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* 企業情報（正社員のみ） */}
                                {isFulltime && fulltimeDetails && (fulltimeDetails.company_overview || fulltimeDetails.industry) && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-3">企業情報</h3>
                                        <div className="space-y-3 text-slate-700">
                                            {fulltimeDetails.company_name && fulltimeDetails.is_company_name_public && (
                                                <p><span className="font-medium">会社名:</span> {fulltimeDetails.company_name}</p>
                                            )}
                                            {fulltimeDetails.industry && (
                                                <p><span className="font-medium">業界:</span> {fulltimeDetails.industry}</p>
                                            )}
                                            {fulltimeDetails.company_size && (
                                                <p><span className="font-medium">従業員数:</span> {fulltimeDetails.company_size}</p>
                                            )}
                                            {fulltimeDetails.company_overview && (
                                                <p className="whitespace-pre-wrap">{fulltimeDetails.company_overview}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* 備考（派遣） */}
                                {dispatchDetails?.general_notes && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-3">備考</h3>
                                        <p className="text-slate-700 whitespace-pre-wrap">{dispatchDetails.general_notes}</p>
                                    </div>
                                )}

                                {/* 選考プロセス */}
                                {job.selection_process && (
                                    <div className="py-6">
                                        <h3 className="text-base font-bold text-slate-900 mb-3">応募方法</h3>
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
                                                    return <p className="whitespace-pre-wrap">{job.selection_process}</p>;
                                                } catch {
                                                    return <p className="whitespace-pre-wrap">{job.selection_process}</p>;
                                                }
                                            })()}
                                        </div>
                                    </div>
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
