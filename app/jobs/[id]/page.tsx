import { getJob, checkApplicationStatus } from "../actions";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Banknote, Clock, CalendarDays, CheckCircle2, ChevronLeft, Building2, Briefcase } from "lucide-react";
import ApplyButton from "@/components/jobs/ApplyButton";

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
                        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100">
                                    {job.category}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    {job.type}
                                </span>
                                <span className="text-xs text-slate-400 font-mono self-center ml-auto">ID: {job.job_code}</span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 leading-tight">
                                {job.title}
                            </h1>

                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-sm mb-6 pb-6 border-b border-slate-100">
                                <div className="flex items-center text-slate-600">
                                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                    {job.area}
                                </div>
                                <div className="flex items-center text-slate-600">
                                    <Banknote className="w-4 h-4 mr-2 text-slate-400" />
                                    <span className="font-bold text-slate-900">{job.salary}</span>
                                </div>
                            </div>

                        </div>

                        {/* 特徴 (Feature Tags) */}
                        {job.tags && job.tags.length > 0 && (
                            <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">特徴</h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.tags.map((tag: string) => (
                                        <span key={tag} className="px-3 py-1.5 rounded-full text-sm font-medium bg-pink-50 text-pink-700 border border-pink-200">
                                            {tag}
                                        </span>
                                    ))}
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
                                            </div>
                                        </dd>
                                    </div>
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
                                                            {items.map((item, i) => (
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
                                </section>

                                <div className="h-px bg-slate-100" />

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
                                        {(job.attire_type || job.hair_style || job.attire) && (
                                            <div className="flex flex-col sm:flex-row gap-6 pt-2 border-t border-slate-200/50">
                                                {job.attire_type && (
                                                    <div className="flex-1">
                                                        <span className="text-xs font-bold text-slate-400 block mb-1">服装</span>
                                                        <p className="text-slate-700">{job.attire_type}</p>
                                                    </div>
                                                )}
                                                {job.hair_style && (
                                                    <div className="flex-1">
                                                        <span className="text-xs font-bold text-slate-400 block mb-1">髪型</span>
                                                        <p className="text-slate-700">{job.hair_style}</p>
                                                    </div>
                                                )}
                                                {!job.attire_type && !job.hair_style && job.attire && (
                                                    <div className="flex-1">
                                                        <span className="text-xs font-bold text-slate-400 block mb-1">服装・髪型</span>
                                                        <p className="text-slate-700">{job.attire}</p>
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
                                                                {items.map((item, i) => (
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
                                                                    {items.map((item, i) => (
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
                                                                    {items.map((item, i) => (
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
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Apply Box */}
                            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
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
        </div>
    );
}
