"use client";

import { useState, useMemo } from "react";
import { Check, Square, X, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const FIELD_LABELS: Record<string, string> = {
    // 基本情報
    title: "タイトル",
    area: "エリア",
    search_areas: "勤務地エリア",
    type: "雇用形態",
    category: "職種カテゴリー",
    tags: "タグ",
    salary: "給与",
    salary_type: "給与形態",
    hourly_wage: "時給（検索用）",
    salary_description: "給与詳細",
    description: "仕事内容",
    requirements: "応募資格・条件",
    welcome_requirements: "歓迎要件",
    working_hours: "勤務時間",
    holidays: "休日・休暇",
    holiday_pattern: "休日形態（要約）",
    holiday_notes: "休日補足",
    benefits: "福利厚生",
    selection_process: "選考プロセス",
    period: "雇用期間",
    start_date: "就業開始時期",
    // 勤務地
    workplace_name: "勤務先名",
    workplace_address: "勤務地住所",
    workplace_access: "アクセス",
    nearest_station: "最寄駅",
    location_notes: "勤務地備考",
    // その他共通
    attire_type: "服装",
    hair_style: "髪型",
    job_category_detail: "詳細職種名",
    raise_info: "昇給情報",
    bonus_info: "賞与情報",
    commute_allowance: "交通費",
    // 正社員専用
    company_name: "企業名",
    company_address: "会社住所",
    industry: "業種",
    company_size: "従業員数",
    established_date: "設立年月",
    company_overview: "企業概要",
    business_overview: "事業内容",
    annual_salary_min: "年収（下限）",
    annual_salary_max: "年収（上限）",
    overtime_hours: "月平均残業時間",
    annual_holidays: "年間休日",
    probation_period: "試用期間",
    probation_details: "試用期間詳細",
    smoking_policy: "喫煙情報",
    appeal_points: "仕事の魅力",
    department_details: "配属部署詳細",
    recruitment_background: "募集背景",
    company_url: "企業ホームページ",
    education_training: "教育制度・研修",
    representative: "代表者",
    capital: "資本金",
    work_location_detail: "勤務地詳細",
    salary_detail: "給与詳細（正社員）",
    transfer_policy: "転勤の有無",
    salary_example: "年収例",
    bonus: "賞与",
    raise: "昇給",
    annual_revenue: "売上高",
    onboarding_process: "入社後の流れ",
    interview_location: "面接地",
    salary_breakdown: "給与内訳",
    shift_notes: "勤務時間補足",
    part_time_available: "時短勤務",
    // 派遣専用
    client_company_name: "派遣先企業名",
    training_salary: "研修中給与",
    training_period: "研修期間",
    end_date: "契約終了日",
    actual_work_hours: "実働時間",
    work_days_per_week: "週勤務日数",
    nail_policy: "ネイル",
    general_notes: "備考",
};

const FIELD_ORDER: string[] = [
    "title",
    "type",
    "category",
    "job_category_detail",
    "area",
    "search_areas",
    "workplace_name",
    "workplace_address",
    "nearest_station",
    "workplace_access",
    "location_notes",
    "working_hours",
    "shift_notes",
    "salary",
    "salary_type",
    "hourly_wage",
    "annual_salary_min",
    "annual_salary_max",
    "salary_description",
    "salary_detail",
    "salary_breakdown",
    "salary_example",
    "raise_info",
    "bonus_info",
    "commute_allowance",
    "description",
    "requirements",
    "welcome_requirements",
    "holidays",
    "holiday_pattern",
    "holiday_notes",
    "benefits",
    "selection_process",
    "company_name",
    "company_address",
    "industry",
    "company_size",
    "established_date",
    "company_overview",
    "business_overview",
    "department_details",
    "recruitment_background",
    "education_training",
    "probation_period",
    "probation_details",
    "overtime_hours",
    "annual_holidays",
    "smoking_policy",
    "part_time_available",
    "transfer_policy",
    "company_url",
    "representative",
    "capital",
    "annual_revenue",
    "onboarding_process",
    "interview_location",
    "tags",
];

interface AiExtractionPreviewProps {
    currentData: Record<string, unknown>;
    extractedData: Record<string, unknown>;
    jobType?: string;
    onApply: (selectedFields: string[]) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined || value === "") return "（空）";
    if (Array.isArray(value)) {
        if (value.length === 0) return "（空）";
        return value.join(", ");
    }
    if (typeof value === "boolean") return value ? "はい" : "いいえ";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

function normalizeValue(value: unknown): string {
    if (value === null || value === undefined || value === "") return "";
    if (Array.isArray(value)) return JSON.stringify(value.sort());
    return String(value).trim();
}

type FieldDiff = {
    field: string;
    label: string;
    current: unknown;
    extracted: unknown;
    type: "added" | "changed" | "removed";
};

export default function AiExtractionPreview({
    currentData,
    extractedData,
    jobType,
    onApply,
    onCancel,
    isLoading = false,
}: AiExtractionPreviewProps) {
    // 差分を計算
    const diffs = useMemo(() => {
        const result: FieldDiff[] = [];
        const allFields = Array.from(new Set([
            ...Object.keys(extractedData),
            ...Object.keys(currentData),
        ]));

        for (const field of allFields) {
            // 内部メタデータはスキップ
            if (field === "id" || field === "created_at" || field === "updated_at") continue;
            if (field === "is_company_name_public" || field === "is_client_company_public") continue;
            if ((jobType === "派遣" || jobType === "紹介予定派遣") && (field === "raise_info" || field === "bonus_info")) continue;

            const current = currentData[field];
            const extracted = extractedData[field];

            // extractedDataに存在しないフィールドはスキップ（AI抽出で返されなかったもの）
            if (!(field in extractedData)) continue;

            const currentNorm = normalizeValue(current);
            const extractedNorm = normalizeValue(extracted);

            if (currentNorm === extractedNorm) continue;

            const isEmpty = (v: unknown) =>
                v === null || v === undefined || v === "" ||
                (Array.isArray(v) && v.length === 0);

            let type: "added" | "changed" | "removed";
            if (isEmpty(current) && !isEmpty(extracted)) {
                type = "added";
            } else if (!isEmpty(current) && isEmpty(extracted)) {
                type = "removed";
            } else {
                type = "changed";
            }

            result.push({
                field,
                label: FIELD_LABELS[field] || field,
                current,
                extracted,
                type,
            });
        }

        const rank = new Map(FIELD_ORDER.map((field, index) => [field, index]));
        return result.sort((a, b) => {
            const ar = rank.get(a.field) ?? Number.MAX_SAFE_INTEGER;
            const br = rank.get(b.field) ?? Number.MAX_SAFE_INTEGER;
            if (ar !== br) return ar - br;
            return a.field.localeCompare(b.field);
        });
    }, [currentData, extractedData, jobType]);

    // デフォルト選択: added/changed は✓、removed は☐
    const [selectedFields, setSelectedFields] = useState<string[]>(() =>
        diffs
            .filter((d) => d.type === "added" || d.type === "changed")
            .map((d) => d.field)
    );

    const selectableFields = diffs.map((d) => d.field);

    const toggleAll = () => {
        if (selectedFields.length === selectableFields.length) {
            setSelectedFields([]);
        } else {
            setSelectedFields(selectableFields);
        }
    };

    const toggleField = (field: string) => {
        setSelectedFields((prev) =>
            prev.includes(field)
                ? prev.filter((f) => f !== field)
                : [...prev, field]
        );
    };

    // 警告検出
    const warnings: string[] = [];
    for (const diff of diffs) {
        if (diff.type === "removed" && selectedFields.includes(diff.field)) {
            const requiredFields = ["title", "area", "salary", "category"];
            if (requiredFields.includes(diff.field)) {
                warnings.push(`${diff.label}が空になります`);
            }
        }
    }

    if (diffs.length === 0) {
        return (
            <div className="border border-slate-200 bg-slate-50 rounded-xl p-6 text-center">
                <p className="text-slate-500">抽出結果に変更はありません</p>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="mt-3"
                >
                    閉じる
                </Button>
            </div>
        );
    }

    const addedCount = diffs.filter((d) => d.type === "added").length;
    const changedCount = diffs.filter((d) => d.type === "changed").length;
    const removedCount = diffs.filter((d) => d.type === "removed").length;

    return (
        <div className="border border-indigo-200 bg-indigo-50 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-indigo-100 px-4 py-3 border-b border-indigo-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-bold text-indigo-700">
                            AI抽出結果プレビュー
                        </span>
                        <span className="text-xs text-indigo-500">
                            {addedCount > 0 && `+${addedCount}件追加`}
                            {changedCount > 0 && ` ${addedCount > 0 ? "/ " : ""}${changedCount}件変更`}
                            {removedCount > 0 && ` / ${removedCount}件削除`}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-h-[500px] overflow-y-auto">
                <div className="p-4 space-y-4">
                    {/* Warnings */}
                    {warnings.length > 0 && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-amber-700">注意が必要な変更があります</p>
                                <ul className="text-xs text-amber-600 mt-1 space-y-1">
                                    {warnings.map((w, i) => (
                                        <li key={i}>• {w}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Selection controls */}
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            変更フィールド（{diffs.length}件）
                        </p>
                        <button
                            type="button"
                            onClick={toggleAll}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            {selectedFields.length === selectableFields.length
                                ? "全て解除"
                                : "全て選択"}
                        </button>
                    </div>

                    {/* Field diffs */}
                    <div className="space-y-2">
                        {diffs.map((diff) => {
                            const isSelected = selectedFields.includes(diff.field);

                            return (
                                <div
                                    key={diff.field}
                                    className={`bg-white border rounded-lg p-3 space-y-2 transition-all ${
                                        !isSelected
                                            ? "border-slate-200 opacity-50"
                                            : "border-slate-200"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleField(diff.field)}
                                            className="flex-shrink-0"
                                            title={isSelected ? "適用しない" : "適用する"}
                                        >
                                            {isSelected ? (
                                                <Check className="w-5 h-5 text-indigo-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-slate-300" />
                                            )}
                                        </button>
                                        <p className="text-xs font-bold text-slate-600">
                                            {diff.label}
                                        </p>
                                        {diff.type === "added" && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold">新規</span>
                                        )}
                                        {diff.type === "removed" && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold">削除</span>
                                        )}
                                    </div>

                                    {/* Before */}
                                    <div className="bg-red-50 border-l-2 border-red-300 px-3 py-2">
                                        <p className="text-xs text-red-600 font-medium mb-1">現在</p>
                                        <p className="text-sm text-slate-700 line-through opacity-70 whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                                            {formatValue(diff.current)}
                                        </p>
                                    </div>

                                    {/* After */}
                                    <div className="bg-green-50 border-l-2 border-green-400 px-3 py-2">
                                        <p className="text-xs text-green-600 font-medium mb-1">AI抽出</p>
                                        <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                                            {formatValue(diff.extracted)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            type="button"
                            onClick={() => onApply(selectedFields)}
                            disabled={isLoading || selectedFields.length === 0}
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold shadow-md hover:shadow-lg"
                        >
                            {isLoading ? (
                                "適用中..."
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    {selectedFields.length}件を適用
                                </>
                            )}
                        </Button>

                        <Button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            variant="outline"
                            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                            キャンセル
                        </Button>
                    </div>

                    {selectedFields.length === 0 && (
                        <p className="text-xs text-center text-amber-600">
                            適用する項目を選択してください
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
