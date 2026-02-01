"use client";

import { updateJob, deleteJobFile, deleteLegacyJobFile, extractJobDataFromFile, processExtractedJobData } from "../../../actions";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Job = {
    id: string;
    title: string;
    job_code?: string;
    area: string;
    type: string;
    salary: string;
    category: string;
    tags: string[] | null;
    pdf_url?: string | null;
    client_id?: string | null;
    description?: string;
    requirements?: string;
    working_hours?: string;
    holidays?: string;
    benefits?: string;
    selection_process?: string;
    job_attachments?: {
        id: string;
        file_name: string;
        file_url: string;
        file_size: number;
    }[];
};

import FileUploader from "@/components/admin/FileUploader";
import ClientSelect from "@/components/admin/ClientSelect";

import TemplateSelect from "@/components/admin/TemplateSelect";
import TimePicker from "@/components/admin/TimePicker";
import AreaSelect from "@/components/admin/AreaSelect";
import SalaryInput from "@/components/admin/SalaryInput";
import SelectionProcessBuilder from "@/components/admin/SelectionProcessBuilder";
import TagSelector from "@/components/admin/TagSelector";
import JobAIRefineButton from "@/components/admin/JobAIRefineButton";
import { ExtractedJobData } from "../../../actions";

export default function EditJobForm({ job }: { job: Job }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    // Controlled inputs with initial values
    const [title, setTitle] = useState(job.title || "");
    const [area, setArea] = useState(job.area || "");
    const [salary, setSalary] = useState(job.salary || "");
    const [description, setDescription] = useState(job.description || "");
    const [requirements, setRequirements] = useState(job.requirements || "");
    const [workingHours, setWorkingHours] = useState(job.working_hours || "");
    const [holidays, setHolidays] = useState(job.holidays || "");
    const [benefits, setBenefits] = useState(job.benefits || "");
    const [selectionProcess, setSelectionProcess] = useState(job.selection_process || "");
    // Initialize tags as JSON string or empty string
    const [tags, setTags] = useState(job.tags && job.tags.length > 0 ? JSON.stringify(job.tags) : "");

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);

        if (files.length > 0) {
            files.forEach(file => {
                formData.append("pdf_files", file);
            });
        }

        // Append controlled values
        formData.set("title", title);
        formData.set("area", area);
        formData.set("salary", salary);
        formData.set("description", description);
        formData.set("requirements", requirements);
        formData.set("working_hours", workingHours);
        formData.set("holidays", holidays);
        formData.set("benefits", benefits);
        formData.set("selection_process", selectionProcess);

        const result = await updateJob(job.id, formData);
        setIsLoading(false);

        if (result?.error) {
            toast.error("求人の更新に失敗しました", {
                description: result.error,
            });
        } else {
            toast.success("求人を更新しました！", {
                description: "求人一覧ページに移動します",
            });
            router.push("/admin/jobs");
            router.refresh();
        }
    };

    const handleReAnalyze = async (fileUrl: string) => {
        const loadingToast = toast.loading("AIが分析中です...");
        try {
            // 1. Extract
            const extractResult = await extractJobDataFromFile(fileUrl, 'standard');
            if (extractResult.error) throw new Error(extractResult.error);
            if (!extractResult.data) throw new Error("データの抽出に失敗しました");

            // 2. Process
            const { processedData } = await processExtractedJobData(extractResult.data);

            // 3. Update State
            if (processedData.title) setTitle(processedData.title);
            if (processedData.area) setArea(processedData.area);
            if (processedData.salary) setSalary(processedData.salary);
            if (processedData.description) setDescription(processedData.description);
            if (processedData.working_hours) setWorkingHours(processedData.working_hours);
            if (processedData.selection_process) setSelectionProcess(processedData.selection_process);

            // Tags (Array to JSON/String)
            if (processedData.tags) {
                // Merge or replace? Let's replace as it's a re-analysis
                setTags(JSON.stringify(processedData.tags));
            }
            if (processedData.requirements && Array.isArray(processedData.requirements)) {
                // requirements input expects comma separated string in this form? 
                // Wait, EditJobForm uses "TagSelector" which might expect JSON string IF category is provided?
                // Looking at render: <TagSelector category="requirements" value={requirements} ... />
                // TagSelector: if category is present, it likely handles arrays?
                // But the state `requirements` is initialized as string.
                // Let's check `createJob` logic.
                // In `createJob`, `requirements` is `formData.get("requirements") as string`.
                // In `TagSelector`, let's check its behavior.
                // It likely serializes to JSON string if it's a tag selector.
                // BUT `requirements`, `holidays`, `benefits` in DB are usually TEXT or JSON?
                // In Supabase `jobs` table schema (implied):
                // `job.requirements` is string (from `job.requirements || ""`).
                // `TagSelector` likely takes a string (JSON or comma) and returns a string (JSON).
                // So I should JSON.stringify the array.
                setRequirements(JSON.stringify(processedData.requirements));
            } else if (processedData.requirements) {
                // Fallback if string
                setRequirements(String(processedData.requirements));
            }

            if (processedData.holidays) setHolidays(JSON.stringify(processedData.holidays));
            if (processedData.benefits) setBenefits(JSON.stringify(processedData.benefits));

            toast.success("AI分析が完了しました", { id: loadingToast, description: "フォームの内容を更新しました" });

        } catch (error) {
            console.error(error);
            toast.error("分析エラー", { id: loadingToast, description: error instanceof Error ? error.message : "不明なエラー" });
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">お仕事ID（自動発行）</label>
                    <input
                        name="job_code"
                        defaultValue={job.job_code}
                        readOnly
                        className="w-full h-12 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-500 focus:outline-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">求人タイトル</label>
                    <input
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">求人票・画像</label>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-sm text-orange-800 mb-2">
                    <p className="font-bold mb-1">💡 NEW: 登録済みファイルからAI再読み込みが可能になりました</p>
                    <p className="text-xs">ファイルリストの「AI読込」ボタンを押すと、そのファイルの内容で現在の入力フォームを上書きします。</p>
                </div>
                <FileUploader
                    onFileSelect={(files) => setFiles(files)}
                    currentFiles={[
                        ...(job.job_attachments?.map(a => ({
                            id: a.id,
                            name: a.file_name,
                            url: a.file_url,
                            size: a.file_size
                        })) || []),
                        ...(job.pdf_url ? [{ id: "legacy_pdf", name: "Legacy PDF", url: job.pdf_url }] : [])
                    ]}
                    multiple={true}
                    onDeleteFile={async (fileId) => {
                        if (fileId === "legacy_pdf") {
                            const result = await deleteLegacyJobFile(job.id);
                            if (result?.error) {
                                toast.error(result.error);
                            } else {
                                toast.success("ファイルを削除しました");
                                router.refresh();
                            }
                        } else {
                            const result = await deleteJobFile(fileId);
                            if (result?.error) {
                                toast.error(result.error);
                            } else {
                                toast.success("ファイルを削除しました");
                                router.refresh();
                            }
                        }
                    }}
                    onAnalyzeFile={handleReAnalyze}
                    accept={{
                        "application/pdf": [".pdf"],
                        "image/jpeg": [".jpg", ".jpeg"],
                        "image/png": [".png"],
                    }}
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">エリア</label>
                    <AreaSelect value={area} onChange={setArea} />
                    <input type="hidden" name="area" value={area} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">雇用形態</label>
                    <select
                        name="type"
                        defaultValue={job.type}
                        required
                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                        <option value="派遣">派遣</option>
                        <option value="正社員">正社員</option>
                        <option value="紹介予定派遣">紹介予定派遣</option>
                        <option value="契約社員">契約社員</option>
                        <option value="アルバイト・パート">アルバイト・パート</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">給与</label>
                    <SalaryInput value={salary} onChange={setSalary} />
                    <input type="hidden" name="salary" value={salary} required />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">職種カテゴリー</label>
                    <select
                        name="category"
                        defaultValue={job.category}
                        required
                        className="w-full h-12 rounded-lg border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                        <option value="事務">事務</option>
                        <option value="コールセンター">コールセンター</option>
                        <option value="営業">営業</option>
                        <option value="IT・エンジニア">IT・エンジニア</option>
                        <option value="クリエイティブ">クリエイティブ</option>
                        <option value="販売・接客">販売・接客</option>
                        <option value="その他">その他</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">タグ</label>
                <TagSelector
                    category="tags"
                    value={tags}
                    onChange={setTags}
                    placeholder="タグを追加..."
                />
                <input type="hidden" name="tags" value={tags} />
            </div>

            {/* AI Refine Button */}
            <div className="pt-2">
                <JobAIRefineButton
                    currentData={{
                        title,
                        area,
                        salary,
                        description,
                        requirements: requirements ? (requirements.startsWith('[') ? JSON.parse(requirements) : requirements.split(' ')) : [],
                        working_hours: workingHours,
                        holidays: holidays ? (holidays.startsWith('[') ? JSON.parse(holidays) : holidays.split(' ')) : [],
                        benefits: benefits ? (benefits.startsWith('[') ? JSON.parse(benefits) : benefits.split(' ')) : [],
                        selection_process: selectionProcess,
                    }}
                    onRefined={(data) => {
                        if (data.title) setTitle(data.title);
                        if (data.description) setDescription(data.description);
                        if (data.requirements) {
                            const req = Array.isArray(data.requirements) ? data.requirements : [data.requirements];
                            setRequirements(JSON.stringify(req));
                        }
                        if (data.working_hours) setWorkingHours(data.working_hours);
                        if (data.holidays) {
                            const hol = Array.isArray(data.holidays) ? data.holidays : [data.holidays];
                            setHolidays(JSON.stringify(hol));
                        }
                        if (data.benefits) {
                            const ben = Array.isArray(data.benefits) ? data.benefits : [data.benefits];
                            setBenefits(JSON.stringify(ben));
                        }
                        if (data.selection_process) setSelectionProcess(data.selection_process);
                    }}
                />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-lg text-slate-800">詳細情報</h3>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">仕事内容</label>
                    <textarea
                        name="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="詳しい業務内容を入力してください"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 mb-1 block">応募資格・条件</label>
                    <TagSelector
                        category="requirements"
                        value={requirements}
                        onChange={setRequirements}
                        placeholder="応募資格タグを追加..."
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-bold text-slate-700">勤務時間</label>
                        <TemplateSelect category="working_hours" onSelect={(v) => setWorkingHours(v)} />
                    </div>
                    <TimePicker onSetTime={(v) => setWorkingHours(v)} />
                    <textarea
                        name="working_hours"
                        value={workingHours}
                        onChange={(e) => setWorkingHours(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="例：9:00〜18:00（休憩1時間）"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 mb-1 block">休日・休暇</label>
                    <TagSelector
                        category="holidays"
                        value={holidays}
                        onChange={setHolidays}
                        placeholder="休日・休暇タグを追加..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 mb-1 block">福利厚生</label>
                    <TagSelector
                        category="benefits"
                        value={benefits}
                        onChange={setBenefits}
                        placeholder="福利厚生タグを追加..."
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-bold text-slate-700">選考プロセス</label>
                        <TemplateSelect category="selection_process" onSelect={(v) => setSelectionProcess(v)} />
                    </div>
                    <SelectionProcessBuilder value={selectionProcess} onChange={setSelectionProcess} />
                    <textarea
                        name="selection_process"
                        value={selectionProcess}
                        onChange={(e) => setSelectionProcess(e.target.value)}
                        className="hidden"
                    />
                </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-700">求人元（取引先）<span className="text-xs font-normal text-slate-500 ml-2">※非公開</span></label>
                <ClientSelect name="client_id" defaultValue={job.client_id} />
            </div>

            <div className="pt-4">
                <Button
                    type="submit"
                    className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-bold"
                    disabled={isLoading}
                >
                    {isLoading ? "更新中..." : "求人を更新する"}
                </Button>
            </div>
        </form>
    );
}
