"use client";

import { createJob, getDraftFiles } from "../../actions";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ExternalLink, Maximize2, X } from "lucide-react";
import { toast } from "sonner";

import FileUploader from "@/components/admin/FileUploader";
import ClientSelect from "@/components/admin/ClientSelect";
import TemplateSelect from "@/components/admin/TemplateSelect";
import TimePicker from "@/components/admin/TimePicker";
import AreaSelect from "@/components/admin/AreaSelect";
import SalaryInput from "@/components/admin/SalaryInput";
import CategorySelect from "@/components/admin/CategorySelect";
import SelectionProcessBuilder from "@/components/admin/SelectionProcessBuilder";
import DraftFileSelector from "@/components/admin/DraftFileSelector";
import TagSelector from "@/components/admin/TagSelector";
import JobPreviewModal from "@/components/admin/JobPreviewModal";
import AiExtractButton from "@/components/admin/AiExtractButton";
import { ExtractedJobData, TagMatchResult } from "../../actions";

export default function CreateJobPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const draftId = searchParams.get("draft_id");

    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>(draftId ? [draftId] : []);

    // Preview state
    const [previewFile, setPreviewFile] = useState<{ url: string, type: string, name: string } | null>(null);
    const [isPreviewLocked, setIsPreviewLocked] = useState(true);

    // Controlled inputs for template insertion
    const [title, setTitle] = useState("");
    const [area, setArea] = useState("");
    const [salary, setSalary] = useState("");
    const [description, setDescription] = useState("");
    const [requirements, setRequirements] = useState("");
    const [workingHours, setWorkingHours] = useState("");
    const [holidays, setHolidays] = useState("");
    const [benefits, setBenefits] = useState("");
    const [selectionProcess, setSelectionProcess] = useState("");
    const [jobType, setJobType] = useState("派遣");
    const [category, setCategory] = useState("事務");
    const [tags, setTags] = useState("");

    // Job Preview Modal
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    // AI Extraction handler
    const handleAiExtracted = (data: ExtractedJobData, matchResults: {
        requirements: TagMatchResult[];
        holidays: TagMatchResult[];
        benefits: TagMatchResult[];
    }) => {
        // Set basic fields
        if (data.title) setTitle(data.title);
        if (data.area) setArea(data.area);
        if (data.salary) setSalary(data.salary);
        if (data.description) setDescription(data.description);
        if (data.working_hours) setWorkingHours(data.working_hours);
        if (data.selection_process) setSelectionProcess(data.selection_process);
        if (data.type) setJobType(data.type);
        if (data.category) setCategory(data.category);
        if (data.tags) setTags(JSON.stringify(data.tags));

        // Handle tag-based fields with smart matching
        // For requirements: use exact/similar matches where available, otherwise use original
        const matchedRequirements = matchResults.requirements
            .map(r => r.option?.value || r.original)
            .join(' ');
        if (matchedRequirements) setRequirements(matchedRequirements);

        // For holidays
        const matchedHolidays = matchResults.holidays
            .map(h => h.option?.value || h.original)
            .join(' ');
        if (matchedHolidays) setHolidays(matchedHolidays);

        // For benefits
        const matchedBenefits = matchResults.benefits
            .map(b => b.option?.value || b.original)
            .join(' ');
        if (matchedBenefits) setBenefits(matchedBenefits);
    };

    // Fetch draft file info if draft_id is provided
    useEffect(() => {
        if (draftId) {
            const fetchDraftInfo = async () => {
                try {
                    const drafts = await getDraftFiles();
                    const draft = drafts.find(d => d.id === draftId);
                    if (draft) {
                        setPreviewFile({
                            url: draft.file_url,
                            type: draft.file_type || "",
                            name: draft.file_name
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch draft info", error);
                }
            };
            fetchDraftInfo();
        }
    }, [draftId]);

    const handleDraftSelectionChange = async (ids: string[]) => {
        setSelectedDraftIds(ids);

        // If IDs changed and we have a new ID, maybe preview the newest one?
        if (ids.length > 0) {
            const lastId = ids[ids.length - 1];
            try {
                const drafts = await getDraftFiles();
                const draft = drafts.find(d => d.id === lastId);
                if (draft) {
                    setPreviewFile({
                        url: draft.file_url,
                        type: draft.file_type || "",
                        name: draft.file_name
                    });
                }
            } catch { }
        } else {
            setPreviewFile(null);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);

        if (files.length > 0) {
            files.forEach(file => {
                formData.append("pdf_files", file);
            });
        }

        // Append pre-registered file IDs
        selectedDraftIds.forEach(id => {
            formData.append("draft_file_ids", id);
        });

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

        const result = await createJob(formData);
        setIsLoading(false);

        if (result?.error) {
            toast.error("求人登録に失敗しました", {
                description: result.error,
            });
        } else {
            toast.success("求人を登録しました！", {
                description: "求人一覧ページに移動します",
            });
            router.push("/admin/jobs");
        }
    };

    return (
        <div className={`p-4 ${previewFile && isPreviewLocked ? "max-w-[1600px] mx-auto" : "max-w-4xl mx-auto"}`}>
            <div className={`flex flex-col ${previewFile && isPreviewLocked ? "lg:flex-row gap-8" : ""}`}>
                {/* Split View: Left Side Preview */}
                {previewFile && isPreviewLocked && (
                    <div className="w-full lg:w-1/2 lg:sticky lg:top-8 h-[60vh] lg:h-[calc(100vh-64px)] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xl flex flex-col mb-8 lg:mb-0">
                        <div className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center bg-opacity-95 backdrop-blur-md">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center flex-shrink-0">
                                    <Maximize2 className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-sm font-bold truncate">{previewFile.name}</span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                                    onClick={() => setIsPreviewLocked(false)}
                                    title="プレビューを閉じる"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-400/20">
                            {previewFile.type.includes("pdf") ? (
                                <iframe
                                    src={previewFile.url}
                                    className="w-full h-full border-none"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="flex items-center justify-center p-8 min-h-full">
                                    <img src={previewFile.url} alt="Preview" className="max-w-full rounded shadow-2xl bg-white" />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className={`flex-1 ${previewFile && isPreviewLocked ? "" : "w-full max-w-2xl mx-auto"}`}>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">求人新規作成</h1>
                            <p className="text-sm text-slate-500 mt-1">求人内容を入力して公開してください</p>
                        </div>
                        <div className="flex gap-2">
                            {previewFile && !isPreviewLocked && (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsPreviewLocked(true)}
                                    className="border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100"
                                >
                                    <Maximize2 className="w-4 h-4 mr-2" />
                                    プレビューを表示
                                </Button>
                            )}
                            <Link href="/admin/jobs">
                                <Button variant="outline">キャンセル</Button>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <form action={handleSubmit} className="space-y-8">
                            {/* Pre-registered files section */}
                            <div className="space-y-4 pb-8 border-b border-slate-100">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">求人資料を紐付け</h3>
                                    <Link href="/admin/jobs/pre-registration" className="text-xs text-primary-600 font-bold hover:underline flex items-center gap-1 bg-primary-50 px-2 py-1 rounded">
                                        <span>事前登録ページを開く</span>
                                        <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>

                                <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">新規アップロード</p>
                                        <FileUploader
                                            onFileSelect={(files) => setFiles(files)}
                                            multiple={true}
                                            accept={{
                                                "application/pdf": [".pdf"],
                                                "image/jpeg": [".jpg", ".jpeg"],
                                                "image/png": [".png"],
                                            }}
                                        />
                                    </div>

                                    <div className="pt-6 border-t border-slate-200/60">
                                        <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">事前登録ファイルから選択</p>
                                        <DraftFileSelector
                                            onSelectionChange={handleDraftSelectionChange}
                                            initialSelectedIds={selectedDraftIds}
                                        />
                                    </div>

                                    {/* AI Auto-fill Button */}
                                    {previewFile && (
                                        <div className="pt-6 border-t border-slate-200/60">
                                            <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">AI自動入力</p>
                                            <AiExtractButton
                                                fileUrl={previewFile.url}
                                                fileName={previewFile.name}
                                                onExtracted={handleAiExtracted}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">求人タイトル</label>
                                    <input
                                        name="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                        className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="例：【未経験OK】一般事務スタッフ"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">エリア</label>
                                        <AreaSelect value={area} onChange={setArea} />
                                        <input type="hidden" name="area" value={area} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">雇用形態</label>
                                        <select
                                            name="type"
                                            value={jobType}
                                            onChange={(e) => setJobType(e.target.value)}
                                            required
                                            className="w-full h-12 rounded-xl border border-slate-300 px-4 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                        >
                                            <option value="派遣">派遣</option>
                                            <option value="正社員">正社員</option>
                                            <option value="紹介予定派遣">紹介予定派遣</option>
                                            <option value="契約社員">契約社員</option>
                                            <option value="アルバイト・パート">アルバイト・パート</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">給与</label>
                                        <SalaryInput value={salary} onChange={setSalary} />
                                        <input type="hidden" name="salary" value={salary} required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">職種カテゴリー</label>
                                        <CategorySelect
                                            value={category}
                                            onChange={setCategory}
                                            name="category"
                                        />
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
                                    {/* Ensure form submission gets the value */}
                                    <input type="hidden" name="tags" value={tags} />
                                </div>
                            </div>

                            <div className="space-y-6 pt-8 border-t border-slate-100">
                                <h3 className="font-bold text-lg text-slate-800">募集要項</h3>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">仕事内容</label>
                                    <textarea
                                        name="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={6}
                                        className="w-full rounded-xl border border-slate-300 p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-sans leading-relaxed"
                                        placeholder="具体的な業務内容、チーム構成などを入力してください"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">応募資格・条件</label>
                                    <TagSelector
                                        category="requirements"
                                        value={requirements}
                                        onChange={setRequirements}
                                        placeholder="応募資格タグを追加..."
                                        description="必須スキルや歓迎スキルを選択、または入力して作成してください。"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold text-slate-700">勤務時間</label>
                                        <TemplateSelect category="working_hours" onSelect={(v) => setWorkingHours(v)} />
                                    </div>
                                    <TimePicker onSetTime={(v) => setWorkingHours(v)} />
                                    <textarea
                                        name="working_hours"
                                        value={workingHours}
                                        onChange={(e) => setWorkingHours(e.target.value)}
                                        rows={2}
                                        className="w-full rounded-xl border border-slate-300 p-4 focus:outline-none focus:ring-2 focus:ring-primary-500 font-sans"
                                        placeholder="例：9:00〜18:00（休憩60分、実働8時間）"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">休日・休暇</label>
                                    <TagSelector
                                        category="holidays"
                                        value={holidays}
                                        onChange={setHolidays}
                                        placeholder="休日・休暇タグを追加..."
                                        description="土日祝休み、夏季休暇などを選択してください。"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 mb-1 block">福利厚生</label>
                                    <TagSelector
                                        category="benefits"
                                        value={benefits}
                                        onChange={setBenefits}
                                        placeholder="福利厚生タグを追加..."
                                        description="社会保険、交通費などを選択してください。"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
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

                            <div className="space-y-2 pt-8 border-t border-slate-100">
                                <label className="text-sm font-bold text-slate-700">求人元（取引先）<span className="text-xs font-normal text-slate-400 ml-2">※求職者には公開されません</span></label>
                                <ClientSelect name="client_id" />
                            </div>

                            <div className="pt-6 space-y-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsPreviewModalOpen(true)}
                                    className="w-full h-12 border-2 border-primary-300 text-primary-700 font-bold hover:bg-primary-50"
                                >
                                    プレビューを確認
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white font-black text-lg shadow-lg shadow-primary-200 transition-all active:scale-[0.98]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? "作成中..." : "求人を登録して公開する"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Job Preview Modal */}
            <JobPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                data={{
                    title,
                    area,
                    salary,
                    type: jobType,
                    category,
                    tags: tags ? (tags.startsWith('[') ? JSON.parse(tags) : [tags]) : [],
                    description,
                    requirements,
                    workingHours,
                    holidays,
                    benefits,
                    selectionProcess,
                }}
            />
        </div>
    );
}
