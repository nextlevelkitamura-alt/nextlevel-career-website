"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, X, AlertTriangle, Check, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

const FIELD_LABELS: Record<string, string> = {
    title: "タイトル",
    description: "仕事内容",
    requirements: "応募資格・条件",
    working_hours: "勤務時間",
    holidays: "休日・休暇",
    benefits: "福利厚生",
    period: "雇用期間",
    start_date: "就業開始時期",
    salary_type: "給与形態",
    hourly_wage: "時給（検索用）",
    salary_description: "給与詳細",
    raise_info: "昇給情報",
    bonus_info: "賞与情報",
    commute_allowance: "交通費情報",
    nearest_station: "最寄駅",
    location_notes: "勤務地備考",
    workplace_name: "勤務先名",
    workplace_address: "勤務地住所",
    workplace_access: "アクセス",
    selection_process: "選考プロセス",
    attire_type: "服装",
    hair_style: "髪型",
    attire: "服装・髪型（まとめ）",
    tags: "タグ",
    job_category_detail: "詳細職種名",
};

interface RefinementPreviewProps {
    originalFields: Record<string, unknown>;
    proposedFields: Record<string, unknown>;
    changedFields: string[];
    onApply: (selectedFields?: string[]) => void;  // 選択されたフィールドのリストを受け取る
    onRedo: () => void;
    onCancel: () => void;
    isApplying?: boolean;
    warnings?: string[];
    enableFieldSelection?: boolean;  // 項目別認証UIを有効にするフラグ
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return "（未設定）";
    if (Array.isArray(value)) {
        if (value.length === 0) return "（なし）";
        return value.join(", ");
    }
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

function hasDrasticChange(fieldName: string, original: unknown, proposed: unknown): boolean {
    // Check for drastic changes in numeric fields
    if (fieldName === "hourly_wage" && typeof original === "number" && typeof proposed === "number") {
        const diff = Math.abs(original - proposed);
        const percentChange = (diff / original) * 100;
        return percentChange > 30; // More than 30% change is drastic
    }

    // Check for required fields becoming empty
    const requiredFields = ["title", "area", "salary", "category"];
    if (requiredFields.includes(fieldName)) {
        return !proposed && proposed !== 0;
    }

    return false;
}

export default function RefinementPreview({
    originalFields,
    proposedFields,
    changedFields,
    onApply,
    onRedo,
    onCancel,
    isApplying = false,
    warnings = [],
    enableFieldSelection = false,
}: RefinementPreviewProps) {
    // 選択されたフィールドを管理するstate（デフォルトは全て選択）
    const [selectedFields, setSelectedFields] = useState<string[]>(
        enableFieldSelection ? changedFields : []
    );

    // 全て選択/全て解除のトグル
    const toggleAll = () => {
        if (selectedFields.length === changedFields.length) {
            setSelectedFields([]);  // 全て解除
        } else {
            setSelectedFields(changedFields);  // 全て選択
        }
    };

    // 個別フィールドのトグル
    const toggleField = (field: string) => {
        setSelectedFields(prev =>
            prev.includes(field)
                ? prev.filter(f => f !== field)
                : [...prev, field]
        );
    };

    // Auto-generate warnings for drastic changes
    const autoWarnings = [...warnings];

    for (const field of changedFields) {
        if (hasDrasticChange(field, originalFields[field], proposedFields[field])) {
            autoWarnings.push(`${FIELD_LABELS[field] || field}の変更が大きくなっています`);
        }
    }

    const hasWarnings = autoWarnings.length > 0;

    return (
        <div className="border border-purple-200 bg-purple-50 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-purple-100 px-4 py-2 border-b border-purple-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <span className="text-sm font-bold text-purple-700">修正案のプレビュー</span>
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
            <div className="max-h-[400px] overflow-y-auto">
                <div className="p-4 space-y-4">
                    {/* Warnings */}
                    {hasWarnings && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-bold text-amber-700">注意が必要な変更があります</p>
                                <ul className="text-xs text-amber-600 mt-1 space-y-1">
                                    {autoWarnings.map((warning, idx) => (
                                        <li key={idx}>• {warning}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Changed Fields */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                変更されるフィールド（{changedFields.length}件）
                            </p>
                            {enableFieldSelection && (
                                <button
                                    type="button"
                                    onClick={toggleAll}
                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    {selectedFields.length === changedFields.length ? "全て解除" : "全て選択"}
                                </button>
                            )}
                        </div>

                        {changedFields.map((field) => {
                            const label = FIELD_LABELS[field] || field;
                            const original = originalFields[field];
                            const proposed = proposedFields[field];
                            const isSelected = selectedFields.includes(field);

                            return (
                                <div
                                    key={field}
                                    className={`bg-white border rounded-lg p-3 space-y-2 transition-all ${
                                        enableFieldSelection && !isSelected
                                            ? "border-slate-200 opacity-60"
                                            : "border-slate-200"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {enableFieldSelection && (
                                            <button
                                                type="button"
                                                onClick={() => toggleField(field)}
                                                className="flex-shrink-0"
                                                title={isSelected ? "適用しない" : "適用する"}
                                            >
                                                {isSelected ? (
                                                    <Check className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-slate-300" />
                                                )}
                                            </button>
                                        )}
                                        <p className="text-xs font-bold text-slate-500">{label}</p>
                                    </div>

                                    {/* Before */}
                                    <div className="bg-red-50 border-l-2 border-red-300 px-3 py-2">
                                        <p className="text-xs text-red-600 font-medium mb-1">変更前</p>
                                        <p className="text-sm text-slate-700 line-through opacity-70">
                                            {formatValue(original)}
                                        </p>
                                    </div>

                                    {/* After */}
                                    <div className="bg-green-50 border-l-2 border-green-400 px-3 py-2">
                                        <p className="text-xs text-green-600 font-medium mb-1">変更後</p>
                                        <p className="text-sm text-slate-700 font-medium">
                                            {formatValue(proposed)}
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
                            onClick={() => onApply(enableFieldSelection ? selectedFields : undefined)}
                            disabled={isApplying || (enableFieldSelection && selectedFields.length === 0)}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-bold shadow-md hover:shadow-lg"
                        >
                            {isApplying ? (
                                <>適用中...</>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    {enableFieldSelection
                                        ? `${selectedFields.length}件を適用`
                                        : "適用する"
                                    }
                                </>
                            )}
                        </Button>

                        <Button
                            type="button"
                            onClick={onRedo}
                            disabled={isApplying}
                            variant="outline"
                            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            やり直す
                        </Button>
                    </div>

                    {enableFieldSelection && selectedFields.length === 0 && (
                        <p className="text-xs text-center text-amber-600">
                            適用する項目を選択してください
                        </p>
                    )}

                    {hasWarnings && selectedFields.length > 0 && (
                        <p className="text-xs text-center text-slate-500">
                            変更を適用する前に内容をご確認ください
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
