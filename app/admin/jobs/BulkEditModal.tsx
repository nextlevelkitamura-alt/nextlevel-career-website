"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { CANONICAL_JOB_CATEGORIES } from "@/utils/jobCategory";
import HourlyWageInput from "@/components/admin/HourlyWageInput";
import AttireSelector from "@/components/admin/AttireSelector";
import TagSelector from "@/components/admin/TagSelector";
import { bulkUpdateJobs } from "../actions/jobs";

type BulkEditJob = {
    id: string;
    title: string;
    category: string[] | string | null;
    type: string | null;
    salary: string | null;
    hourly_wage: number | null;
    salary_type: string | null;
    attire_type: string | null;
    hair_style: string | null;
    commute_allowance: string | null;
    working_hours: string | null;
    tags: string[] | null;
};

type FieldKey =
    | "category"
    | "hourly_wage"
    | "type"
    | "attire"
    | "commute_allowance"
    | "working_hours"
    | "tags";

const FIELD_OPTIONS: { key: FieldKey; label: string }[] = [
    { key: "category", label: "職種カテゴリ" },
    { key: "hourly_wage", label: "時給" },
    { key: "type", label: "雇用形態" },
    { key: "attire", label: "服装・髪型" },
    { key: "commute_allowance", label: "交通費" },
    { key: "working_hours", label: "勤務時間" },
    { key: "tags", label: "タグ（特徴）" },
];

const JOB_TYPES = ["派遣", "正社員", "契約社員", "パート・アルバイト", "紹介予定派遣"];

interface BulkEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedJobs: BulkEditJob[];
}

// 選択された求人の値を集計して、全て同じなら値を返す
function getCommonValue<T>(jobs: BulkEditJob[], getter: (j: BulkEditJob) => T): T | "mixed" {
    if (jobs.length === 0) return "mixed";
    const first = JSON.stringify(getter(jobs[0]));
    for (let i = 1; i < jobs.length; i++) {
        if (JSON.stringify(getter(jobs[i])) !== first) return "mixed";
    }
    return getter(jobs[0]);
}

export default function BulkEditModal({ open, onOpenChange, selectedJobs }: BulkEditModalProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [enabledFields, setEnabledFields] = useState<Set<FieldKey>>(new Set());

    // 各フィールドの値
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [salary, setSalary] = useState("");
    const [jobType, setJobType] = useState("");
    const [attireType, setAttireType] = useState("");
    const [hairStyle, setHairStyle] = useState("");
    const [commuteAllowance, setCommuteAllowance] = useState("");
    const [workingHours, setWorkingHours] = useState("");
    const [tagsValue, setTagsValue] = useState("[]");

    // 共通値の算出
    const commonValues = useMemo(() => ({
        category: getCommonValue(selectedJobs, (j) => {
            const cat = j.category;
            if (Array.isArray(cat)) return cat;
            if (typeof cat === "string") return [cat];
            return [];
        }),
        salary: getCommonValue(selectedJobs, (j) => j.salary ?? ""),
        type: getCommonValue(selectedJobs, (j) => j.type ?? ""),
        attire_type: getCommonValue(selectedJobs, (j) => j.attire_type ?? ""),
        hair_style: getCommonValue(selectedJobs, (j) => j.hair_style ?? ""),
        commute_allowance: getCommonValue(selectedJobs, (j) => j.commute_allowance ?? ""),
        working_hours: getCommonValue(selectedJobs, (j) => j.working_hours ?? ""),
        tags: getCommonValue(selectedJobs, (j) => j.tags ?? []),
    }), [selectedJobs]);

    function toggleField(key: FieldKey) {
        setEnabledFields((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
                // フィールド有効時にデフォルト値をセット
                initFieldValue(key);
            }
            return next;
        });
    }

    function initFieldValue(key: FieldKey) {
        switch (key) {
            case "category": {
                const v = commonValues.category;
                setSelectedCategories(v === "mixed" ? [] : v);
                break;
            }
            case "hourly_wage": {
                const v = commonValues.salary;
                setSalary(v === "mixed" ? "" : v);
                break;
            }
            case "type": {
                const v = commonValues.type;
                setJobType(v === "mixed" ? "" : v);
                break;
            }
            case "attire": {
                const va = commonValues.attire_type;
                const vh = commonValues.hair_style;
                setAttireType(va === "mixed" ? "" : va);
                setHairStyle(vh === "mixed" ? "" : vh);
                break;
            }
            case "commute_allowance": {
                const v = commonValues.commute_allowance;
                setCommuteAllowance(v === "mixed" ? "" : v);
                break;
            }
            case "working_hours": {
                const v = commonValues.working_hours;
                setWorkingHours(v === "mixed" ? "" : v);
                break;
            }
            case "tags": {
                const v = commonValues.tags;
                setTagsValue(v === "mixed" ? "[]" : JSON.stringify(v));
                break;
            }
        }
    }

    function toggleCategory(cat: string) {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    }

    function handleSave() {
        if (enabledFields.size === 0) return;

        const fieldNames = FIELD_OPTIONS.filter((f) => enabledFields.has(f.key))
            .map((f) => f.label)
            .join("、");

        if (!window.confirm(
            `${selectedJobs.length}件の求人の「${fieldNames}」を更新します。よろしいですか？`
        )) return;

        startTransition(async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fields: Record<string, any> = {};

            if (enabledFields.has("category")) {
                fields.category = selectedCategories;
            }
            if (enabledFields.has("hourly_wage")) {
                fields.salary = salary;
                // 時給の数値も更新
                const match = salary.match(/時給\s*([0-9,]+)/);
                fields.hourly_wage = match ? Number(match[1].replace(/,/g, "")) : null;
            }
            if (enabledFields.has("type")) {
                fields.type = jobType;
            }
            if (enabledFields.has("attire")) {
                fields.attire_type = attireType;
                fields.hair_style = hairStyle;
            }
            if (enabledFields.has("commute_allowance")) {
                fields.commute_allowance = commuteAllowance;
            }
            if (enabledFields.has("working_hours")) {
                fields.working_hours = workingHours;
            }
            if (enabledFields.has("tags")) {
                try {
                    fields.tags = JSON.parse(tagsValue);
                } catch {
                    fields.tags = [];
                }
            }

            const result = await bulkUpdateJobs(
                selectedJobs.map((j) => j.id),
                fields
            );

            if (result.error) {
                alert(`更新に失敗しました: ${result.error}`);
            } else {
                onOpenChange(false);
                setEnabledFields(new Set());
                router.refresh();
            }
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>一括編集</DialogTitle>
                    <DialogDescription>
                        {selectedJobs.length}件の求人を編集します。変更したい項目にチェックを入れてください。
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {/* フィールド選択 + 入力UI */}
                    {FIELD_OPTIONS.map(({ key, label }) => (
                        <div key={key} className="border border-slate-200 rounded-lg overflow-hidden">
                            {/* チェックボックスヘッダー */}
                            <button
                                type="button"
                                onClick={() => toggleField(key)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                    enabledFields.has(key)
                                        ? "bg-primary-50 border-b border-primary-200"
                                        : "bg-white hover:bg-slate-50"
                                }`}
                            >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    enabledFields.has(key)
                                        ? "bg-primary-600 border-primary-600"
                                        : "border-slate-300"
                                }`}>
                                    {enabledFields.has(key) && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className={`text-sm font-medium ${
                                    enabledFields.has(key) ? "text-primary-800" : "text-slate-700"
                                }`}>
                                    {label}
                                </span>
                                {enabledFields.has(key) && (() => {
                                    const cv = key === "category" ? commonValues.category
                                        : key === "hourly_wage" ? commonValues.salary
                                        : key === "type" ? commonValues.type
                                        : key === "attire" ? commonValues.attire_type
                                        : key === "commute_allowance" ? commonValues.commute_allowance
                                        : key === "working_hours" ? commonValues.working_hours
                                        : commonValues.tags;
                                    return cv === "mixed" ? (
                                        <span className="text-xs text-amber-600 ml-auto">複数の値があります</span>
                                    ) : null;
                                })()}
                            </button>

                            {/* 入力UI */}
                            {enabledFields.has(key) && (
                                <div className="px-4 py-3 bg-white">
                                    {key === "category" && (
                                        <div className="flex flex-wrap gap-2">
                                            {CANONICAL_JOB_CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => toggleCategory(cat)}
                                                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                                        selectedCategories.includes(cat)
                                                            ? "bg-primary-600 text-white border-primary-600"
                                                            : "bg-white text-slate-600 border-slate-300 hover:border-primary-400"
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {key === "hourly_wage" && (
                                        <HourlyWageInput value={salary} onChange={setSalary} />
                                    )}

                                    {key === "type" && (
                                        <select
                                            value={jobType}
                                            onChange={(e) => setJobType(e.target.value)}
                                            className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="">選択してください</option>
                                            {JOB_TYPES.map((t) => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    )}

                                    {key === "attire" && (
                                        <AttireSelector
                                            attireValue={attireType}
                                            hairValue={hairStyle}
                                            onAttireChange={setAttireType}
                                            onHairChange={setHairStyle}
                                        />
                                    )}

                                    {key === "commute_allowance" && (
                                        <input
                                            type="text"
                                            value={commuteAllowance}
                                            onChange={(e) => setCommuteAllowance(e.target.value)}
                                            placeholder="例: 交通費全額支給"
                                            className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}

                                    {key === "working_hours" && (
                                        <textarea
                                            value={workingHours}
                                            onChange={(e) => setWorkingHours(e.target.value)}
                                            placeholder="例: 9:00〜18:00（休憩60分）"
                                            rows={3}
                                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    )}

                                    {key === "tags" && (
                                        <TagSelector
                                            category="tags"
                                            value={tagsValue}
                                            onChange={setTagsValue}
                                            placeholder="タグを選択または作成..."
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* フッター */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        キャンセル
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isPending || enabledFields.size === 0}
                        className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                更新中...
                            </>
                        ) : (
                            `${selectedJobs.length}件を更新`
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
