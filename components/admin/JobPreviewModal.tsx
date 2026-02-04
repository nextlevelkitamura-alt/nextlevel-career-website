"use client";

import { Button } from "@/components/ui/button";
import { X, MapPin, Banknote, Tag, Clock, CalendarDays, CheckCircle2, Building2, Briefcase } from "lucide-react";

interface JobPreviewData {
    title: string;
    area: string;
    salary: string;
    type: string;
    category: string;
    tags: string[];
    description: string;
    requirements: string;
    workingHours: string;
    holidays: string;
    benefits: string;
    selectionProcess: string;
    hourly_wage?: number;
    salary_description?: string;
    period?: string;
    start_date?: string;
    workplace_name?: string;
    workplace_address?: string;
    workplace_access?: string;
    attire?: string;
    attire_type?: string;
    hair_style?: string;
    gender_ratio?: string;
}

interface JobPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: JobPreviewData;
}

// Helper to render list from JSON string
function renderListOrText(value: string, fallback: string = "未設定") {
    if (!value) return <p className="text-slate-500">{fallback}</p>;

    try {
        const items = JSON.parse(value);
        if (Array.isArray(items) && items.length > 0) {
            return (
                <ul className="list-disc pl-5 space-y-1">
                    {items.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            );
        }
        return <p className="whitespace-pre-wrap">{value}</p>;
    } catch {
        return <p className="whitespace-pre-wrap">{value}</p>;
    }
}

export default function JobPreviewModal({ isOpen, onClose, data }: JobPreviewModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">プレビュー</h2>
                        <p className="text-xs text-slate-500">求職者に表示される画面イメージです</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content - Simulating job detail page */}
                <div className="flex-1 overflow-auto bg-slate-50 p-6">
                    <div className="max-w-3xl mx-auto space-y-6">
                        {/* Title Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100">
                                    {data.category || "カテゴリー未設定"}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    {data.type || "雇用形態未設定"}
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold text-slate-900 mb-6 leading-tight">
                                {data.title || "求人タイトル未設定"}
                            </h1>

                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-sm mb-6 pb-6 border-b border-slate-100">
                                <div className="flex items-center text-slate-600">
                                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                                    {data.area || "エリア未設定"}
                                </div>
                                <div className="flex items-center text-slate-600">
                                    <Banknote className="w-4 h-4 mr-2 text-slate-400" />
                                    <span className="font-bold text-slate-900">{data.salary || "給与未設定"}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {data.tags?.length > 0 ? (
                                    data.tags.map((tag: string) => (
                                        <span key={tag} className="inline-flex items-center text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100">
                                            <Tag className="w-3 h-3 mr-1.5 text-slate-400" />
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-400">タグ未設定</span>
                                )}
                            </div>
                        </div>

                        {/* Details Sections */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 space-y-8">

                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <Briefcase className="w-5 h-5 mr-2 text-primary-500" />
                                        仕事内容
                                    </h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
                                        {data.description || <span className="text-slate-400">仕事内容未設定</span>}
                                    </div>
                                </section>

                                <div className="h-px bg-slate-100" />

                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <CheckCircle2 className="w-5 h-5 mr-2 text-primary-500" />
                                        応募資格・条件
                                    </h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                        {renderListOrText(data.requirements, "応募資格未設定")}
                                    </div>
                                </section>

                                <div className="h-px bg-slate-100" />

                                <div className="h-px bg-slate-100" />

                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <Banknote className="w-5 h-5 mr-2 text-primary-500" />
                                        給与・条件
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-100">
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 block mb-1">時給</span>
                                            <p className="font-bold text-lg text-slate-900">{data.hourly_wage ? `¥${data.hourly_wage.toLocaleString()}` : "未設定"}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 block mb-1">雇用期間</span>
                                            <p className="text-slate-700">{data.period || "未設定"}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 block mb-1">就業開始</span>
                                            <p className="text-slate-700">{data.start_date || "未設定"}</p>
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <span className="text-xs font-bold text-slate-400 block mb-1">給与詳細</span>
                                            <div className="text-slate-700 text-sm whitespace-pre-wrap">{data.salary_description || "―"}</div>
                                        </div>
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
                                                <p className="font-bold text-slate-900">{data.workplace_name || "未設定"}</p>
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-slate-400 block mb-1">アクセス</span>
                                                <p className="text-slate-700">{data.workplace_access || "未設定"}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 block mb-1">住所</span>
                                            <p className="text-slate-700">{data.workplace_address || "未設定"}</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-6 pt-2 border-t border-slate-200/50">
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-slate-400 block mb-1">男女比</span>
                                                <p className="text-slate-700">{data.gender_ratio || "未設定"}</p>
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-xs font-bold text-slate-400 block mb-1">服装・髪型</span>
                                                <p className="text-slate-700">{data.attire || "未設定"}</p>
                                            </div>
                                        </div>
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
                                            {data.workingHours || <span className="text-slate-400">勤務時間未設定</span>}
                                        </div>
                                    </section>

                                    <section>
                                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                            <CalendarDays className="w-5 h-5 mr-2 text-primary-500" />
                                            休日・休暇
                                        </h2>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700">
                                            {renderListOrText(data.holidays, "休日・休暇未設定")}
                                        </div>
                                    </section>
                                </div>

                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <Building2 className="w-5 h-5 mr-2 text-primary-500" />
                                        福利厚生
                                    </h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                        {renderListOrText(data.benefits, "福利厚生未設定")}
                                    </div>
                                </section>

                                {data.selectionProcess && (
                                    <>
                                        <div className="h-px bg-slate-100" />
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4">選考プロセス</h2>
                                            <div className="bg-primary-50/50 p-5 rounded-lg border border-primary-100 text-slate-700">
                                                {renderListOrText(data.selectionProcess, "")}
                                            </div>
                                        </section>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        閉じる
                    </Button>
                    <Button onClick={onClose} className="bg-primary-600 hover:bg-primary-700 text-white">
                        内容に問題なし
                    </Button>
                </div>
            </div>
        </div>
    );
}
