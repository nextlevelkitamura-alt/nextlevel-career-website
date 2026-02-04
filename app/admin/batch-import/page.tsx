"use client";

import { useState } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import BatchUploadSection from "@/components/admin/BatchUploadSection";
import DraftJobsList from "@/components/admin/DraftJobsList";
import DraftJobEditor from "@/components/admin/DraftJobEditor";
import BatchPublishButton from "@/components/admin/BatchPublishButton";
import { useRouter } from "next/navigation";
import { deleteDraftJob } from "@/app/admin/actions";
import { toast } from "sonner";
import { DraftJob } from "@/utils/types";

export default function BatchImportPage() {
    const router = useRouter();
    const [batchId, setBatchId] = useState<string | null>(null);
    const [draftJobs, setDraftJobs] = useState<DraftJob[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingJob, setEditingJob] = useState<DraftJob | null>(null);

    const handleExtractionStarted = (newBatchId: string) => {
        setBatchId(newBatchId);
        setSelectedIds([]);
        toast.success("AI抽出を開始しました", {
            description: "処理完了までしばらくお待ちください...",
        });
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((i) => i !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAll = () => {
        if (draftJobs.length === 0) return;

        const allSelected = draftJobs.every((job) => selectedIds.includes(job.id));
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(draftJobs.map((job) => job.id));
        }
    };

    const handleEdit = (draftJob: DraftJob) => {
        setEditingJob(draftJob);
    };

    const handleDelete = async (id: string) => {
        const result = await deleteDraftJob(id);
        if (result.error) {
            toast.error("削除に失敗しました", {
                description: result.error,
            });
        } else {
            toast.success("下書きを削除しました");
            // Refresh draft jobs list
            setDraftJobs((prev) => prev.filter((job) => job.id !== id));
            setSelectedIds((prev) => prev.filter((i) => i !== id));
        }
    };

    const handlePublishComplete = () => {
        setSelectedIds([]);
        setDraftJobs([]);
        setBatchId(null);
        router.push("/admin/jobs");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-orange-500" />
                                    求人一括取り込み
                                </h1>
                                <p className="text-sm text-slate-600 mt-1">
                                    AIで複数の求人を一括で抽出・公開できます
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!batchId ? (
                    /* Upload Section */
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">
                                ステップ1: ファイルアップロード
                            </h2>
                            <p className="text-sm text-slate-600 mb-6">
                                PDFまたは画像ファイルをドラッグ＆ドロップしてください。複数ファイルを一度に選択できます。
                            </p>
                            <BatchUploadSection onExtractionStarted={handleExtractionStarted} />
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-sm font-semibold text-blue-900 mb-2">
                                💡 ご利用ガイド
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• 最大10ファイルまで一度に処理できます</li>
                                <li>• 通常モード: 企業名を具体的に出力します</li>
                                <li>• 匿名モード: 企業名を伏せて抽出します</li>
                                <li>• 抽出後、内容を編集してから公開できます</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    /* Draft Jobs List */
                    <div className="space-y-6">
                        {/* Progress */}
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        ステップ2: 抽出結果の確認
                                    </h2>
                                    <p className="text-sm text-slate-600 mt-1">
                                        抽出された求人を確認し、必要に応じて編集してください
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setBatchId(null)}
                                    className="text-sm text-primary-600 hover:text-primary-700"
                                >
                                    ← 新しいバッチを開始
                                </button>
                            </div>

                            {/* Publish Button */}
                            <div className="flex justify-end">
                                <BatchPublishButton
                                    selectedIds={selectedIds}
                                    onComplete={handlePublishComplete}
                                />
                            </div>
                        </div>

                        {/* Draft Jobs List */}
                        <DraftJobsList
                            batchId={batchId}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            selectedIds={selectedIds}
                            onToggleSelect={handleToggleSelect}
                            onSelectAll={handleSelectAll}
                        />
                    </div>
                )}
            </div>

            {/* Editor Modal */}
            {editingJob && (
                <DraftJobEditor
                    draftJob={editingJob}
                    onClose={() => setEditingJob(null)}
                    onUpdate={() => {
                        setEditingJob(null);
                        // Refresh would happen here via DraftJobsList polling
                    }}
                />
            )}
        </div>
    );
}
