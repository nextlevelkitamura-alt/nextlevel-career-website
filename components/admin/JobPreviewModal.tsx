"use client";

import { Button } from "@/components/ui/button";
import { X, MapPin, Banknote, Tag, Clock, CalendarDays, CheckCircle2, Building2, Briefcase, Users, Star, AlertCircle, Shirt } from "lucide-react";

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
    attire_type?: string;
    hair_style?: string;
    nearest_station?: string;
    // 派遣専用
    client_company_name?: string;
    training_period?: string;
    training_salary?: string;
    end_date?: string;
    actual_work_hours?: string;
    work_days_per_week?: string;
    nail_policy?: string;
    shift_notes?: string;
    general_notes?: string;
    // 正社員専用
    company_name?: string;
    industry?: string;
    company_size?: string;
    company_overview?: string;
    annual_salary_min?: string;
    annual_salary_max?: string;
    overtime_hours?: string;
    annual_holidays?: string;
    probation_period?: string;
    probation_details?: string;
    appeal_points?: string;
    welcome_requirements?: string;
    // 正社員専用（追加フィールド）
    business_overview?: string;
    salary_detail?: string;
    recruitment_background?: string;
    education_training?: string;
    department_details?: string;
    work_location_detail?: string;
    transfer_policy?: string;
    representative?: string;
    capital?: string;
    company_address?: string;
    company_url?: string;
    is_company_name_public?: boolean;
    established_date?: string;
    smoking_policy?: string;
    part_time_available?: boolean;
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

function InfoItem({ label, value, bold }: { label: string; value?: string; bold?: boolean }) {
    if (!value) return null;
    return (
        <div>
            <span className="text-xs font-bold text-slate-400 block mb-1">{label}</span>
            <p className={`text-slate-700 ${bold ? 'font-bold text-lg text-slate-900' : ''}`}>{value}</p>
        </div>
    );
}

export default function JobPreviewModal({ isOpen, onClose, data }: JobPreviewModalProps) {
    if (!isOpen) return null;

    const isDispatch = data.type === '派遣' || data.type === '紹介予定派遣';
    const isFulltime = data.type === '正社員' || data.type === '契約社員';

    // Build salary display
    const salaryDisplay = (() => {
        if (isDispatch && data.hourly_wage) {
            return `時給 ${data.hourly_wage.toLocaleString()}円`;
        }
        if (isFulltime && data.annual_salary_min && data.annual_salary_max) {
            return `年収 ${Number(data.annual_salary_min).toLocaleString()}万〜${Number(data.annual_salary_max).toLocaleString()}万円`;
        }
        return data.salary || "給与未設定";
    })();

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
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isDispatch ? 'bg-slate-100 text-slate-700 border-slate-200' : isFulltime ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
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
                                    <span className="font-bold text-slate-900">{salaryDisplay}</span>
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

                                {/* 1. 仕事の魅力・やりがい（正社員） */}
                                {isFulltime && data.appeal_points && (
                                    <>
                                        <section>
                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                                                <h2 className="text-base font-bold text-amber-800 mb-3 flex items-center">
                                                    <Star className="w-5 h-5 mr-2 text-amber-500" />
                                                    仕事の魅力・やりがい
                                                </h2>
                                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                    {data.appeal_points}
                                                </div>
                                            </div>
                                        </section>
                                        <div className="h-px bg-slate-100" />
                                    </>
                                )}

                                {/* 2. 募集背景（正社員） */}
                                {isFulltime && data.recruitment_background && (
                                    <>
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                <AlertCircle className="w-5 h-5 mr-2 text-primary-500" />
                                                募集背景
                                            </h2>
                                            <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                {data.recruitment_background}
                                            </div>
                                        </section>
                                        <div className="h-px bg-slate-100" />
                                    </>
                                )}

                                {/* 3. 仕事内容 */}
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

                                {/* 4. 勤務地・交通 */}
                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-primary-500" />
                                        勤務地・交通
                                    </h2>
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 space-y-4">
                                        {/* 正社員：転勤、勤務地詳細、アクセス */}
                                        {isFulltime && (
                                            <>
                                                {data.transfer_policy && (
                                                    <p className="text-slate-700 font-medium">◎ {data.transfer_policy}</p>
                                                )}
                                                {data.work_location_detail && (
                                                    <div className="mt-3 pt-3 border-t border-slate-200/50">
                                                        <span className="text-xs font-bold text-slate-400 block mb-2">勤務地エリア詳細</span>
                                                        <div className="text-slate-700 text-sm whitespace-pre-wrap">{data.work_location_detail}</div>
                                                    </div>
                                                )}
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <InfoItem label="勤務先" value={data.workplace_name} bold />
                                                    <InfoItem label="最寄駅" value={data.nearest_station} />
                                                </div>
                                                <InfoItem label="アクセス" value={data.workplace_access} />
                                                {data.is_company_name_public !== false && data.company_address && (
                                                    <InfoItem label="住所" value={data.company_address} />
                                                )}
                                            </>
                                        )}
                                        {/* 派遣：最寄駅、住所、アクセスのみ表示 */}
                                        {isDispatch && (
                                            <>
                                                <InfoItem label="勤務先" value={data.workplace_name} bold />
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <InfoItem label="最寄駅" value={data.nearest_station} />
                                                    <InfoItem label="アクセス" value={data.workplace_access} />
                                                </div>
                                                <InfoItem label="住所" value={data.workplace_address} />
                                            </>
                                        )}
                                    </div>
                                </section>

                                <div className="h-px bg-slate-100" />

                                {/* 5. 勤務時間 */}
                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <Clock className="w-5 h-5 mr-2 text-primary-500" />
                                        勤務時間
                                    </h2>
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <span className="text-xs font-bold text-slate-400 block mb-1">勤務時間</span>
                                                <p className="text-slate-700 whitespace-pre-wrap">
                                                    {data.workingHours || <span className="text-slate-400">未設定</span>}
                                                </p>
                                            </div>
                                            {isFulltime && data.overtime_hours && (
                                                <InfoItem label="月平均残業時間" value={data.overtime_hours} />
                                            )}
                                            {isFulltime && data.part_time_available && (
                                                <p className="text-amber-600 font-medium">★ 時短勤務も相談可能です！</p>
                                            )}
                                            {isDispatch && (
                                                <>
                                                    <InfoItem label="実働時間" value={data.actual_work_hours ? `${data.actual_work_hours}時間` : undefined} />
                                                    <InfoItem label="週の出勤日数" value={data.work_days_per_week ? `週${data.work_days_per_week}日` : undefined} />
                                                    <InfoItem label="シフト備考" value={data.shift_notes} />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <div className="h-px bg-slate-100" />

                                {/* 6. 給与 */}
                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <Banknote className="w-5 h-5 mr-2 text-primary-500" />
                                        給与
                                    </h2>
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* 給与メイン表示 */}
                                            {isFulltime && data.annual_salary_min && data.annual_salary_max && (
                                                <div className="md:col-span-2">
                                                    <span className="text-xs font-bold text-slate-400 block mb-1">年収</span>
                                                    <p className="font-bold text-xl text-slate-900">
                                                        {Number(data.annual_salary_min).toLocaleString()}万〜{Number(data.annual_salary_max).toLocaleString()}万円
                                                    </p>
                                                </div>
                                            )}
                                            {isDispatch && (
                                                <>
                                                    <InfoItem label="時給" value={data.hourly_wage ? `¥${data.hourly_wage.toLocaleString()}` : undefined} bold />
                                                    <InfoItem label="研修中給与" value={data.training_salary} />
                                                </>
                                            )}
                                            {/* 給与エリア詳細（正社員） */}
                                            {isFulltime && data.salary_detail && (
                                                <div className="md:col-span-2 mt-2 pt-4 border-t border-slate-200/50">
                                                    <span className="text-xs font-bold text-slate-400 block mb-2">エリア別給与詳細</span>
                                                    <div className="text-slate-700 text-sm whitespace-pre-wrap">{data.salary_detail}</div>
                                                </div>
                                            )}
                                            {data.salary_description && (
                                                <div className="md:col-span-2">
                                                    <span className="text-xs font-bold text-slate-400 block mb-1">給与詳細</span>
                                                    <div className="text-slate-700 text-sm whitespace-pre-wrap">{data.salary_description}</div>
                                                </div>
                                            )}
                                            {isDispatch && (
                                                <>
                                                    <InfoItem label="研修期間" value={data.training_period} />
                                                    <InfoItem label="契約終了日" value={data.end_date} />
                                                </>
                                            )}
                                            <InfoItem label="雇用期間" value={data.period} />
                                            <InfoItem label="就業開始" value={data.start_date} />
                                        </div>
                                    </div>
                                </section>

                                <div className="h-px bg-slate-100" />

                                {/* 7. 休日休暇 */}
                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <CalendarDays className="w-5 h-5 mr-2 text-primary-500" />
                                        休日休暇
                                    </h2>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700">
                                        {isFulltime && data.annual_holidays && (
                                            <p className="font-bold text-slate-900 mb-2">★ 年間休日 {data.annual_holidays}日以上</p>
                                        )}
                                        {renderListOrText(data.holidays, "休日・休暇未設定")}
                                    </div>
                                </section>

                                <div className="h-px bg-slate-100" />

                                {/* 8. 福利厚生・待遇 */}
                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <Building2 className="w-5 h-5 mr-2 text-primary-500" />
                                        福利厚生・待遇
                                    </h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                        {renderListOrText(data.benefits, "福利厚生未設定")}
                                    </div>
                                    {isFulltime && data.smoking_policy && (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <span className="text-xs font-bold text-slate-400">喫煙情報：</span>
                                            <span className="text-slate-700 ml-2">{data.smoking_policy}</span>
                                        </div>
                                    )}
                                </section>

                                {/* 9. 教育制度（正社員） */}
                                {isFulltime && data.education_training && (
                                    <>
                                        <div className="h-px bg-slate-100" />
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                <Users className="w-5 h-5 mr-2 text-primary-500" />
                                                教育制度・研修
                                            </h2>
                                            <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100 text-slate-700 whitespace-pre-wrap">
                                                {data.education_training}
                                            </div>
                                        </section>
                                    </>
                                )}

                                <div className="h-px bg-slate-100" />

                                {/* 10. 服装・身だしなみ */}
                                {(data.attire_type || data.hair_style || data.nail_policy) && (
                                    <>
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                <Shirt className="w-5 h-5 mr-2 text-primary-500" />
                                                服装・身だしなみ
                                            </h2>
                                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <InfoItem label="服装" value={data.attire_type} />
                                                    <InfoItem label="髪型" value={data.hair_style} />
                                                    {isDispatch && <InfoItem label="ネイル" value={data.nail_policy} />}
                                                </div>
                                            </div>
                                        </section>
                                        <div className="h-px bg-slate-100" />
                                    </>
                                )}

                                {/* 11. 試用期間 */}
                                {(isFulltime || isDispatch) && (data.probation_period || data.probation_details) && (
                                    <>
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4">試用期間</h2>
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                                {data.probation_period && (
                                                    <p className="font-medium text-slate-700">{data.probation_period}</p>
                                                )}
                                                {data.probation_details && (
                                                    <p className="text-slate-500 text-sm mt-1">（{data.probation_details}）</p>
                                                )}
                                            </div>
                                        </section>
                                        <div className="h-px bg-slate-100" />
                                    </>
                                )}

                                {/* 12. 応募資格・条件 */}
                                <section>
                                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                        <CheckCircle2 className="w-5 h-5 mr-2 text-primary-500" />
                                        応募資格・条件
                                    </h2>
                                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                        {renderListOrText(data.requirements, "応募資格未設定")}
                                    </div>
                                    {/* 歓迎要件（正社員） */}
                                    {isFulltime && data.welcome_requirements && (
                                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                                            <h3 className="text-sm font-bold text-green-700 mb-2">歓迎要件</h3>
                                            <div className="text-slate-600 leading-relaxed">
                                                {renderListOrText(data.welcome_requirements, "")}
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* 13. 備考（派遣） */}
                                {isDispatch && data.general_notes && (
                                    <>
                                        <div className="h-px bg-slate-100" />
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                <AlertCircle className="w-5 h-5 mr-2 text-primary-500" />
                                                備考
                                            </h2>
                                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 whitespace-pre-wrap">
                                                {data.general_notes}
                                            </div>
                                        </section>
                                    </>
                                )}

                                {/* 14. 選考プロセス */}
                                {data.selectionProcess && (
                                    <>
                                        <div className="h-px bg-slate-100" />
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                <Users className="w-5 h-5 mr-2 text-primary-500" />
                                                選考プロセス
                                            </h2>
                                            <div className="bg-primary-50/50 p-5 rounded-lg border border-primary-100 text-slate-700">
                                                {renderListOrText(data.selectionProcess, "")}
                                            </div>
                                        </section>
                                    </>
                                )}

                                {/* 15. 会社概要（正社員） */}
                                {isFulltime && (data.company_name || data.industry || data.company_overview || data.business_overview || data.established_date || data.representative || data.capital || data.company_size || data.department_details || data.company_url) && (
                                    <>
                                        <div className="h-px bg-slate-100" />
                                        <section>
                                            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                                <Building2 className="w-5 h-5 mr-2 text-primary-500" />
                                                会社概要
                                            </h2>
                                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {data.is_company_name_public !== false && (
                                                        <InfoItem label="企業名" value={data.company_name} bold />
                                                    )}
                                                    {data.is_company_name_public === false && (
                                                        <div className="md:col-span-2 mb-2">
                                                            <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded">企業名非公開</span>
                                                        </div>
                                                    )}
                                                    <InfoItem label="設立" value={data.established_date} />
                                                    <InfoItem label="代表者" value={data.representative} />
                                                    <InfoItem label="資本金" value={data.capital} />
                                                    <InfoItem label="従業員数" value={data.company_size} />
                                                    <InfoItem label="業種" value={data.industry} />
                                                    <InfoItem label="配属部署" value={data.department_details} />
                                                </div>
                                                {data.business_overview && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                                                        <span className="text-xs font-bold text-slate-400 block mb-1">事業内容</span>
                                                        <p className="text-slate-700 text-sm whitespace-pre-wrap">{data.business_overview}</p>
                                                    </div>
                                                )}
                                                {data.company_overview && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                                                        <span className="text-xs font-bold text-slate-400 block mb-1">企業概要</span>
                                                        <p className="text-slate-700 text-sm whitespace-pre-wrap">{data.company_overview}</p>
                                                    </div>
                                                )}
                                                {data.is_company_name_public !== false && data.company_address && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                                                        <span className="text-xs font-bold text-slate-400 block mb-1">事業所</span>
                                                        <p className="text-slate-700 text-sm">{data.company_address}</p>
                                                    </div>
                                                )}
                                                {data.is_company_name_public !== false && data.company_url && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200/50">
                                                        <span className="text-xs font-bold text-slate-400 block mb-1">企業ホームページ</span>
                                                        <a href={data.company_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline text-sm">{data.company_url}</a>
                                                    </div>
                                                )}
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
