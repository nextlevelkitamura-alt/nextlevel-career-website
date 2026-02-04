"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { updateDraftJob } from "@/app/admin/actions";
import { toast } from "sonner";
import TagSelector from "./TagSelector";
import AreaSelect from "./AreaSelect";
import SalaryInput from "./SalaryInput";
import SalaryTypeSelector from "./SalaryTypeSelector";
import MonthlySalarySelector from "./MonthlySalarySelector";
import HourlyWageInput from "./HourlyWageInput";
import AttireSelector from "./AttireSelector";
import { DraftJob } from "@/utils/types";

interface DraftJobEditorProps {
    draftJob: DraftJob;
    onClose: () => void;
    onUpdate: () => void;
}

export default function DraftJobEditor({ draftJob, onClose, onUpdate }: DraftJobEditorProps) {
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState(draftJob.title || "");
    const [area, setArea] = useState(draftJob.area || "");
    const [type, setType] = useState(draftJob.type || "");
    const [salary, setSalary] = useState(draftJob.salary || "");
    const [category, setCategory] = useState(draftJob.category || "");
    const [tags, setTags] = useState(draftJob.tags && draftJob.tags.length > 0 ? JSON.stringify(draftJob.tags) : "");
    const [description, setDescription] = useState(draftJob.description || "");
    const [requirements, setRequirements] = useState(draftJob.requirements || "");
    const [workingHours, setWorkingHours] = useState(draftJob.working_hours || "");
    const [holidays, setHolidays] = useState(draftJob.holidays || "");
    const [benefits, setBenefits] = useState(draftJob.benefits || "");
    const [selectionProcess, setSelectionProcess] = useState(draftJob.selection_process || "");
    const [nearestStation, setNearestStation] = useState(draftJob.nearest_station || "");
    const [locationNotes, setLocationNotes] = useState(draftJob.location_notes || "");
    const [salaryType, setSalaryType] = useState(draftJob.salary_type || "");
    const [attireType, setAttireType] = useState(draftJob.attire_type || "");
    const [hairStyle, setHairStyle] = useState(draftJob.hair_style || "");
    const [raiseInfo, setRaiseInfo] = useState(draftJob.raise_info || "");
    const [bonusInfo, setBonusInfo] = useState(draftJob.bonus_info || "");
    const [commuteAllowance, setCommuteAllowance] = useState(draftJob.commute_allowance || "");
    const [jobCategoryDetail, setJobCategoryDetail] = useState(draftJob.job_category_detail || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.set("title", title);
        formData.set("area", area);
        formData.set("type", type);
        formData.set("salary", salary);
        formData.set("category", category);
        formData.set("tags", tags);
        formData.set("description", description);
        formData.set("requirements", requirements);
        formData.set("working_hours", workingHours);
        formData.set("holidays", holidays);
        formData.set("benefits", benefits);
        formData.set("selection_process", selectionProcess);
        formData.set("nearest_station", nearestStation);
        formData.set("location_notes", locationNotes);
        formData.set("salary_type", salaryType);
        formData.set("attire_type", attireType);
        formData.set("hair_style", hairStyle);
        formData.set("raise_info", raiseInfo);
        formData.set("bonus_info", bonusInfo);
        formData.set("commute_allowance", commuteAllowance);
        formData.set("job_category_detail", jobCategoryDetail);

        const result = await updateDraftJob(draftJob.id, formData);
        setIsLoading(false);

        if (result.error) {
            toast.error("更新に失敗しました", {
                description: result.error,
            });
        } else {
            toast.success("下書きを更新しました！");
            onUpdate();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-900">下書きを編集</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                タイトル <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                職種カテゴリ
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">選択してください</option>
                                <option value="事務">事務</option>
                                <option value="営業">営業</option>
                                <option value="販売">販売</option>
                                <option value="サービス">サービス</option>
                                <option value="IT">IT</option>
                                <option value="その他">その他</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AreaSelect value={area} onChange={setArea} />
                        <SalaryTypeSelector value={salaryType} onChange={setSalaryType} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            給与
                        </label>
                        {salaryType === "月給制" ? (
                            <MonthlySalarySelector value={salary} onChange={setSalary} />
                        ) : salaryType === "時給制" ? (
                            <HourlyWageInput value={salary} onChange={setSalary} />
                        ) : (
                            <SalaryInput value={salary} onChange={setSalary} />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            雇用形態
                        </label>
                        <div className="flex gap-2">
                            {["正社員", "派遣", "紹介予定派遣", "契約社員", "パート・アルバイト"].map((empType) => (
                                <button
                                    key={empType}
                                    type="button"
                                    onClick={() => setType(empType)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg border transition-colors",
                                        type === empType
                                            ? "border-primary-500 bg-primary-50 text-primary-700"
                                            : "border-slate-300 hover:border-slate-400"
                                    )}
                                >
                                    {empType}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <TagSelector category="tags" value={tags} onChange={setTags} />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            仕事内容
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Requirements */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            応募資格・条件
                        </label>
                        <textarea
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Working Hours */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            勤務時間
                        </label>
                        <input
                            type="text"
                            value={workingHours}
                            onChange={(e) => setWorkingHours(e.target.value)}
                            placeholder="例: 9:00〜18:00（休憩1時間）"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Holidays */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            休日・休暇
                        </label>
                        <textarea
                            value={holidays}
                            onChange={(e) => setHolidays(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Benefits */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            福利厚生
                        </label>
                        <textarea
                            value={benefits}
                            onChange={(e) => setBenefits(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Selection Process */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            選考プロセス
                        </label>
                        <textarea
                            value={selectionProcess}
                            onChange={(e) => setSelectionProcess(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Additional Details */}
                    <div className="pt-4 border-t border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 mb-3">追加情報</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">詳細職種名</label>
                                <input
                                    type="text"
                                    value={jobCategoryDetail}
                                    onChange={(e) => setJobCategoryDetail(e.target.value)}
                                    placeholder="例：化粧品・コスメ販売(店長)"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">昇給情報</label>
                                <input
                                    type="text"
                                    value={raiseInfo}
                                    onChange={(e) => setRaiseInfo(e.target.value)}
                                    placeholder="例：昇給年1回"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">賞与情報</label>
                                <input
                                    type="text"
                                    value={bonusInfo}
                                    onChange={(e) => setBonusInfo(e.target.value)}
                                    placeholder="例：賞与年2回"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">交通費</label>
                                <input
                                    type="text"
                                    value={commuteAllowance}
                                    onChange={(e) => setCommuteAllowance(e.target.value)}
                                    placeholder="例：一部支給 5万円/月"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">最寄駅</label>
                                <input
                                    type="text"
                                    value={nearestStation}
                                    onChange={(e) => setNearestStation(e.target.value)}
                                    placeholder="例：札幌駅"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-3">服装・髪型</label>
                                <AttireSelector
                                    attireValue={attireType}
                                    hairValue={hairStyle}
                                    onAttireChange={setAttireType}
                                    onHairChange={setHairStyle}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    value={nearestStation}
                                    onChange={(e) => setNearestStation(e.target.value)}
                                    placeholder="例：札幌駅"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">勤務地備考</label>
                                <input
                                    type="text"
                                    value={locationNotes}
                                    onChange={(e) => setLocationNotes(e.target.value)}
                                    placeholder="例：札幌駅徒歩5分以内"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-slate-400 transition-colors"
                        >
                            {isLoading ? "保存中..." : "保存"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(" ");
}
